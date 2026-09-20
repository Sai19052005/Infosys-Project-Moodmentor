import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.models import User
from app.services.tts_service import get_tts_service

router = APIRouter(prefix="/voice", tags=["Voice 🎙️"])

class TTSRequest(BaseModel):
    text: str
    language: str

@router.get("/status")
def get_voice_status():
    tts = get_tts_service()
    return {"available": tts.available, "provider": tts.provider}

@router.post("/tts")
def generate_tts(payload: TTSRequest, current_user: User = Depends(get_current_user)):
    tts = get_tts_service()
    if not tts.available:
        raise HTTPException(status_code=503, detail="TTS Provider not configured")
        
    audio_path = tts.generate_speech(payload.text, payload.language)
    if not audio_path:
        raise HTTPException(status_code=500, detail="Failed to generate audio")
        
    return FileResponse(audio_path, media_type="audio/mpeg")

@router.get("/meditation/{program_id}")
@router.get("/meditation/{program_id}/{language}")
def get_meditation_audio(program_id: str, language: str = "en"):
    from app.services.tts_service import AUDIO_CACHE_DIR
    p = program_id.lower().replace("-", "_")
    if "ravi" in p or "shankar" in p or p == "meditation_ravi_shankar_10":
        audio_file = AUDIO_CACHE_DIR / "ravi_shankar_10min.mp3"
        if audio_file.exists():
            return FileResponse(
                audio_file,
                media_type="audio/mpeg",
                filename="Sri_Sri_Ravi_Shankar_10Min_Meditation.mp3",
            )
    if "choa" in p or "sui" in p or "twin" in p or p == "meditation_choa_kok_sui_27":
        audio_file = AUDIO_CACHE_DIR / "choa_kok_sui_27min.mp3"
        if audio_file.exists():
            return FileResponse(
                audio_file,
                media_type="audio/mpeg",
                filename="Master_Choa_Kok_Sui_Twin_Hearts_27Min.mp3",
            )
    raise HTTPException(status_code=404, detail="Meditation audio not found")

