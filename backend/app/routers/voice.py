import logging

from fastapi import APIRouter, Depends, UploadFile, File

from app.core.auth import get_current_user
from app.models.schemas import TranscriptionResponse
from app.services.transcript_cleanup import clean_transcript
from app.services.whisper import transcribe

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    audio_bytes = await file.read()
    log.info("voice/transcribe: user=%s bytes=%d mime=%s", user.get("username"), len(audio_bytes), file.content_type)
    raw = await transcribe(audio_bytes, mime=file.content_type)
    log.info("voice/transcribe: raw whisper output=%r", raw)
    cleaned = await clean_transcript(raw)
    return TranscriptionResponse(text=cleaned)
