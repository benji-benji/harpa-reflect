from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.auth import get_current_user
from app.core.database import get_supabase
from app.models.schemas import MoodIn, MoodOut

router = APIRouter(prefix="/api/v1/mood", tags=["mood"])


@router.post("", status_code=201, response_model=MoodOut)
async def record_mood(
    body: MoodIn,
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    mood_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "id": mood_id,
        "user_id": user["id"],
        "entry_id": str(body.entry_id) if body.entry_id else None,
        "session_date": body.session_date.isoformat(),
        "mood_score": body.mood_score,
        "mood_note": body.mood_note,
        "created_at": now,
    }
    sb.table("mood_records").insert(record).execute()
    return MoodOut(**record)


@router.get("", response_model=list[MoodOut])
async def get_mood_history(
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("mood_records").select("*").eq("user_id", user["id"]).order("session_date", desc=True).execute()
    return [MoodOut(**m) for m in result.data]
