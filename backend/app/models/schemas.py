from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: UUID
    username: str
    display_name: str
    role: str
    is_active: bool


class EntryResponseIn(BaseModel):
    prompt_key: str
    response_text: str
    audio_url: str | None = None


class JournalEntryCreate(BaseModel):
    session_date: date
    responses: list[EntryResponseIn] = []


class JournalEntryUpdate(BaseModel):
    session_date: date | None = None
    responses: list[EntryResponseIn] | None = None


class EntryResponseOut(BaseModel):
    id: UUID
    prompt_key: str
    response_text: str
    audio_url: str | None
    sort_order: int


class AIResponseOut(BaseModel):
    id: UUID
    response_text: str
    model_used: str
    created_at: datetime


class JournalEntryOut(BaseModel):
    id: UUID
    user_id: UUID
    session_date: date
    status: str
    created_at: datetime
    completed_at: datetime | None
    responses: list[EntryResponseOut] = []
    ai_response: AIResponseOut | None = None


class JournalEntryListOut(BaseModel):
    id: UUID
    session_date: date
    status: str
    created_at: datetime
    completed_at: datetime | None


class MoodIn(BaseModel):
    session_date: date
    mood_score: int = Field(ge=1, le=5)
    mood_note: str | None = None
    entry_id: UUID | None = None


class MoodOut(BaseModel):
    id: UUID
    session_date: date
    mood_score: int
    mood_note: str | None
    entry_id: UUID | None
    created_at: datetime


class GoalCreate(BaseModel):
    goal_text: str


class GoalOut(BaseModel):
    id: UUID
    goal_text: str
    is_active: bool
    created_at: datetime
    completed_at: datetime | None


class QuoteApprove(BaseModel):
    entry_response_id: UUID
    quote_text: str


class QuoteOut(BaseModel):
    id: UUID
    quote_text: str
    approved_at: datetime
    used_in_report: bool


class TranscriptionResponse(BaseModel):
    text: str


class EngagementMetric(BaseModel):
    user_id: UUID
    display_name: str
    total_entries: int
    entries_this_week: int
    last_entry_date: date | None
    avg_mood: float | None


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int
