"""Revenue router – manual sponsorship/affiliate income tracking."""
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..database import get_db
from ..deps import get_current_user
from ..models import Creator, SocialAccount, User

router = APIRouter(prefix="/api/revenue", tags=["Revenue"])


# In-memory store (per session) since we have no revenue table yet.
# When you add a revenue table via Alembic, swap this out.
_REVENUE_STORE: dict[int, list[dict]] = {}


def _creator_id(user: User, db: Session) -> int:
    creator = db.scalar(select(Creator).where(Creator.user_id == user.user_id))
    if not creator:
        creator = Creator(user_id=user.user_id, creator_name=user.name)
        db.add(creator)
        db.commit()
        db.refresh(creator)
    return creator.creator_id


class RevenueEntry(BaseModel):
    type: str = Field(..., pattern="^(sponsorship|affiliate|other)$")
    brand: str
    amount: float = Field(..., gt=0)
    currency: str = "INR"
    description: Optional[str] = None
    date: Optional[str] = None  # ISO date string


@router.get("/summary")
def revenue_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revenue overview: estimated AdSense + manually entered sponsorship/affiliate."""
    cid = _creator_id(current_user, db)

    # Pull total views from linked YouTube account for AdSense estimate
    account = db.scalar(
        select(SocialAccount).where(
            SocialAccount.creator_id == cid,
            SocialAccount.platform == "youtube",
        )
    )
    total_views = 0
    if account:
        from ..models import Post
        posts = db.scalars(select(Post).where(Post.account_id == account.account_id)).all()
        for p in posts:
            if p.analytics:
                total_views += p.analytics.views

    # CPM estimate: $1–$3 per 1000 views, using $2 average in INR (~83 conversion)
    est_adsense_inr = round(total_views / 1000 * 2 * 83, 2)

    manual_entries = _REVENUE_STORE.get(cid, [])
    manual_total = sum(e["amount"] for e in manual_entries)
    sponsorship_total = sum(e["amount"] for e in manual_entries if e["type"] == "sponsorship")
    affiliate_total = sum(e["amount"] for e in manual_entries if e["type"] == "affiliate")

    return {
        "est_adsense_inr": est_adsense_inr,
        "est_adsense_usd": round(total_views / 1000 * 2, 2),
        "total_views_used": total_views,
        "manual_total_inr": manual_total,
        "sponsorship_total": sponsorship_total,
        "affiliate_total": affiliate_total,
        "grand_total_inr": round(est_adsense_inr + manual_total, 2),
        "entries": manual_entries,
        "disclaimer": (
            "Estimated AdSense revenue uses a $2 CPM (cost per 1000 views) which is "
            "illustrative only. Actual YouTube revenue depends on your channel, niche, "
            "and audience location. YouTube does not expose real earnings via its public API."
        ),
    }


@router.post("/entry")
def add_revenue_entry(
    entry: RevenueEntry,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a manual sponsorship or affiliate revenue entry."""
    cid = _creator_id(current_user, db)
    record = {
        "id": len(_REVENUE_STORE.get(cid, [])) + 1,
        "type": entry.type,
        "brand": entry.brand,
        "amount": entry.amount,
        "currency": entry.currency,
        "description": entry.description or "",
        "date": entry.date or datetime.utcnow().strftime("%Y-%m-%d"),
    }
    _REVENUE_STORE.setdefault(cid, []).append(record)
    return {"status": "added", "entry": record}


@router.delete("/entry/{entry_id}")
def delete_revenue_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cid = _creator_id(current_user, db)
    entries = _REVENUE_STORE.get(cid, [])
    new_entries = [e for e in entries if e["id"] != entry_id]
    if len(new_entries) == len(entries):
        raise HTTPException(status_code=404, detail="Entry not found")
    _REVENUE_STORE[cid] = new_entries
    return {"status": "deleted"}
