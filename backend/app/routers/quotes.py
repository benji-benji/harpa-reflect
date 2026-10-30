from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.auth import get_current_user
from app.core.database import get_supabase
from app.models.schemas import QuoteApprove, QuoteOut

router = APIRouter(prefix="/api/v1/quotes", tags=["quotes"])


@router.post("", status_code=201, response_model=QuoteOut)
async def approve_quote(
    body: QuoteApprove,
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    quote_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    quote = {
        "id": quote_id,
        "entry_response_id": str(body.entry_response_id),
        "user_id": user["id"],
        "quote_text": body.quote_text,
        "approved_at": now,
        "used_in_report": False,
    }
    sb.table("approved_quotes").insert(quote).execute()
    return QuoteOut(**quote)


@router.get("", response_model=list[QuoteOut])
async def list_own_quotes(
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("approved_quotes").select("*").eq("user_id", user["id"]).execute()
    return [QuoteOut(**q) for q in result.data]
