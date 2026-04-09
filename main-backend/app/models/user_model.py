from datetime import datetime
from app.core.database import get_db
from app.utils.password_hash import hash_password


def create_user(name, email, password):
    db = get_db()

    user = {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "role": "user",
        "payment_status": "pending",
        "created_at": datetime.utcnow()
    }

    result = db.users.insert_one(user)
    return result.inserted_id


def get_user_by_email(email: str):
    db = get_db()
    return db.users.find_one({"email": email})
