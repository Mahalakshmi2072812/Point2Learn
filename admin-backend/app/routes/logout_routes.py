from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from datetime import datetime
from app.core.database import get_database
from app.core.dependencies import security, get_current_admin

router = APIRouter(tags=["Admin Auth"])


@router.post("/admin/logout")
def logout_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    admin=Depends(get_current_admin),
):
    """Blacklist the JWT token so it can't be reused after logout."""
    token = credentials.credentials
    db = get_database()

    # Avoid inserting duplicates if already blacklisted
    if not db.blacklisted_tokens.find_one({"token": token}):
        db.blacklisted_tokens.insert_one({
            "token":          token,
            "blacklisted_at": datetime.utcnow(),
        })

    return {"message": "Logged out successfully"}
