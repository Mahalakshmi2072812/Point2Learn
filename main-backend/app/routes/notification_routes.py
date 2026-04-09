from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.core.database import get_db
from app.utils.jwt_handler import get_current_user

router = APIRouter()


def _build_query(user_id, user_role="user"):
    """Build $or query that matches ALL notification sources."""
    return {"$or": [
        # User backend: create_notification() stores user_id as string
        {"user_id": user_id},
        # User backend: session_routes insert_many stores user_id as string
        # Also match if somehow stored as ObjectId
        {"user_id": ObjectId(user_id)},
        # Admin backend (port 8001): send-user stores target_user_id
        {"target_user_id": user_id, "type": "single"},
        # Admin backend (port 8001): send-all broadcast
        {"type": "all", "target_user_id": None},
        # Admin backend (port 8001): send-teachers
        *([ {"type": "teacher", "target_user_id": None} ] if user_role == "teacher" else []),
    ]}


# GET MY NOTIFICATIONS
@router.get("/")
def get_my_notifications(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = current_user["user_id"]
    user_role = current_user.get("role", "user")

    query = _build_query(user_id, user_role)
    print(f"[NOTIF GET] user_id='{user_id}' role='{user_role}'")

    notifications = []
    for n in db.notifications.find(query).sort("created_at", -1):
        notifications.append({
            "id": str(n["_id"]),
            "title": n.get("title", ""),
            "message": n.get("message", ""),
            "type": n.get("type", "info"),
            "is_read": n.get("is_read", False),
            "created_at": n.get("created_at")
        })

    print(f"[NOTIF GET] Found {len(notifications)} notifications")
    return notifications


# MARK AS READ
@router.post("/read/{notification_id}")
def mark_as_read(notification_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    result = db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}


# UNREAD COUNT
@router.get("/unread-count")
def unread_count(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = current_user["user_id"]
    user_role = current_user.get("role", "user")

    query = _build_query(user_id, user_role)
    query["is_read"] = {"$ne": True}

    count = db.notifications.count_documents(query)
    return {"unread_notifications": count}


# DELETE
@router.delete("/{notification_id}")
def delete_notification(notification_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    result = db.notifications.delete_one({"_id": ObjectId(notification_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}


# DEBUG - check what's in the notifications collection
@router.get("/debug")
def debug_notifications(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = current_user["user_id"]

    # Count total notifications
    total = db.notifications.count_documents({})

    # Count by different query patterns
    by_user_id_str = db.notifications.count_documents({"user_id": user_id})
    by_user_id_oid = db.notifications.count_documents({"user_id": ObjectId(user_id)})
    by_target_single = db.notifications.count_documents({"target_user_id": user_id, "type": "single"})
    by_type_all = db.notifications.count_documents({"type": "all"})

    # Last 10 notifications (any user)
    recent = []
    for n in db.notifications.find().sort("created_at", -1).limit(10):
        recent.append({
            "id": str(n["_id"]),
            "has_user_id": "user_id" in n,
            "user_id_value": str(n.get("user_id", "MISSING")),
            "user_id_type": type(n.get("user_id")).__name__,
            "has_target_user_id": "target_user_id" in n,
            "target_user_id_value": str(n.get("target_user_id", "MISSING")),
            "type": n.get("type", "MISSING"),
            "title": n.get("title", ""),
        })

    return {
        "your_user_id": user_id,
        "total_in_db": total,
        "match_user_id_string": by_user_id_str,
        "match_user_id_objectid": by_user_id_oid,
        "match_target_user_id_single": by_target_single,
        "match_type_all": by_type_all,
        "recent_10": recent,
    }
