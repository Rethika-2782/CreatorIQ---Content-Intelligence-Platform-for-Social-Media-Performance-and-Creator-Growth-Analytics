"""Reports router – CSV export of channel and video analytics."""
import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..database import get_db
from ..deps import get_current_user
from ..models import Creator, Post, SocialAccount, User

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def _get_account(user: User, db: Session):
    creator = db.scalar(select(Creator).where(Creator.user_id == user.user_id))
    if not creator:
        return None, None
    account = db.scalar(
        select(SocialAccount).where(
            SocialAccount.creator_id == creator.creator_id,
            SocialAccount.platform == "youtube",
        )
    )
    return creator, account


@router.get("/export/videos")
def export_videos_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export all video analytics as a CSV file."""
    _, account = _get_account(current_user, db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Video ID", "Title", "Published Date", "Views", "Likes", "Comments",
                     "Shares", "Engagement Rate (%)", "Watch Time (hrs)", "URL"])

    if account:
        posts = db.scalars(select(Post).where(Post.account_id == account.account_id)).all()
        for p in posts:
            a = p.analytics
            writer.writerow([
                p.platform_post_id,
                p.caption or "Untitled",
                p.published_at.strftime("%Y-%m-%d") if p.published_at else "",
                a.views if a else 0,
                a.likes if a else 0,
                a.comments if a else 0,
                a.shares if a else 0,
                f"{a.engagement_rate:.2f}" if a and a.engagement_rate else "0.00",
                f"{a.watch_time:.1f}" if a and a.watch_time else "0",
                p.post_url or f"https://youtube.com/watch?v={p.platform_post_id}",
            ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=creatoriq_videos.csv"},
    )


@router.get("/export/channel")
def export_channel_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export channel-level analytics summary as CSV."""
    _, account = _get_account(current_user, db)

    output = io.StringIO()
    writer = csv.writer(output)

    if account:
        posts = db.scalars(select(Post).where(Post.account_id == account.account_id)).all()
        total_views = sum(p.analytics.views for p in posts if p.analytics)
        total_likes = sum(p.analytics.likes for p in posts if p.analytics)
        total_comments = sum(p.analytics.comments for p in posts if p.analytics)
        eng_rates = [p.analytics.engagement_rate for p in posts if p.analytics and p.analytics.engagement_rate]
        avg_eng = round(sum(eng_rates) / max(len(eng_rates), 1), 2)

        writer.writerow(["Metric", "Value"])
        writer.writerow(["Channel", account.username])
        writer.writerow(["Channel ID", account.platform_user_id])
        writer.writerow(["Subscribers", account.followers])
        writer.writerow(["Total Videos", len(posts)])
        writer.writerow(["Total Views", total_views])
        writer.writerow(["Total Likes", total_likes])
        writer.writerow(["Total Comments", total_comments])
        writer.writerow(["Avg Engagement Rate (%)", avg_eng])
        writer.writerow(["Est. AdSense Revenue (INR)", round(total_views / 1000 * 2 * 83, 2)])
    else:
        writer.writerow(["No YouTube channel synced yet."])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=creatoriq_channel_report.csv"},
    )
