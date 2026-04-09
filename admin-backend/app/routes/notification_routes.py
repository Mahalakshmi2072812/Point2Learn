from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.core.database import get_database
from app.core.dependencies import get_current_admin
from app.utils.serializer import serialize_mongo

router = APIRouter(prefix="/admin/notifications", tags=["Notifications"])


# ── SEND TO ALL USERS ─────────────────────────────────────────
@router.post("/send-all")
def send_to_all(title: str, message: str, admin=Depends(get_current_admin)):
    if not title.strip() or not message.strip():
        raise HTTPException(status_code=400, detail="Title and message cannot be empty")

    db = get_database()
    db.notifications.insert_one({
        "title":          title.strip(),
        "message":        message.strip(),
        "type":           "all",
        "target_user_id": None,
        "created_at":     datetime.utcnow(),
    })
    return {"message": "Broadcast notification sent to all users"}


# ── SEND TO ALL TEACHERS ──────────────────────────────────────
@router.post("/send-teachers")
def send_to_teachers(title: str, message: str, admin=Depends(get_current_admin)):
    if not title.strip() or not message.strip():
        raise HTTPException(status_code=400, detail="Title and message cannot be empty")

    db = get_database()
    db.notifications.insert_one({
        "title":          title.strip(),
        "message":        message.strip(),
        "type":           "teacher",
        "target_user_id": None,
        "created_at":     datetime.utcnow(),
    })
    return {"message": "Notification sent to all teachers"}


# ── SEND TO SPECIFIC USER ─────────────────────────────────────
@router.post("/send-user/{user_id}")
def send_to_user(user_id: str, title: str, message: str, admin=Depends(get_current_admin)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    if not title.strip() or not message.strip():
        raise HTTPException(status_code=400, detail="Title and message cannot be empty")

    db = get_database()

    user = db.users.find_one({"_id": ObjectId(user_id)}, {"_id": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.notifications.insert_one({
        "title":          title.strip(),
        "message":        message.strip(),
        "type":           "single",
        "target_user_id": user_id,
        "created_at":     datetime.utcnow(),
    })
    return {"message": "Notification sent to user"}


# ── GET ALL NOTIFICATIONS (admin history view) ────────────────
@router.get("/all")
def get_all_notifications(admin=Depends(get_current_admin)):
    db = get_database()
    notifications = list(db.notifications.find().sort("created_at", -1).limit(100))
    return serialize_mongo(notifications)


# ── DELETE NOTIFICATION ───────────────────────────────────────
@router.delete("/{notification_id}")
def delete_notification(notification_id: str, admin=Depends(get_current_admin)):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID format")

    db = get_database()
    result = db.notifications.delete_one({"_id": ObjectId(notification_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}
