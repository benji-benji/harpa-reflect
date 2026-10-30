import io
import pytest


class TestTranscription:
    async def test_transcribe_audio(self, client, auth_headers, monkeypatch):
        # Test the endpoint, not Whisper: stub the model call.
        async def fake_transcribe(audio_bytes, mime=None):
            return "we built a den by the fire pit"

        monkeypatch.setattr("app.routers.voice.transcribe", fake_transcribe)
        fake_audio = io.BytesIO(b"\x00" * 1000)
        response = await client.post(
            "/api/v1/voice/transcribe",
            files={"file": ("test.wav", fake_audio, "audio/wav")},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "text" in data
        assert isinstance(data["text"], str)

    async def test_transcribe_no_file(self, client, auth_headers):
        response = await client.post(
            "/api/v1/voice/transcribe",
            headers=auth_headers,
        )
        assert response.status_code == 422

    async def test_transcribe_no_auth(self, client):
        fake_audio = io.BytesIO(b"\x00" * 1000)
        response = await client.post(
            "/api/v1/voice/transcribe",
            files={"file": ("test.wav", fake_audio, "audio/wav")},
        )
        assert response.status_code == 401
