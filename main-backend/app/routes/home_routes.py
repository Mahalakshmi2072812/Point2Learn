from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.utils.jwt_handler import get_current_user

router = APIRouter()


# =====================================================
# USER HOME DASHBOARD
# =====================================================

@router.get("/")
def user_home(current_user=Depends(get_current_user)):

    db = get_db()

    try:
        user_id = ObjectId(current_user["user_id"])
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # -----------------------------
    # Get user
    # -----------------------------
    user = db.users.find_one({"_id": user_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # -----------------------------
    # Wallet
    # -----------------------------
    wallet = db.wallets.find_one({"user_id": user_id})
    wallet_points = wallet["points"] if wallet else 0

    # -----------------------------
    # Enrolled Courses
    # -----------------------------
    enrolled_count = db.courses.count_documents({
        "students": user_id
    })

    # -----------------------------
    # Active Sessions
    # -----------------------------
    active_sessions = db.sessions.count_documents({
        "status": "active",
        "$or": [
            {"teacher_id": user_id},
            {"attendees": user_id}
        ]
    })

    # -----------------------------
    # Notifications (match both ObjectId and string)
    # -----------------------------
    unread_notifications = db.notifications.count_documents({
        "user_id": {"$in": [user_id, str(user_id)]},
        "is_read": False
    })

    # -----------------------------
    # Teacher status
    # -----------------------------
    teacher_status = user.get("teacher_verification", {}).get("status", "not_requested")

    return {
        "success": True,
        "user_name": user.get("name"),
        "role": user.get("role"),
        "wallet_points": wallet_points,
        "is_teacher": user.get("is_teacher", False),
        "teacher_verification_status": teacher_status,
        "enrolled_courses": enrolled_count,
        "active_sessions": active_sessions,
        "unread_notifications": unread_notifications,
        "member_since": user.get("created_at")
    }