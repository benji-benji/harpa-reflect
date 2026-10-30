import pytest
from httpx import ASGITransport, AsyncClient

from app.core.auth import hash_password
from app.core import database
from app.core.config import settings
from app.main import app
from tests.fake_supabase import FakeSupabase, Row

STAFF_ID = "11111111-1111-1111-1111-111111111111"
SUPERVISOR_ID = "22222222-2222-2222-2222-222222222222"


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture(autouse=True)
def fake_db(monkeypatch):
    """Swap Supabase for an in-memory fake and switch off the LLM call,
    so tests use the fallback coaching response instead of a paid API."""
    fake = FakeSupabase()
    fake.tables["users"] = [
        Row({
            "id": STAFF_ID,
            "username": "teststaff",
            "password_hash": hash_password("testpass123"),
            "display_name": "Test Staff",
            "role": "staff",
            "is_active": True,
        }),
        Row({
            "id": SUPERVISOR_ID,
            "username": "testsupervisor",
            "password_hash": hash_password("supervisorpass123"),
            "display_name": "Test Supervisor",
            "role": "supervisor",
            "is_active": True,
        }),
    ]
    monkeypatch.setattr(database, "_client", fake)
    monkeypatch.setattr(settings, "llm_api_key", "")
    yield fake


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.fixture
def staff_credentials():
    return {"username": "teststaff", "password": "testpass123"}


@pytest.fixture
def supervisor_credentials():
    return {"username": "testsupervisor", "password": "supervisorpass123"}


@pytest.fixture
async def staff_token(client, staff_credentials):
    response = await client.post("/api/v1/auth/login", json=staff_credentials)
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(staff_token):
    return {"Authorization": f"Bearer {staff_token}"}


@pytest.fixture
async def supervisor_token(client, supervisor_credentials):
    response = await client.post("/api/v1/auth/login", json=supervisor_credentials)
    return response.json()["access_token"]


@pytest.fixture
def supervisor_headers(supervisor_token):
    return {"Authorization": f"Bearer {supervisor_token}"}


@pytest.fixture
def sample_entry_data():
    return {
        "session_date": "2026-04-15",
        "responses": [
            {"prompt_key": "session_context", "response_text": "Wednesday after-school session, about 25 kids"},
            {"prompt_key": "highlights", "response_text": "Two kids who usually avoid each other built a den together"},
            {"prompt_key": "challenges", "response_text": "One young person was very disruptive, throwing things"},
            {"prompt_key": "observations", "response_text": "Lots of deep play happening around the fire pit"},
            {"prompt_key": "interventions", "response_text": "Held back when the den group had a disagreement — they resolved it themselves"},
            {"prompt_key": "anything_else", "response_text": "Feeling more confident about stepping back"},
        ],
    }
