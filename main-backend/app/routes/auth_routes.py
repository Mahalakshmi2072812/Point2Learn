from fastapi import APIRouter, HTTPException, Depends, status, Form, Body
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timedelta
import secrets

from app.models.user_model import create_user, get_user_by_email
from app.utils.password_hash import verify_password, hash_password
from app.utils.jwt_handler import (
    create_access_token,
    get_current_user,
    security
)
from app.core.database import get_db

router = APIRouter()

RESET_EXPIRY_MINUTES = 5


class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    new_password: str


# @router.post("/register", status_code=status.HTTP_201_CREATED)
# def register(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


# @router.post("/register")
# def register(body: RegisterRequest):

@router.post("/register")
def register(body: RegisterRequest = Body(...)):
    if get_user_by_email(body.email):
        raise HTTPException(status_code=400, detail="User already exists")

    create_user(body.name, body.email, body.password)

    return {"success": True, "message": "Registered successfully"}

#     if get_user_by_email(body.email):
#         raise HTTPException(status_code=400, detail="User already exists")

#     create_user(body.name, body.email, body.password)

#     return {"success": True, "message": "Registered successfully"}

    
    
#     if get_user_by_email(email):
#         raise HTTPException(status_code=400, detail="User already exists")
#     create_user(name, email, password)
#     return {"success": True, "message": "Registered successfully. Please complete payment."}


# @router.post("/activate-payment")
# def activate_payment(email: str = Form(...)):

class PaymentRequest(BaseModel):
    email: str

@router.post("/activate-payment")
def activate_payment(body: PaymentRequest):
    db = get_db()

    user = db.users.find_one({"email": body.email})   # ✅ FIXED

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"payment_status": "paid", "payment_activated_at": datetime.utcnow()}}
    )

    return {"success": True, "message": "Payment activated successfully"}


# @router.post("/login")
# def login(email: str = Form(...), password: str = Form(...)):
class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(body: LoginRequest):
    db = get_db()

    user = db.users.find_one({"email": body.email})   # ✅ FIXED

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(body.password, user["password"]):   # ✅ FIXED
        raise HTTPException(status_code=401, detail="Invalid password")

    if user.get("payment_status") != "paid":
        raise HTTPException(status_code=403, detail="Payment not completed")

    token = create_access_token({
        "user_id": str(user["_id"]),
        "role": user.get("role", "user")
    })

    return {"success": True, "access_token": token, "token_type": "bearer"}




@router.post("/logout")
def logout(credentials=Depends(security), current_user=Depends(get_current_user)):
    db = get_db()
    token = credentials.credentials
    db.token_blacklist.insert_one({
        "token": token,
        "user_id": current_user["user_id"],
        "logged_out_at": datetime.utcnow()
    })
    return {"success": True, "message": "Logged out successfully"}


@router.post("/logout-all")
def logout_all(current_user=Depends(get_current_user)):
    db = get_db()
    db.token_blacklist.insert_one({
        "token": "ALL",
        "user_id": current_user["user_id"],
        "logged_out_at": datetime.utcnow(),
        "global_logout": True
    })
    return {"success": True, "message": "Logged out from all devices"}


# =====================================================
# FORGOT PASSWORD — token stored in MongoDB (not RAM)
# =====================================================

@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest):
    db = get_db()
    user = db.users.find_one({"email": body.email})
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    # Remove any existing tokens for this email first
    db.reset_tokens.delete_many({"email": body.email})

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=RESET_EXPIRY_MINUTES)

    # ✅ FIX: persist token in MongoDB so server restarts don't lose it
    db.reset_tokens.insert_one({
        "token": token,
        "email": body.email,
        "expires_at": expires_at
    })

    return {
        "success": True,
        "message": "Reset link generated. Valid for 5 minutes.",
        "reset_token": token,
        "expires_in_minutes": RESET_EXPIRY_MINUTES,
    }


@router.get("/reset-password/{token}")
def validate_reset_token(token: str):
    db = get_db()
    data = db.reset_tokens.find_one({"token": token})

    if not data:
        raise HTTPException(status_code=400, detail="Invalid or already used reset link")

    if datetime.utcnow() > data["expires_at"]:
        db.reset_tokens.delete_one({"token": token})
        raise HTTPException(status_code=400, detail="Reset link has expired (5 min limit)")

    remaining = int((data["expires_at"] - datetime.utcnow()).total_seconds())
    return {"success": True, "email": data["email"], "remaining_seconds": remaining}


@router.post("/reset-password/{token}")
def reset_password(token: str, body: ResetPasswordRequest):
    db = get_db()
    data = db.reset_tokens.find_one({"token": token})

    if not data:
        raise HTTPException(status_code=400, detail="Invalid or already used reset link")

    if datetime.utcnow() > data["expires_at"]:
        db.reset_tokens.delete_one({"token": token})
        raise HTTPException(status_code=400, detail="Reset link has expired (5 min limit)")

    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = db.users.find_one({"email": data["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.users.update_one({"_id": user["_id"]}, {"$set": {"password": hash_password(body.new_password)}})

    # ✅ Delete token after use
    db.reset_tokens.delete_one({"token": token})

    return {"success": True, "message": "Password has been reset successfully"}
