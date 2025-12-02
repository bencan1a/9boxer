"""User authentication models."""

from datetime import datetime

from pydantic import BaseModel


class UserLogin(BaseModel):
    """User login request."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """Token response."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """User response."""

    user_id: str
    username: str
