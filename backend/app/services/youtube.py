"""YouTube Data API v3 Integration Service.

Fetches real channel metadata, full upload history (paginated), and video statistics
using YouTube Data API v3. No fabricated or demo data is used.
"""

from datetime import date, datetime, timedelta
import json
import logging
import re
from urllib.error import HTTPError, URLError
import urllib.parse
import urllib.request

from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from ..config import YOUTUBE_API_KEY
from ..models import AudienceAnalytics, Post, PostAnalytics, SocialAccount

log = logging.getLogger("creatoriq.youtube")


def _yt_get(url: str) -> dict:
    """Execute a GET request against YouTube Data API v3 and parse JSON."""
    req = urllib.request.Request(url, headers={"User-Agent": "CreatorIQ/2.0"})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except HTTPError as err:
        body = err.read().decode("utf-8", errors="ignore")
        log.error("YouTube API HTTP %s: %s", err.code, body)
        try:
            msg = json.loads(body).get("error", {}).get("message", str(err))
        except Exception:
            msg = str(err)
        raise HTTPException(status_code=400, detail=f"YouTube API error: {msg}")
    except URLError as err:
        raise HTTPException(status_code=503, detail=f"Cannot reach YouTube API: {err.reason}")


def _parse_input(raw: str) -> tuple[str, str]:
    """Normalize user input (URL, @handle, channel ID, or search query).

    Returns (kind, value) where kind is 'handle' | 'id' | 'query'.
    """
    s = raw.strip().rstrip("/")
    # Handle full YouTube URLs
    if "youtube.com/" in s or "youtu.be/" in s:
        m_handle = re.search(r"youtube\.com/(@[^/?#]+)", s)
        if m_handle:
            return "handle", m_handle.group(1)
        m_chan = re.search(r"youtube\.com/channel/(UC[^/?#]+)", s)
        if m_chan:
            return "id", m_chan.group(1)
        m_user = re.search(r"youtube\.com/(?:c|user)/([^/?#]+)", s)
        if m_user:
            return "query", m_user.group(1)

    if s.startswith("@"):
        return "handle", s
    if s.startswith("UC") and len(s) >= 20:
        return "id", s
    return "query", s


def fetch_youtube_channel_data(
    handle_or_id: str,
    api_key: str | None = None,
    max_videos: int = 200,
) -> dict:
    """Fetch real channel info and full upload history from YouTube Data API v3."""
    key = (api_key or YOUTUBE_API_KEY or "").strip()
    if not key:
        raise HTTPException(
            status_code=400,
            detail=(
                "YouTube Data API v3 key is not configured. "
                "Add YOUTUBE_API_KEY to backend/.env or provide your API key in the YouTube Channel page."
            ),
        )

    kind, val = _parse_input(handle_or_id)

    # 1. Resolve channel
    if kind == "handle":
        url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&forHandle={urllib.parse.quote(val)}&key={key}"
        data = _yt_get(url)
        items = data.get("items", [])
    elif kind == "id":
        url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id={urllib.parse.quote(val)}&key={key}"
        data = _yt_get(url)
        items = data.get("items", [])
    else:
        # Use search.list to find channel by name/query
        s_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q={urllib.parse.quote(val)}&key={key}"
        s_data = _yt_get(s_url)
        s_items = s_data.get("items", [])
        if not s_items:
            raise HTTPException(status_code=404, detail=f"No YouTube channel found for '{handle_or_id}'.")
        cid = s_items[0]["snippet"]["channelId"]
        url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id={urllib.parse.quote(cid)}&key={key}"
        data = _yt_get(url)
        items = data.get("items", [])

    if not items:
        raise HTTPException(status_code=404, detail=f"YouTube channel '{handle_or_id}' not found.")

    item = items[0]
    snippet = item.get("snippet", {})
    stats = item.get("statistics", {})
    channel_id = item.get("id")
    uploads_id = item.get("contentDetails", {}).get("relatedPlaylists", {}).get("uploads")
    custom_url = snippet.get("customUrl") or handle_or_id

    # 2. Paginate playlistItems.list to retrieve full upload history (up to max_videos)
    vid_ids: list[str] = []
    if uploads_id:
        next_page = None
        while len(vid_ids) < max_videos:
            page_param = f"&pageToken={next_page}" if next_page else ""
            p_url = (
                f"https://www.googleapis.com/youtube/v3/playlistItems"
                f"?part=contentDetails&playlistId={uploads_id}&maxResults=50{page_param}&key={key}"
            )
            p_data = _yt_get(p_url)
            for vi in p_data.get("items", []):
                vid = vi.get("contentDetails", {}).get("videoId")
                if vid:
                    vid_ids.append(vid)
                    if len(vid_ids) >= max_videos:
                        break
            next_page = p_data.get("nextPageToken")
            if not next_page:
                break

    # 3. Batch videos.list (50 IDs per request) for real views, likes, comments
    videos: list[dict] = []
    for i in range(0, len(vid_ids), 50):
        batch = vid_ids[i : i + 50]
        v_url = (
            f"https://www.googleapis.com/youtube/v3/videos"
            f"?part=statistics,snippet&id={','.join(batch)}&key={key}"
        )
        v_data = _yt_get(v_url)
        for sv in v_data.get("items", []):
            v_snip = sv.get("snippet", {})
            v_st = sv.get("statistics", {})
            pub_str = v_snip.get("publishedAt", "")
            try:
                pub_dt = datetime.fromisoformat(pub_str.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                pub_dt = datetime.now()

            v_views = int(v_st.get("viewCount", 0))
            v_likes = int(v_st.get("likeCount", 0))
            v_comments = int(v_st.get("commentCount", 0))
            thumbs = v_snip.get("thumbnails", {})
            thumb_url = (
                thumbs.get("high", {}).get("url")
                or thumbs.get("medium", {}).get("url")
                or thumbs.get("default", {}).get("url")
                or ""
            )

            videos.append({
                "id": sv.get("id"),
                "title": v_snip.get("title", "Untitled Video"),
                "description": v_snip.get("description", ""),
                "thumbnail": thumb_url,
                "published_at": pub_dt,
                "views": v_views,
                "likes": v_likes,
                "comments": v_comments,
                "shares": 0,  # Not exposed by YouTube Data API v3
                "content_type": "video",
                "url": f"https://www.youtube.com/watch?v={sv.get('id')}",
            })

    ch_thumbs = snippet.get("thumbnails", {})
    ch_thumb = (
        ch_thumbs.get("high", {}).get("url")
        or ch_thumbs.get("medium", {}).get("url")
        or ch_thumbs.get("default", {}).get("url")
        or ""
    )

    return {
        "is_live": True,
        "channel_id": channel_id,
        "title": snippet.get("title", custom_url),
        "username": custom_url if str(custom_url).startswith("@") else f"@{custom_url}",
        "description": snippet.get("description", ""),
        "thumbnail": ch_thumb,
        "subscribers": int(stats.get("subscriberCount", 0)),
        "total_views": int(stats.get("viewCount", 0)),
        "video_count": int(stats.get("videoCount", len(videos))),
        "videos": videos,
    }


def sync_youtube_channel_to_db(
    db: Session,
    creator_id: int,
    channel_handle: str,
    api_key: str | None = None,
) -> SocialAccount:
    """Synchronizes real YouTube channel and its full video history into the database."""
    data = fetch_youtube_channel_data(channel_handle, api_key)

    account = db.scalar(
        select(SocialAccount).where(
            SocialAccount.creator_id == creator_id,
            SocialAccount.platform == "youtube",
        )
    )

    if not account:
        account = SocialAccount(
            creator_id=creator_id,
            platform="youtube",
            username=data["username"],
            platform_user_id=data["channel_id"],
            followers=data["subscribers"],
            is_active=True,
        )
        db.add(account)
        db.flush()
    else:
        # If switching to a different channel, clear old channel's posts
        if account.platform_user_id != data["channel_id"]:
            db.execute(delete(Post).where(Post.account_id == account.account_id))
            db.execute(delete(AudienceAnalytics).where(AudienceAnalytics.account_id == account.account_id))
        account.platform_user_id = data["channel_id"]
        account.username = data["username"]
        account.followers = data["subscribers"]
        account.is_active = True
        db.flush()

    # Upsert real videos & PostAnalytics
    for v in data["videos"]:
        post = db.scalar(
            select(Post).where(
                Post.account_id == account.account_id,
                Post.platform_post_id == v["id"],
            )
        )
        if not post:
            post = Post(
                account_id=account.account_id,
                platform_post_id=v["id"],
                content_type=v["content_type"],
                caption=v["title"],
                thumbnail_url=v["thumbnail"],
                post_url=v["url"],
                published_at=v["published_at"],
            )
            db.add(post)
            db.flush()
        else:
            post.caption = v["title"]
            post.thumbnail_url = v["thumbnail"]
            post.published_at = v["published_at"]

        eng_rate = round(((v["likes"] + v["comments"]) / v["views"]) * 100, 2) if v["views"] > 0 else 0.0
        if not post.analytics:
            post.analytics = PostAnalytics(
                post_id=post.post_id,
                views=v["views"],
                likes=v["likes"],
                comments=v["comments"],
                shares=0,
                engagement_rate=eng_rate,
            )
        else:
            post.analytics.views = v["views"]
            post.analytics.likes = v["likes"]
            post.analytics.comments = v["comments"]
            post.analytics.engagement_rate = eng_rate

    # Record today's real subscriber snapshot (no fabricated 14-day history)
    today = date.today()
    existing_today = db.scalar(
        select(AudienceAnalytics).where(
            AudienceAnalytics.account_id == account.account_id,
            AudienceAnalytics.date == today,
        )
    )
    if not existing_today:
        db.add(
            AudienceAnalytics(
                account_id=account.account_id,
                date=today,
                followers=account.followers,
            )
        )
    else:
        existing_today.followers = account.followers

    db.commit()
    db.refresh(account)
    return account
