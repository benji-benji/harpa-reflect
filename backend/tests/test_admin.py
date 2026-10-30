import pytest


class TestEngagement:
    async def test_get_engagement_as_supervisor(self, client, supervisor_headers):
        response = await client.get(
            "/api/v1/admin/engagement", headers=supervisor_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            metric = data[0]
            assert "user_id" in metric
            assert "display_name" in metric
            assert "total_entries" in metric
            assert "entries_this_week" in metric
            assert "last_entry_date" in metric
            assert "avg_mood" in metric

    async def test_engagement_forbidden_for_staff(self, client, auth_headers):
        response = await client.get(
            "/api/v1/admin/engagement", headers=auth_headers
        )
        assert response.status_code == 403


class TestQuoteExport:
    async def test_get_approved_quotes_as_supervisor(self, client, supervisor_headers):
        response = await client.get(
            "/api/v1/admin/quotes", headers=supervisor_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_quotes_forbidden_for_staff(self, client, auth_headers):
        response = await client.get(
            "/api/v1/admin/quotes", headers=auth_headers
        )
        assert response.status_code == 403
