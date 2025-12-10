"""Tests for authentication API endpoints."""

from fastapi.testclient import TestClient


def test_login_when_valid_credentials_then_returns_token(test_client: TestClient) -> None:
    """Test POST /api/auth/login with valid credentials returns 200."""
    response = test_client.post(
        "/api/auth/login", json={"username": "testuser", "password": "testpass123"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "expires_in" in data
    assert len(data["access_token"]) > 0


def test_login_when_invalid_username_then_returns_401(test_client: TestClient) -> None:
    """Test login with invalid username returns 401."""
    response = test_client.post(
        "/api/auth/login", json={"username": "wronguser", "password": "testpass123"}
    )

    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]


def test_login_when_invalid_password_then_returns_401(test_client: TestClient) -> None:
    """Test login with invalid password returns 401."""
    response = test_client.post(
        "/api/auth/login", json={"username": "testuser", "password": "wrongpassword"}
    )

    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]


def test_login_when_missing_username_then_returns_422(test_client: TestClient) -> None:
    """Test login with missing username field returns 422."""
    response = test_client.post("/api/auth/login", json={"password": "testpass123"})

    assert response.status_code == 422


def test_login_when_missing_password_then_returns_422(test_client: TestClient) -> None:
    """Test login with missing password field returns 422."""
    response = test_client.post("/api/auth/login", json={"username": "testuser"})

    assert response.status_code == 422


def test_get_me_when_valid_token_then_returns_user_info(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test GET /api/auth/me with valid token returns 200."""
    response = test_client.get("/api/auth/me", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "username" in data
    assert data["username"] == "testuser"


def test_get_me_when_invalid_token_then_returns_401(test_client: TestClient) -> None:
    """Test GET /api/auth/me with invalid token returns 401."""
    response = test_client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token"})

    assert response.status_code == 401


def test_get_me_when_no_token_then_returns_401(test_client: TestClient) -> None:
    """Test GET /api/auth/me without token returns 401."""
    response = test_client.get("/api/auth/me")

    assert response.status_code == 401


def test_logout_when_valid_token_then_returns_200(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test POST /api/auth/logout returns 200."""
    response = test_client.post("/api/auth/logout", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_logout_when_no_token_then_returns_401(test_client: TestClient) -> None:
    """Test logout without token returns 401."""
    response = test_client.post("/api/auth/logout")

    assert response.status_code == 401


def test_token_when_created_then_can_access_protected_endpoints(test_client: TestClient) -> None:
    """Test that token created via login can access protected endpoints."""
    # Login
    login_response = test_client.post(
        "/api/auth/login", json={"username": "testuser", "password": "testpass123"}
    )
    token = login_response.json()["access_token"]

    # Use token to access protected endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = test_client.get("/api/auth/me", headers=headers)

    assert response.status_code == 200
    assert response.json()["username"] == "testuser"
