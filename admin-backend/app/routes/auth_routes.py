from fastapi import APIRouter, HTTPException, Form
from datetime import datetime
from app.core.database import get_database
from app.core.security import hash_password, verify_password
from app.utils.jwt_handler import create_access_token

router = APIRouter(tags=["Admin Auth"])


# ── ADMIN SIGNUP ──────────────────────────────────────────────
@router.post("/admin/signup")
def admin_signup(
    email: str = Form(...),
    password: str = Form(...),
):
    db = get_database()

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    if db.admins.find_one({"email": email.lower().strip()}):
        raise HTTPException(status_code=400, detail="Admin with this email already exists")

    db.admins.insert_one({
        "email":      email.lower().strip(),
        "password":   hash_password(password),
        "role":       "admin",
        "created_at": datetime.utcnow(),
    })

    return {"message": "Admin registered successfully"}


# ── ADMIN LOGIN ───────────────────────────────────────────────
@router.post("/admin/login")
def admin_login(
    email: str = Form(...),
    password: str = Form(...),
):
    db = get_database()

    admin = db.admins.find_one({"email": email.lower().strip()})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": admin["email"]})

    return {
        "message":      "Login successful",
        "access_token": token,
        "token_type":   "bearer",
    }
