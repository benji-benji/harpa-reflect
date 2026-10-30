import pytest


class TestApproveQuote:
    async def test_approve_quote(self, client, auth_headers, sample_entry_data):
        create_response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        entry = create_response.json()
        response_id = entry["responses"][1]["id"]

        response = await client.post(
            "/api/v1/quotes",
            json={
                "entry_response_id": response_id,
                "quote_text": "Two kids who usually avoid each other built a den together",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["quote_text"] == "Two kids who usually avoid each other built a den together"
        assert data["used_in_report"] is False

    async def test_approve_quote_no_auth(self, client):
        response = await client.post(
            "/api/v1/quotes",
            json={
                "entry_response_id": "00000000-0000-0000-0000-000000000000",
                "quote_text": "A quote",
            },
        )
        assert response.status_code == 401

    async def test_list_own_quotes(self, client, auth_headers, sample_entry_data):
        create_response = await client.post(
            "/api/v1/entries", json=sample_entry_data, headers=auth_headers
        )
        entry = create_response.json()
        response_id = entry["responses"][0]["id"]

        await client.post(
            "/api/v1/quotes",
            json={
                "entry_response_id": response_id,
                "quote_text": "A notable quote",
            },
            headers=auth_headers,
        )

        response = await client.get("/api/v1/quotes", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
