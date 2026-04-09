from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from app.core.database import get_database
from app.core.dependencies import get_current_admin

router = APIRouter(prefix="/admin/analytics", tags=["Analytics"])


# ── DASHBOARD SUMMARY ─────────────────────────────────────────
@router.get("/dashboard")
def dashboard(admin=Depends(get_current_admin)):
    db = get_database()
    return {
        "total_users":               db.users.count_documents({}),
        "total_teachers":            db.users.count_documents({"role": "teacher"}),
        "pending_teacher_requests":  db.users.count_documents({"teacher_verification.status": "pending"}),
        "approved_teachers":         db.users.count_documents({"teacher_verification.status": "approved"}),
        "rejected_teachers":         db.users.count_documents({"teacher_verification.status": "rejected"}),
        "banned_users":              db.users.count_documents({"is_banned": True}),
        "total_courses":             db.courses.count_documents({}),
        "total_sessions":            db.sessions.count_documents({}),
        "active_sessions":           db.sessions.count_documents({"status": "active"}),
        "total_ratings":             db.ratings.count_documents({}),
    }


# ── USER GROWTH ───────────────────────────────────────────────
@router.get("/user-growth")
def user_growth(admin=Depends(get_current_admin)):
    db = get_database()
    now = datetime.utcnow()
    return {
        "new_users_last_7_days":  db.users.count_documents({"created_at": {"$gte": now - timedelta(days=7)}}),
        "new_users_last_30_days": db.users.count_documents({"created_at": {"$gte": now - timedelta(days=30)}}),
    }


# ── TEACHER STATS ─────────────────────────────────────────────
@router.get("/teacher-stats")
def teacher_stats(admin=Depends(get_current_admin)):
    db = get_database()
    return {
        "pending":  db.users.count_documents({"teacher_verification.status": "pending"}),
        "approved": db.users.count_documents({"teacher_verification.status": "approved"}),
        "rejected": db.users.count_documents({"teacher_verification.status": "rejected"}),
    }
