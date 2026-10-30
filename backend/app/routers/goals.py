from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.auth import get_current_user
from app.core.database import get_supabase
from app.models.schemas import GoalCreate, GoalOut

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])


@router.post("", status_code=201, response_model=GoalOut)
async def create_goal(
    body: GoalCreate,
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    sb.table("goals").update({
        "is_active": False,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("user_id", user["id"]).eq("is_active", True).execute()

    goal_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    goal = {
        "id": goal_id,
        "user_id": user["id"],
        "goal_text": body.goal_text,
        "is_active": True,
        "created_at": now,
        "completed_at": None,
    }
    sb.table("goals").insert(goal).execute()
    return GoalOut(**goal)


@router.get("", response_model=list[GoalOut])
async def list_goals(
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("goals").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
    return [GoalOut(**g) for g in result.data]


@router.get("/active", response_model=GoalOut)
async def get_active_goal(
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("goals").select("*").eq("user_id", user["id"]).eq("is_active", True).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No active goal")
    return GoalOut(**result.data[0])


@router.post("/{goal_id}/complete", response_model=GoalOut)
async def complete_goal(
    goal_id: str,
    user: dict = Depends(get_current_user),
    sb: Client = Depends(get_supabase),
):
    result = sb.table("goals").select("*").eq("id", goal_id).eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Goal not found")

    now = datetime.now(timezone.utc).isoformat()
    sb.table("goals").update({"is_active": False, "completed_at": now}).eq("id", goal_id).execute()

    updated = sb.table("goals").select("*").eq("id", goal_id).execute().data[0]
    return GoalOut(**updated)
