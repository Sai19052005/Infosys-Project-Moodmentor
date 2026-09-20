import os
import hashlib
import logging
from pathlib import Path
from typing import Optional

from app.config import GOOGLE_TTS_API_KEY

AUDIO_CACHE_DIR = Path(__file__).resolve().parents[2] / "audio_cache"

class TTSService:
    def __init__(self):
        if not AUDIO_CACHE_DIR.exists():
            AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

        self.client = None
        if bool(GOOGLE_TTS_API_KEY):
            try:
                from google.cloud import texttospeech
                self.client = texttospeech.TextToSpeechClient(
                    client_options={"api_key": GOOGLE_TTS_API_KEY}
                )
                self.provider = "google"
                self.available = True
                logging.getLogger(__name__).info("Google Cloud TTS Configured")
            except Exception as e:
                logging.getLogger(__name__).warning("Failed to initialize Google TTS: %s; falling back to gTTS", e)
                self.provider = "gtts"
                self.available = True
        else:
            self.provider = "gtts"
            self.available = True

    def generate_speech(self, text: str, language: str) -> Optional[Path]:
        if not text or not text.strip():
            return None

        # Clean language code (e.g. "en-IN" -> "en")
        norm_lang = language.split("-")[0].lower() if language else "en"
        supported_langs = {"en", "hi", "mr", "ta", "ml"}
        if norm_lang not in supported_langs:
            norm_lang = "en"

        # Cache file check based on clean hash
        text_hash = hashlib.md5(f"{norm_lang}_{text.strip()}".encode("utf-8")).hexdigest()
        cache_file = AUDIO_CACHE_DIR / f"{text_hash}.mp3"

        if cache_file.exists() and cache_file.stat().st_size > 0:
            return cache_file

        # Try Google Cloud TTS if configured
        if self.provider == "google" and self.client:
            try:
                from google.cloud import texttospeech

                voice_map = {
                    "en": ("en-US", "en-US-Neural2-F"),
                    "hi": ("hi-IN", "hi-IN-Neural2-A"),
                    "mr": ("mr-IN", "mr-IN-Standard-B"),
                    "ml": ("ml-IN", "ml-IN-Standard-B"),
                    "ta": ("ta-IN", "ta-IN-Standard-A"),
                }
                lang_code, voice_name = voice_map.get(norm_lang, ("en-US", "en-US-Neural2-F"))

                synthesis_input = texttospeech.SynthesisInput(text=text.strip())
                voice = texttospeech.VoiceSelectionParams(
                    language_code=lang_code,
                    name=voice_name,
                )
                audio_config = texttospeech.AudioConfig(
                    audio_encoding=texttospeech.AudioEncoding.MP3
                )

                response = self.client.synthesize_speech(
                    input=synthesis_input, voice=voice, audio_config=audio_config
                )

                with open(cache_file, "wb") as out:
                    out.write(response.audio_content)

                return cache_file
            except Exception as e:
                logging.getLogger(__name__).warning("Google TTS generation failed: %s; falling back to gTTS", e)

        # Fallback to gTTS (supports en, hi, mr, ta, ml natively without API key)
        try:
            from gtts import gTTS
            tts = gTTS(text=text.strip(), lang=norm_lang)
            tts.save(str(cache_file))
            if cache_file.exists() and cache_file.stat().st_size > 0:
                return cache_file
        except Exception as e:
            logging.getLogger(__name__).error("gTTS generation error: %s", e)
            return None

        return None


_service: "TTSService | None" = None

def get_tts_service() -> TTSService:
    global _service
    if _service is None:
        _service = TTSService()
    return _service

