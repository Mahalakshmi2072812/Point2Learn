from fastapi import APIRouter, HTTPException, Form
from datetime import datetime
from app.core.database import get_database
from app.core.security import hash_password, verify_password
from app.utils.jwt_handler import create_access_token

router = APIRouter(prefix="/admin", tags=["Admin Auth"])  # ✅ prefix added


# ── ADMIN SIGNUP ──────────────────────────────────────────────
@router.post("/signup")
def admin_signup(
    email: str = Form(...),
    password: str = Form(...),
):
    db = get_database()

    email = email.lower().strip()

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    if db.admins.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Admin already exists")

    db.admins.insert_one({
        "email": email,
        "password": hash_password(password),
        "role": "admin",
        "created_at": datetime.utcnow(),
    })

    return {
        "message": "Admin registered successfully"
    }


# ── ADMIN LOGIN ───────────────────────────────────────────────
@router.post("/login")
def admin_login(
    email: str = Form(...),
    password: str = Form(...),
):
    db = get_database()

    email = email.lower().strip()

    admin = db.admins.find_one({"email": email})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": admin["email"],
        "role": "admin"   # ✅ IMPORTANT (for protection later)
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
