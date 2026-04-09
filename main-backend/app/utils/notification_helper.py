from datetime import datetime
from app.core.database import get_db


def create_notification(user_id, title, message, type_, reference_id=None):
    db = get_db()
    if db is None:
        print("[NOTIF ERROR] db is None!")
        return None

    uid = str(user_id)

    notification = {
        "user_id": uid,
        "title": title,
        "message": message,
        "type": type_,
        "reference_id": str(reference_id) if reference_id else None,
        "is_read": False,
        "created_at": datetime.utcnow()
    }

    try:
        result = db.notifications.insert_one(notification)
        print(f"[NOTIF CREATED] user_id='{uid}' title='{title}' _id={result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"[NOTIF ERROR] {e}")
        return None
