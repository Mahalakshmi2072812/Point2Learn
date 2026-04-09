from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timedelta

from app.core.database import get_db
from app.utils.jwt_handler import get_current_user
from app.utils.notification_helper import create_notification

router = APIRouter()

ONLINE_THRESHOLD_MINUTES = 2


def require_admin(current_user):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


# -------------------------------------------------
# ADMIN DASHBOARD STATS
# -------------------------------------------------
@router.get("/stats")
def admin_stats(current_user=Depends(get_current_user)):
    require_admin(current_user)
    db = get_db()

    now = datetime.utcnow()
    threshold = now - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)

    total_users = db.users.count_documents({})
    paid_users = db.users.count_documents({"payment_status": "paid"})
    teachers = db.users.count_documents({"role": "teacher"})
    pending_requests = db.users.count_documents({"teacher_verification.status": "pending"})
    total_courses = db.courses.count_documents({})
    active_sessions = db.sessions.count_documents({"status": "active"})
    online_users = db.users.count_documents({"last_active": {"$gte": threshold}})

    return {
        "total_users": total_users,
        "paid_users": paid_users,
        "teachers": teachers,
        "pending_requests": pending_requests,
        "total_courses": total_courses,
        "active_sessions": active_sessions,
        "online_users": online_users,
    }


# -------------------------------------------------
# GET ALL PENDING TEACHER REQUESTS
# -------------------------------------------------
@router.get("/teacher-requests")
def get_pending_requests(current_user=Depends(get_current_user)):
    require_admin(current_user)
    db = get_db()

    pending_users = db.users.find({
        "teacher_verification.status": "pending"
    })

    results = []
    for user in pending_users:
        verification = user.get("teacher_verification", {})
        results.append({
            "user_id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "submitted_at": verification.get("submitted_at"),
            "basic_details": verification.get("basic_details", {}),
            "institution_details": verification.get("institution_details", {}),
            "professional_details": verification.get("professional_details", {}),
            "professional_links": verification.get("professional_links", {}),
            "bio": verification.get("bio", ""),
        })

    return results


# -------------------------------------------------
# APPROVE TEACHER REQUEST
# -------------------------------------------------
@router.post("/approve-teacher/{user_id}")
def approve_teacher(user_id: str, current_user=Depends(get_current_user)):
    require_admin(current_user)
    db = get_db()

    target_user = db.users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    verification = target_user.get("teacher_verification", {})
    if verification.get("status") != "pending":
        raise HTTPException(status_code=400, detail="No pending verification request for this user")

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "role": "teacher",
                "is_teacher": True,
                "teacher_verification.status": "approved",
                "teacher_verification.verified_at": datetime.utcnow(),
            }
        }
    )

    create_notification(
        user_id=user_id,
        title="Teacher Verification Approved",
        message="Congratulations! Your teacher verification has been approved. You can now create courses and start live sessions.",
        type_="teacher_approved"
    )

    return {
        "success": True,
        "message": f"Teacher verification approved for {target_user.get('name', user_id)}"
    }


# -------------------------------------------------
# REJECT TEACHER REQUEST
# -------------------------------------------------
@router.post("/reject-teacher/{user_id}")
def reject_teacher(user_id: str, reason: str = "Does not meet verification criteria", current_user=Depends(get_current_user)):
    require_admin(current_user)
    db = get_db()

    target_user = db.users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    verification = target_user.get("teacher_verification", {})
    if verification.get("status") != "pending":
        raise HTTPException(status_code=400, detail="No pending verification request for this user")

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "teacher_verification.status": "rejected",
                "teacher_verification.rejection_reason": reason,
                "teacher_verification.verified_at": datetime.utcnow(),
            }
        }
    )

    create_notification(
        user_id=user_id,
        title="Teacher Verification Rejected",
        message=f"Your teacher verification request was not approved. Reason: {reason}. You may reapply after addressing the feedback.",
        type_="teacher_rejected"
    )

    return {
        "success": True,
        "message": f"Teacher verification rejected for {target_user.get('name', user_id)}"
    }


# -------------------------------------------------
# GET ALL USERS (with online status)
# -------------------------------------------------
@router.get("/users")
def get_all_users(current_user=Depends(get_current_user)):
    require_admin(current_user)
    db = get_db()

    now = datetime.utcnow()
    threshold = now - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)

    users = []
    for user in db.users.find():
        last_active = user.get("last_active")
        is_online = False
        if last_active and isinstance(last_active, datetime):
            is_online = last_active >= threshold

        users.append({
            "user_id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "user"),
            "is_teacher": user.get("is_teacher", False),
            "payment_status": user.get("payment_status", "unpaid"),
            "teacher_verification_status": user.get("teacher_verification", {}).get("status", "not_requested"),
            "created_at": user.get("created_at"),
            "last_active": last_active.isoformat() if last_active else None,
            "is_online": is_online,
        })

    return users


# -------------------------------------------------
# SEND NOTIFICATION TO A USER (ADMIN)
# -------------------------------------------------
@router.post("/send-notification/{user_id}")
def send_notification(user_id: str, title: str, message: str, current_user=Depends(get_current_user)):
    require_admin(current_user)
    db = get_db()

    target_user = db.users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    print(f"[ADMIN SEND] Sending to user_id='{user_id}' title='{title}'")

    result = create_notification(
        user_id=user_id,
        title=title,
        message=message,
        type_="admin_message"
    )

    print(f"[ADMIN SEND] Result: {result}")

    return {
        "success": True,
        "message": f"Notification sent to {target_user.get('name', user_id)}",
        "notification_id": str(result) if result else None
    }


# -------------------------------------------------
# BROADCAST NOTIFICATION TO ALL USERS (ADMIN)
# -------------------------------------------------
@router.post("/broadcast-notification")
def broadcast_notification(title: str, message: str, current_user=Depends(get_current_user)):
    require_admin(current_user)
    db = get_db()

    all_users = db.users.find({"payment_status": "paid"}, {"_id": 1})
    user_ids = [user["_id"] for user in all_users]

    if not user_ids:
        return {"success": True, "message": "No active users to notify", "count": 0}

    notifications = [
        {
            "user_id": str(uid),
            "title": title,
            "message": message,
            "type": "admin_broadcast",
            "is_read": False,
            "created_at": datetime.utcnow(),
        }
        for uid in user_ids
    ]
    db.notifications.insert_many(notifications)

    return {
        "success": True,
        "message": f"Notification sent to {len(user_ids)} users",
        "count": len(user_ids)
    }
