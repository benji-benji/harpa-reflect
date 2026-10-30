from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from supabase import Client

from app.core.auth import require_supervisor
from app.core.database import get_supabase
from app.models.schemas import EngagementMetric, QuoteOut

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/engagement", response_model=list[EngagementMetric])
async def get_engagement(
    user: dict = Depends(require_supervisor),
    sb: Client = Depends(get_supabase),
):
    staff = sb.table("users").select("*").eq("role", "staff").execute().data
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()

    metrics = []
    for u in staff:
        uid = u["id"]
        all_entries = sb.table("journal_entries").select("id, created_at, session_date").eq("user_id", uid).execute().data
        week_entries = [e for e in all_entries if e["created_at"] >= week_ago]
        moods = sb.table("mood_records").select("mood_score").eq("user_id", uid).execute().data
        avg_mood = sum(m["mood_score"] for m in moods) / len(moods) if moods else None
        last_date = max((e["session_date"] for e in all_entries), default=None) if all_entries else None

        metrics.append(EngagementMetric(
            user_id=uid,
            display_name=u["display_name"],
            total_entries=len(all_entries),
            entries_this_week=len(week_entries),
            last_entry_date=last_date,
            avg_mood=avg_mood,
        ))
    return metrics


@router.get("/quotes", response_model=list[QuoteOut])
async def get_all_quotes(
    user: dict = Depends(require_supervisor),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("approved_quotes").select("*").execute()
    return [QuoteOut(**q) for q in result.data]
