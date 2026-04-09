from fastapi import APIRouter, Depends
from app.core.database import get_database
from app.core.dependencies import get_current_admin
from app.utils.serializer import serialize_mongo

router = APIRouter(prefix="/admin", tags=["Admin Home"])


@router.get("/home")
def admin_home(admin=Depends(get_current_admin)):
    """Quick overview — same data as /analytics/dashboard plus recent users."""
    db = get_database()

    recent_users = list(
        db.users.find(
            {},
            {"password": 0},   # BUG FIX: never return passwords
        ).sort("created_at", -1).limit(5)
    )

    recent_pending = list(
        db.users.find(
            {"teacher_verification.status": "pending"},
            {"password": 0},   # BUG FIX: never return passwords
        ).sort("created_at", -1).limit(5)
    )

    return serialize_mongo({
        "total_users":               db.users.count_documents({}),
        "total_teachers":            db.users.count_documents({"role": "teacher"}),
        "pending_teacher_requests":  db.users.count_documents({"teacher_verification.status": "pending"}),
        "total_ratings":             db.ratings.count_documents({}),
        "recent_users":              recent_users,
        "recent_teacher_requests":   recent_pending,
    })
