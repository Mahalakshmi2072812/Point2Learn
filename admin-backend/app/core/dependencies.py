"""
Shared FastAPI dependencies — import from here, NOT redefined per-file.
"""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_handler import verify_token

security = HTTPBearer()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Validate admin JWT token. Raises 403 on invalid/expired/blacklisted."""
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=403, detail="Invalid or expired token")
    return payload
