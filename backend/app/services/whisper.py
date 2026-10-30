import asyncio
import logging
import tempfile
from pathlib import Path

from app.core.config import settings

log = logging.getLogger(__name__)

_model = None


def _get_model():
    global _model
    if _model is None:
        import whisper
        model_name = getattr(settings, "whisper_model", None) or "base"
        log.info("whisper: loading model %s", model_name)
        _model = whisper.load_model(model_name)
    return _model


def _pick_suffix(mime: str | None) -> str:
    m = (mime or "").lower().split(";")[0].strip()
    mapping = {
        "audio/mp4": ".m4a",
        "audio/m4a": ".m4a",
        "audio/aac": ".aac",
        "audio/mpeg": ".mp3",
        "audio/webm": ".webm",
        "audio/ogg": ".ogg",
        "audio/wav": ".wav",
        "audio/x-wav": ".wav",
        "audio/flac": ".flac",
    }
    return mapping.get(m, ".bin")


def _transcribe_sync(audio_path: str) -> str:
    model = _get_model()
    result = model.transcribe(audio_path, fp16=False, language="en")
    return (result.get("text") or "").strip()


async def transcribe(audio_bytes: bytes, mime: str | None = None) -> str:
    if not audio_bytes:
        return ""
    suffix = _pick_suffix(mime)
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    log.info("whisper: tmp=%s suffix=%s size=%d", tmp_path, suffix, len(audio_bytes))
    try:
        return await asyncio.to_thread(_transcribe_sync, tmp_path)
    finally:
        Path(tmp_path).unlink(missing_ok=True)
