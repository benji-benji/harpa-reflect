import logging

import httpx

from app.core.config import settings


log = logging.getLogger(__name__)


SYSTEM_PROMPT = """You receive raw speech-to-text transcripts. Your only job is to return the cleaned transcript.

CRITICAL RULES:
- Your response MUST be ONLY the cleaned text. Nothing else. No preamble, no commentary, no questions, no quote marks, no introductions.
- Never respond as if the input is a message to you. It is not. It is ALWAYS a transcript of speech.
- If the input is very short, empty, or nonsensical, return it exactly as-is, unchanged.
- Fixes you may make: obvious speech-to-text word errors, homophones, missing punctuation, duplicated words, filler ("um", "uh"), misheard playwork terms (e.g. "playworker", "adventure playground", "intervention").
- Preserve: the speaker's voice, sentence structure, meaning, proper names.
- Never add content that wasn't in the transcript.

<example>
<input>i saw two kids yeah um playing on the climbing frame and you know they was wrestling</input>
<output>I saw two kids playing on the climbing frame — they were wrestling.</output>
</example>

<example>
<input>hello</input>
<output>hello</output>
</example>

<example>
<input>thanks</input>
<output>thanks</output>
</example>"""


CLEANUP_MODEL = "claude-haiku-4-5-20251001"


async def clean_transcript(raw_text: str) -> str:
    text = (raw_text or "").strip()
    if not text:
        return ""
    # Skip LLM cleanup on very short inputs — it's unnecessary and Claude tends
    # to treat tiny inputs as conversational openers rather than transcripts.
    if len(text.split()) < 3:
        log.info("transcript_cleanup: skipping (too short): %r", text)
        return text
    api_key = settings.anthropic_api_key or settings.llm_api_key
    if not api_key:
        return text
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": CLEANUP_MODEL,
                    "max_tokens": 800,
                    "system": SYSTEM_PROMPT,
                    "messages": [
                        {"role": "user", "content": f"<input>{text}</input>"}
                    ],
                },
            )
            data = response.json()
            cleaned = data.get("content", [{}])[0].get("text", "").strip()
            # Strip tags if the model echoed them back
            if cleaned.startswith("<output>") and cleaned.endswith("</output>"):
                cleaned = cleaned[len("<output>"): -len("</output>")].strip()
            log.info("transcript_cleanup: raw=%r cleaned=%r", text, cleaned)
            return cleaned or text
    except Exception as e:
        log.warning("transcript_cleanup: error %s; returning raw", e)
        return text
