# app/utils/jwt_handler.py

from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.database import get_db

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 🔐 HTTP BEARER (Swagger will show simple token box)
security = HTTPBearer()


# ==========================================
# CREATE TOKEN
# ==========================================
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ==========================================
# VERIFY TOKEN + CHECK BLACKLIST
# ==========================================
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    db = get_db()

    # 🚫 Check token blacklist
    blacklisted = db.token_blacklist.find_one({"token": token})
    if blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is blacklisted. Please login again."
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # 🚫 Check global logout
        global_logout = db.token_blacklist.find_one({
            "user_id": payload["user_id"],
            "global_logout": True
        })

        if global_logout:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Logged out from all devices"
            )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )