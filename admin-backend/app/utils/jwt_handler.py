from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from app.core.database import get_database

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# =====================================================
# 🔐 Create Access Token
# =====================================================
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# =====================================================
# 🔎 Verify Token + Check Blacklist
# =====================================================
def verify_token(token: str):
    try:
        db = get_database()

        # 🔥 Check if token is blacklisted (logout protection)
        blacklisted = db.blacklisted_tokens.find_one({"token": token})
        if blacklisted:
            return None

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except JWTError:
        return None