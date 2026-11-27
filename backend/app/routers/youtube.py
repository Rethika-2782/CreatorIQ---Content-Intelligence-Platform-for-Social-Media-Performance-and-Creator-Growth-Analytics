"""YouTube Data API v3 router – syncs only the logged-in user's own registered channel."""
import json
import logging
import urllib.request
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import YOUTUBE_API_KEY
from ..database import get_db
from ..deps import get_current_user
from ..models import Creator, SocialAccount, User
from ..services.youtube import sync_youtube_channel_to_db

log = logging.getLogger("creatoriq.youtube.router")

router = APIRouter(prefix="/api/youtube", tags=["YouTube"])


def _get_or_create_creator(user: User, db: Session) -> Creator:
    creator = db.scalar(select(Creator).where(Creator.user_id == user.user_id))
    if not creator:
        creator = Creator(user_id=user.user_id, creator_name=user.name)
        db.add(creator)
        db.commit()
        db.refresh(creator)
    return creator


class SyncRequest(BaseModel):
    channel_handle: Optional[str] = None
    api_key: Optional[str] = None


@router.get("/test-api")
def test_youtube_api():
    """Diagnostic: test whether the YouTube API is reachable from this server."""
    key = (YOUTUBE_API_KEY or "").strip()
    if not key:
        return {"status": "error", "detail": "No YOUTUBE_API_KEY configured on server"}
    try:
        url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=@YouTube&key={key}"
        req = urllib.request.Request(url, headers={"User-Agent": "CreatorIQ/2.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        items = data.get("items", [])
        return {
            "status": "ok",
            "api_reachable": True,
            "channel_found": len(items) > 0,
            "channel_title": items[0]["snippet"]["title"] if items else None,
        }
    except Exception as e:
        return {"status": "error", "detail": f"{type(e).__name__}: {str(e)}"}


@router.post("/sync")
def sync_my_channel(
    body: SyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sync the logged-in user's own registered YouTube channel."""
    try:
        creator = _get_or_create_creator(current_user, db)
        existing = db.scalar(
            select(SocialAccount).where(
                SocialAccount.creator_id == creator.creator_id,
                SocialAccount.platform == "youtube",
            )
        )
        handle = (
            (body.channel_handle or "").strip()
            or (existing.username if existing else "")
            or (creator.website or "").strip()
        )
        if not handle:
            raise HTTPException(
                status_code=400,
                detail="No YouTube channel handle is linked to your account. Add your channel handle in My Profile.",
            )

        log.info("Starting YouTube sync for creator=%s handle=%s", creator.creator_id, handle)
        account = sync_youtube_channel_to_db(
            db, creator.creator_id, handle, body.api_key, max_videos=50
        )
        log.info("YouTube sync complete: %s posts", len(account.posts))
        return {
            "status": "success",
            "channel": account.username,
            "platform_user_id": account.platform_user_id,
            "subscribers": account.followers,
            "total_posts": len(account.posts),
            "is_live": True,
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Sync error: {type(e).__name__}: {str(e)}")


@router.delete("/disconnect")
def disconnect_channel(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove the user's linked YouTube account from the database."""
    creator = db.scalar(select(Creator).where(Creator.user_id == current_user.user_id))
    if not creator:
        raise HTTPException(status_code=404, detail="No creator profile found")
    account = db.scalar(
        select(SocialAccount).where(
            SocialAccount.creator_id == creator.creator_id,
            SocialAccount.platform == "youtube",
        )
    )
    if not account:
        raise HTTPException(status_code=404, detail="No YouTube account linked")
    db.delete(account)
    db.commit()
    return {"status": "disconnected"}
