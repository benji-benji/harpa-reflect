import pytest


class TestGoals:
    async def test_create_goal(self, client, auth_headers):
        response = await client.post(
            "/api/v1/goals",
            json={"goal_text": "Practice stepping back during conflict resolution"},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["goal_text"] == "Practice stepping back during conflict resolution"
        assert data["is_active"] is True
        assert data["completed_at"] is None

    async def test_list_goals(self, client, auth_headers):
        await client.post(
            "/api/v1/goals",
            json={"goal_text": "Goal one"},
            headers=auth_headers,
        )
        await client.post(
            "/api/v1/goals",
            json={"goal_text": "Goal two"},
            headers=auth_headers,
        )

        response = await client.get("/api/v1/goals", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2

    async def test_complete_goal(self, client, auth_headers):
        create_response = await client.post(
            "/api/v1/goals",
            json={"goal_text": "A goal to complete"},
            headers=auth_headers,
        )
        goal_id = create_response.json()["id"]

        response = await client.post(
            f"/api/v1/goals/{goal_id}/complete", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False
        assert data["completed_at"] is not None

    async def test_get_active_goal(self, client, auth_headers):
        await client.post(
            "/api/v1/goals",
            json={"goal_text": "My active goal"},
            headers=auth_headers,
        )

        response = await client.get("/api/v1/goals/active", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["goal_text"] == "My active goal"
        assert data["is_active"] is True

    async def test_no_active_goal(self, client, auth_headers):
        response = await client.get("/api/v1/goals/active", headers=auth_headers)
        assert response.status_code == 404 or response.status_code == 200
