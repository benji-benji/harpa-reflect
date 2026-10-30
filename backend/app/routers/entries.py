from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.auth import get_current_user
from app.core.database import get_supabase
from app.models.schemas import (
    JournalEntryCreate,
    JournalEntryOut,
    JournalEntryListOut,
    JournalEntryUpdate,
    EntryResponseOut,
    AIResponseOut,
)
from app.core.config import settings
from app.services.llm import generate_coaching_response

router = APIRouter(prefix="/api/v1/entries", tags=["entries"])


def _build_entry_out(entry: dict, responses: list[dict], ai_resp: dict | None) -> JournalEntryOut:
    return JournalEntryOut(
        id=entry["id"],
        user_id=entry["user_id"],
        session_date=entry["session_date"],
        status=entry["status"],
        created_at=entry["created_at"],
        completed_at=entry["completed_at"],
        responses=[EntryResponseOut(**r) for r in sorted(responses, key=lambda r: r["sort_order"])],
        ai_response=AIResponseOut(**ai_resp) if ai_resp else None,
    )


@router.post("", status_code=201, response_model=JournalEntryOut)
async def create_entry(
    body: JournalEntryCreate,
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    entry_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()

    sb.table("journal_entries").insert({
        "id": entry_id,
        "user_id": user["id"],
        "session_date": body.session_date.isoformat(),
        "status": "draft",
        "created_at": now,
    }).execute()

    responses_out = []
    for i, r in enumerate(body.responses):
        resp_id = str(uuid4())
        row = {
            "id": resp_id,
            "entry_id": entry_id,
            "prompt_key": r.prompt_key,
            "response_text": r.response_text,
            "audio_url": r.audio_url,
            "sort_order": i,
            "created_at": now,
        }
        sb.table("entry_responses").insert(row).execute()
        responses_out.append(row)

    entry = sb.table("journal_entries").select("*").eq("id", entry_id).execute().data[0]
    return _build_entry_out(entry, responses_out, None)


@router.get("", response_model=list[JournalEntryListOut])
async def list_entries(
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("journal_entries").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
    return [
        JournalEntryListOut(
            id=e["id"],
            session_date=e["session_date"],
            status=e["status"],
            created_at=e["created_at"],
            completed_at=e["completed_at"],
        )
        for e in result.data
    ]


@router.get("/{entry_id}", response_model=JournalEntryOut)
async def get_entry(
    entry_id: str,
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("journal_entries").select("*").eq("id", entry_id).eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry = result.data[0]

    responses = sb.table("entry_responses").select("*").eq("entry_id", entry_id).order("sort_order").execute().data
    ai_result = sb.table("ai_responses").select("*").eq("entry_id", entry_id).execute()
    ai_resp = ai_result.data[0] if ai_result.data else None

    return _build_entry_out(entry, responses, ai_resp)


@router.patch("/{entry_id}", response_model=JournalEntryOut)
async def update_entry(
    entry_id: str,
    body: JournalEntryUpdate,
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("journal_entries").select("*").eq("id", entry_id).eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry = result.data[0]
    if entry["status"] == "complete":
        raise HTTPException(status_code=400, detail="Cannot update a completed entry")

    if body.session_date is not None:
        sb.table("journal_entries").update({"session_date": body.session_date.isoformat()}).eq("id", entry_id).execute()

    if body.responses is not None:
        sb.table("entry_responses").delete().eq("entry_id", entry_id).execute()
        now = datetime.now(timezone.utc).isoformat()
        for i, r in enumerate(body.responses):
            sb.table("entry_responses").insert({
                "id": str(uuid4()),
                "entry_id": entry_id,
                "prompt_key": r.prompt_key,
                "response_text": r.response_text,
                "audio_url": r.audio_url,
                "sort_order": i,
                "created_at": now,
            }).execute()

    entry = sb.table("journal_entries").select("*").eq("id", entry_id).execute().data[0]
    responses = sb.table("entry_responses").select("*").eq("entry_id", entry_id).order("sort_order").execute().data
    return _build_entry_out(entry, responses, None)


@router.post("/{entry_id}/complete", response_model=JournalEntryOut)
async def complete_entry(
    entry_id: str,
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("journal_entries").select("*").eq("id", entry_id).eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry = result.data[0]
    if entry["status"] == "complete":
        raise HTTPException(status_code=400, detail="Entry already completed")

    now = datetime.now(timezone.utc).isoformat()
    sb.table("journal_entries").update({
        "status": "complete",
        "completed_at": now,
    }).eq("id", entry_id).execute()

    responses = sb.table("entry_responses").select("*").eq("entry_id", entry_id).order("sort_order").execute().data
    responses_text = "\n".join(f"{r['prompt_key']}: {r['response_text']}" for r in responses)

    ai_text = await generate_coaching_response(responses_text, user, sb)

    ai_id = str(uuid4())
    ai_record = {
        "id": ai_id,
        "entry_id": entry_id,
        "response_text": ai_text,
        "model_used": settings.llm_model,
        "created_at": now,
    }
    sb.table("ai_responses").insert(ai_record).execute()

    entry = sb.table("journal_entries").select("*").eq("id", entry_id).execute().data[0]
    return _build_entry_out(entry, responses, ai_record)
