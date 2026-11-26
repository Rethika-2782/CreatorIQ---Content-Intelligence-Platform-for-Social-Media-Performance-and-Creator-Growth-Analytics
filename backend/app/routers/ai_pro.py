"""Pro Plan AI Channel Strategist router – compares user's channel with benchmark strategies."""
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Creator, Post, SocialAccount, User

router = APIRouter(prefix="/api/pro", tags=["Pro AI Strategist"])


class AnalyzeRequest(BaseModel):
    niche: Optional[str] = "General / Tech & Education"
    goal: Optional[str] = "Grow subscribers and monetization"


@router.post("/analyze")
def analyze_channel_pro(
    body: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyze the logged-in user's real channel metrics and provide benchmark strategies."""
    creator = db.scalar(select(Creator).where(Creator.user_id == current_user.user_id))
    account = None
    if creator:
        account = db.scalar(
            select(SocialAccount).where(
                SocialAccount.creator_id == creator.creator_id,
                SocialAccount.platform == "youtube",
            )
        )

    subs = account.followers if account else 0
    posts = db.scalars(select(Post).where(Post.account_id == account.account_id)).all() if account else []
    total_views = sum(p.analytics.views for p in posts if p.analytics)
    avg_views = round(total_views / len(posts)) if posts else 0
    eng_rates = [p.analytics.engagement_rate for p in posts if p.analytics and p.analytics.engagement_rate]
    avg_eng = round(sum(eng_rates) / max(len(eng_rates), 1), 2) if eng_rates else 0.0

    # Projected growth & revenue based on current baseline
    proj_subs_6m = max(int(subs * 1.45), subs + 2500)
    proj_views_monthly = max(int(avg_views * 8 * 1.5), 15000)
    proj_monthly_inr = round((proj_views_monthly / 1000) * 2.5 * 83, 0)

    return {
        "channel_name": account.username if account else (creator.website if creator and creator.website else "Your Channel"),
        "current_subs": subs,
        "current_avg_views": avg_views,
        "current_avg_engagement": avg_eng,
        "niche": body.niche,
        "projected_subs_6m": proj_subs_6m,
        "projected_monthly_revenue_inr": proj_monthly_inr,
        "benchmark_comparison": [
            {
                "metric": "Upload Cadence",
                "yours": f"{len(posts)} synced videos",
                "top_channels": "2–3 videos / week",
                "action": "Maintain a consistent weekly publishing schedule.",
            },
            {
                "metric": "Engagement Rate",
                "yours": f"{avg_eng}%",
                "top_channels": "4.5% – 7.0%",
                "action": "Add pinned questions in comments and strong 30-second hooks.",
            },
            {
                "metric": "Avg Views / Video",
                "yours": f"{avg_views:,}",
                "top_channels": "2.5× subscriber base",
                "action": "Double down on your top-performing video formats and A/B test thumbnails.",
            },
        ],
        "strategies": [
            f"Replicate your highest-viewed video format in the '{body.niche}' niche with a 3-part series.",
            "Optimize first 48-hour CTR with high-contrast thumbnails and curiosity-gap titles.",
            "Cross-promote long-form videos using 45-second YouTube Shorts to funnel new subscribers.",
            "Introduce brand sponsorship packages once monthly views cross 50,000+.",
        ],
    }
