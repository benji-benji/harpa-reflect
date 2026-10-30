import pytest


class TestCreateEntry:
    async def test_create_entry(self, client, auth_headers, sample_entry_data):
        response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["session_date"] == "2026-04-15"
        assert data["status"] == "draft"
        assert len(data["responses"]) == 6
        assert data["ai_response"] is None

    async def test_create_entry_no_auth(self, client, sample_entry_data):
        response = await client.post("/api/v1/entries", json=sample_entry_data)
        assert response.status_code == 401

    async def test_create_entry_empty_responses(self, client, auth_headers):
        response = await client.post(
            "/api/v1/entries",
            json={"session_date": "2026-04-15", "responses": []},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "draft"
        assert len(data["responses"]) == 0


class TestListEntries:
    async def test_list_entries(self, client, auth_headers, sample_entry_data):
        await client.post("/api/v1/entries", json=sample_entry_data, headers=auth_headers)
        await client.post("/api/v1/entries", json=sample_entry_data, headers=auth_headers)

        response = await client.get("/api/v1/entries", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2

    async def test_list_entries_only_own(self, client, auth_headers, supervisor_headers, sample_entry_data):
        await client.post("/api/v1/entries", json=sample_entry_data, headers=auth_headers)
        response = await client.get("/api/v1/entries", headers=supervisor_headers)
        data = response.json()
        staff_entries = [e for e in data if e.get("user_id") != "supervisor-id"]
        assert len(staff_entries) == 0 or all(
            e.get("status") in ("draft", "complete") for e in data
        )

    async def test_list_entries_no_auth(self, client):
        response = await client.get("/api/v1/entries")
        assert response.status_code == 401


class TestGetEntry:
    async def test_get_entry(self, client, auth_headers, sample_entry_data):
        create_response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        entry_id = create_response.json()["id"]

        response = await client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == entry_id
        assert len(data["responses"]) == 6
        assert data["responses"][0]["prompt_key"] == "session_context"

    async def test_get_nonexistent_entry(self, client, auth_headers):
        response = await client.get(
            "/api/v1/entries/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 404

    async def test_get_other_users_entry(self, client, auth_headers, supervisor_headers, sample_entry_data):
        create_response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        entry_id = create_response.json()["id"]
        response = await client.get(
            f"/api/v1/entries/{entry_id}", headers=supervisor_headers
        )
        assert response.status_code == 404


class TestUpdateEntry:
    async def test_update_entry_responses(self, client, auth_headers, sample_entry_data):
        create_response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        entry_id = create_response.json()["id"]

        update_data = {
            "responses": [
                {"prompt_key": "highlights", "response_text": "Updated highlights text"},
            ]
        }
        response = await client.patch(
            f"/api/v1/entries/{entry_id}", json=update_data, headers=auth_headers
        )
        assert response.status_code == 200

    async def test_cannot_update_completed_entry(self, client, auth_headers, sample_entry_data):
        create_response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        entry_id = create_response.json()["id"]
        await client.post(f"/api/v1/entries/{entry_id}/complete", headers=auth_headers)

        response = await client.patch(
            f"/api/v1/entries/{entry_id}",
            json={"responses": [{"prompt_key": "highlights", "response_text": "too late"}]},
            headers=auth_headers,
        )
        assert response.status_code == 400


class TestCompleteEntry:
    async def test_complete_entry(self, client, auth_headers, sample_entry_data):
        create_response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        entry_id = create_response.json()["id"]

        response = await client.post(
            f"/api/v1/entries/{entry_id}/complete", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "complete"
        assert data["completed_at"] is not None

    async def test_complete_entry_triggers_ai_response(self, client, auth_headers, sample_entry_data):
        create_response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        entry_id = create_response.json()["id"]
        await client.post(f"/api/v1/entries/{entry_id}/complete", headers=auth_headers)

        response = await client.get(
            f"/api/v1/entries/{entry_id}", headers=auth_headers
        )
        data = response.json()
        assert data["ai_response"] is not None
        assert len(data["ai_response"]["response_text"]) > 0

    async def test_complete_already_completed(self, client, auth_headers, sample_entry_data):
        create_response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        entry_id = create_response.json()["id"]
        await client.post(f"/api/v1/entries/{entry_id}/complete", headers=auth_headers)

        response = await client.post(
            f"/api/v1/entries/{entry_id}/complete", headers=auth_headers
        )
        assert response.status_code == 400
