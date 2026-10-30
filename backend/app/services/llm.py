from supabase import Client

from app.core.config import settings
from app.services.playwork_theory import PLAYWORK_THEORY


def _build_system_prompt(user: dict, sb: Client) -> str:
    goals = sb.table("goals").select("goal_text").eq("user_id", user["id"]).eq("is_active", True).limit(1).execute()
    goal_text = goals.data[0]["goal_text"] if goals.data else "No active goal set"

    moods = sb.table("mood_records").select("mood_score").eq("user_id", user["id"]).order("created_at", desc=True).limit(5).execute()
    mood_summary = ", ".join(str(m["mood_score"]) for m in moods.data) if moods.data else "No mood data yet"

    return f"""{PLAYWORK_THEORY}

## CONTEXT FOR THIS PLAYWORKER

Display name: {user["display_name"]}
Current goal: {goal_text}
Recent mood scores (newest first): {mood_summary}

Respond to their journal entry below. Ground your response in the playwork theory above.
"""


def _get_recent_entries_context(user: dict, sb: Client, limit: int = 3) -> str:
    entries = sb.table("journal_entries").select("id, session_date").eq("user_id", user["id"]).eq("status", "complete").order("created_at", desc=True).limit(limit).execute()

    if not entries.data:
        return ""

    context_parts = []
    for entry in entries.data:
        responses = sb.table("entry_responses").select("prompt_key, response_text").eq("entry_id", entry["id"]).order("sort_order").execute()
        text = "\n".join(f"- {r['prompt_key']}: {r['response_text']}" for r in responses.data)
        context_parts.append(f"[{entry['session_date']}]\n{text}")

    return "## PREVIOUS ENTRIES\n\n" + "\n\n".join(context_parts)


async def generate_coaching_response(
    entry_text: str, user: dict, sb: Client
) -> str:
    if not settings.llm_api_key:
        return _generate_fallback_response(entry_text)

    system_prompt = _build_system_prompt(user, sb)

    from app.services.rag.search import search, format_retrieved_for_prompt
    retrieved_block = format_retrieved_for_prompt(search(entry_text, top_k=5))
    if retrieved_block:
        system_prompt = (
            f"{system_prompt}\n\n{retrieved_block}\n\n"
            "CITATION RULES (strict):\n"
            "- Only cite sources that appear in the RETRIEVED PLAYWORK THEORY block above.\n"
            "- Use the IN_TEXT string provided for each source verbatim, in parentheses.\n"
            "- In the References section at the end of your response, reproduce the FULL_REF line for every source you cited, verbatim — do not reformat, shorten, or add to it.\n"
            "- Do not invent citations, authors, or titles. If you can't ground a claim in a retrieved source, don't make the claim."
        )

    messages = [
        {"role": "user", "content": f"## TODAY'S JOURNAL ENTRY\n\n{entry_text}"}
    ]

    try:
        if settings.llm_provider == "anthropic":
            return await _call_anthropic(system_prompt, messages)
        else:
            return await _call_openai(system_prompt, messages)
    except Exception:
        return _generate_fallback_response(entry_text)


async def _call_openai(system_prompt: str, messages: list[dict]) -> str:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.llm_api_key)
    response = await client.chat.completions.create(
        model=settings.llm_model,
        messages=[{"role": "system", "content": system_prompt}] + messages,
        max_tokens=600,
        temperature=0.7,
    )
    return response.choices[0].message.content


async def _call_anthropic(system_prompt: str, messages: list[dict]) -> str:
    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": settings.llm_api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": settings.llm_model,
                "max_tokens": 600,
                "system": system_prompt,
                "messages": messages,
            },
            timeout=30.0,
        )
        data = response.json()
        return data["content"][0]["text"]


def _generate_fallback_response(entry_text: str) -> str:
    return (
        "Thank you for your reflection. Based on your observations, "
        "consider how the play types you noticed connect to the children's "
        "developmental needs. For next session, try stepping back a little "
        "more during peer negotiations to see if the children can resolve "
        "conflicts independently."
    )
