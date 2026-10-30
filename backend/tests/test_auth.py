import pytest


class TestLogin:
    async def test_login_valid_credentials(self, client, staff_credentials):
        response = await client.post("/api/v1/auth/login", json=staff_credentials)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_invalid_password(self, client):
        response = await client.post(
            "/api/v1/auth/login",
            json={"username": "teststaff", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client):
        response = await client.post(
            "/api/v1/auth/login",
            json={"username": "nobody", "password": "whatever"},
        )
        assert response.status_code == 401

    async def test_login_missing_fields(self, client):
        response = await client.post("/api/v1/auth/login", json={"username": "teststaff"})
        assert response.status_code == 422


class TestMe:
    async def test_get_current_user(self, client, auth_headers):
        response = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "teststaff"
        assert data["role"] == "staff"
        assert "id" in data
        assert "password_hash" not in data

    async def test_get_current_user_no_token(self, client):
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    async def test_get_current_user_invalid_token(self, client):
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert response.status_code == 401
