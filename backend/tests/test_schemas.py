import pytest
from pydantic import ValidationError

from app.models.schemas import (
    LoginRequest,
    MoodIn,
    JournalEntryCreate,
    EntryResponseIn,
    GoalCreate,
    QuoteApprove,
)


class TestLoginRequestSchema:
    def test_valid_login(self):
        req = LoginRequest(username="staff1", password="pass123")
        assert req.username == "staff1"

    def test_missing_username(self):
        with pytest.raises(ValidationError):
            LoginRequest(password="pass123")

    def test_missing_password(self):
        with pytest.raises(ValidationError):
            LoginRequest(username="staff1")


class TestMoodSchema:
    def test_valid_mood(self):
        mood = MoodIn(session_date="2026-04-15", mood_score=3)
        assert mood.mood_score == 3

    def test_mood_too_low(self):
        with pytest.raises(ValidationError):
            MoodIn(session_date="2026-04-15", mood_score=0)

    def test_mood_too_high(self):
        with pytest.raises(ValidationError):
            MoodIn(session_date="2026-04-15", mood_score=6)

    def test_mood_with_note(self):
        mood = MoodIn(session_date="2026-04-15", mood_score=4, mood_note="Feeling good")
        assert mood.mood_note == "Feeling good"

    def test_mood_without_note(self):
        mood = MoodIn(session_date="2026-04-15", mood_score=4)
        assert mood.mood_note is None


class TestJournalEntryCreateSchema:
    def test_valid_entry(self):
        entry = JournalEntryCreate(
            session_date="2026-04-15",
            responses=[
                EntryResponseIn(prompt_key="highlights", response_text="Great session"),
            ],
        )
        assert entry.session_date.isoformat() == "2026-04-15"
        assert len(entry.responses) == 1

    def test_entry_empty_responses(self):
        entry = JournalEntryCreate(session_date="2026-04-15", responses=[])
        assert len(entry.responses) == 0

    def test_entry_missing_date(self):
        with pytest.raises(ValidationError):
            JournalEntryCreate(responses=[])


class TestGoalSchema:
    def test_valid_goal(self):
        goal = GoalCreate(goal_text="Step back more during conflict")
        assert goal.goal_text == "Step back more during conflict"

    def test_empty_goal(self):
        goal = GoalCreate(goal_text="")
        assert goal.goal_text == ""


class TestQuoteSchema:
    def test_valid_quote(self):
        quote = QuoteApprove(
            entry_response_id="00000000-0000-0000-0000-000000000000",
            quote_text="They built a den together",
        )
        assert quote.quote_text == "They built a den together"
