import pytest


class TestMoodRecording:
    async def test_record_mood(self, client, auth_headers):
        response = await client.post(
            "/api/v1/mood",
            json={"session_date": "2026-04-15", "mood_score": 4, "mood_note": "Good session"},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["mood_score"] == 4
        assert data["mood_note"] == "Good session"
        assert data["session_date"] == "2026-04-15"

    async def test_record_mood_min_max(self, client, auth_headers):
        response_min = await client.post(
            "/api/v1/mood",
            json={"session_date": "2026-04-14", "mood_score": 1},
            headers=auth_headers,
        )
        assert response_min.status_code == 201

        response_max = await client.post(
            "/api/v1/mood",
            json={"session_date": "2026-04-13", "mood_score": 5},
            headers=auth_headers,
        )
        assert response_max.status_code == 201

    async def test_record_mood_out_of_range(self, client, auth_headers):
        response = await client.post(
            "/api/v1/mood",
            json={"session_date": "2026-04-15", "mood_score": 0},
            headers=auth_headers,
        )
        assert response.status_code == 422

        response = await client.post(
            "/api/v1/mood",
            json={"session_date": "2026-04-15", "mood_score": 6},
            headers=auth_headers,
        )
        assert response.status_code == 422

    async def test_record_mood_no_auth(self, client):
        response = await client.post(
            "/api/v1/mood",
            json={"session_date": "2026-04-15", "mood_score": 3},
        )
        assert response.status_code == 401


class TestMoodHistory:
    async def test_get_mood_history(self, client, auth_headers):
        await client.post(
            "/api/v1/mood",
            json={"session_date": "2026-04-15", "mood_score": 4},
            headers=auth_headers,
        )
        await client.post(
            "/api/v1/mood",
            json={"session_date": "2026-04-14", "mood_score": 3},
            headers=auth_headers,
        )

        response = await client.get("/api/v1/mood", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2

    async def test_mood_history_only_own(self, client, auth_headers, supervisor_headers):
        await client.post(
            "/api/v1/mood",
            json={"session_date": "2026-04-15", "mood_score": 4},
            headers=auth_headers,
        )

        response = await client.get("/api/v1/mood", headers=supervisor_headers)
        data = response.json()
        staff_moods = [m for m in data if m["mood_score"] == 4]
        assert len(staff_moods) == 0
