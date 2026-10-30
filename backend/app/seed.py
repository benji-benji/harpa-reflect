import logging
from uuid import uuid4

from app.core.auth import hash_password
from app.core.config import settings
from app.core.database import get_supabase

log = logging.getLogger(__name__)


USERS = [
    {"username": "sereena", "display_name": "Sereena", "role": "supervisor"},
    {"username": "janine", "display_name": "Janine", "role": "staff"},
    {"username": "courtney", "display_name": "Courtney", "role": "staff"},
    {"username": "kerri", "display_name": "Kerri", "role": "staff"},
    {"username": "ben", "display_name": "Ben", "role": "staff"},
    {"username": "mike", "display_name": "Mike", "role": "staff"},
    {"username": "ali", "display_name": "Ali", "role": "staff"},
    {"username": "dom", "display_name": "Dom", "role": "staff"},
]


def seed_users():
    sb = get_supabase()
    target_usernames = {u["username"] for u in USERS}

    existing = sb.table("users").select("username").execute()
    existing_usernames = {u["username"] for u in existing.data}

    stale = existing_usernames - target_usernames
    for username in stale:
        sb.table("users").delete().eq("username", username).execute()

    for u in USERS:
        if u["username"] in existing_usernames:
            sb.table("users").update({
                "display_name": u["display_name"],
                "role": u["role"],
                "is_active": True,
            }).eq("username", u["username"]).execute()
        elif not settings.seed_password:
            log.warning("SEED_PASSWORD not set; skipping new account %s", u["username"])
        else:
            sb.table("users").insert({
                "id": str(uuid4()),
                "username": u["username"],
                "password_hash": hash_password(settings.seed_password),
                "display_name": u["display_name"],
                "role": u["role"],
                "is_active": True,
            }).execute()
