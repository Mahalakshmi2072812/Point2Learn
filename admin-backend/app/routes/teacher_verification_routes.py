from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.core.database import get_database
from app.core.dependencies import get_current_admin
from app.utils.serializer import serialize_mongo

router = APIRouter(prefix="/admin/teachers", tags=["Teacher Verification"])

# Never return passwords in teacher listings
_NO_PASSWORD = {"password": 0}


def _validate_id(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    return ObjectId(user_id)


# ── PENDING ───────────────────────────────────────────────────
@router.get("/pending")
def get_pending_teachers(admin=Depends(get_current_admin)):
    db = get_database()
    teachers = list(
        db.users.find(
            {"teacher_verification.status": "pending"},
            _NO_PASSWORD,
        ).sort("created_at", -1)
    )
    return serialize_mongo(teachers)


# ── APPROVED ──────────────────────────────────────────────────
@router.get("/approved")
def get_approved_teachers(admin=Depends(get_current_admin)):
    db = get_database()
    teachers = list(
        db.users.find(
            {"teacher_verification.status": "approved"},
            _NO_PASSWORD,
        ).sort("created_at", -1)
    )
    return serialize_mongo(teachers)


# ── ALL (pending + approved + rejected) ───────────────────────
@router.get("/all")
def get_all_teachers(admin=Depends(get_current_admin)):
    db = get_database()
    teachers = list(
        db.users.find(
            {"teacher_verification": {"$exists": True, "$ne": None}},
            _NO_PASSWORD,
        ).sort("created_at", -1)
    )
    return serialize_mongo(teachers)


# ── APPROVE ───────────────────────────────────────────────────
@router.put("/approve/{user_id}")
def approve_teacher(user_id: str, admin=Depends(get_current_admin)):
    oid = _validate_id(user_id)
    db = get_database()

    user = db.users.find_one({"_id": oid}, {"teacher_verification": 1, "role": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.get("teacher_verification"):
        raise HTTPException(status_code=400, detail="User has no teacher application")
    if user["teacher_verification"].get("status") == "approved":
        raise HTTPException(status_code=400, detail="Teacher is already approved")

    db.users.update_one(
        {"_id": oid},
        {
            "$set": {
                "role": "teacher",
                "teacher_verification.status":     "approved",
                "teacher_verification.verified_at": datetime.utcnow(),
                "teacher_verification.verified_by": admin.get("sub"),
            }
        },
    )
    return {"message": "Teacher approved successfully"}


# ── REJECT ────────────────────────────────────────────────────
@router.put("/reject/{user_id}")
def reject_teacher(user_id: str, admin=Depends(get_current_admin)):
    oid = _validate_id(user_id)
    db = get_database()

    user = db.users.find_one({"_id": oid}, {"teacher_verification": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.get("teacher_verification"):
        raise HTTPException(status_code=400, detail="User has no teacher application")
    if user["teacher_verification"].get("status") == "rejected":
        raise HTTPException(status_code=400, detail="Application is already rejected")

    db.users.update_one(
        {"_id": oid},
        {
            "$set": {
                # Keep role as "user" — do NOT set teacher on reject
                "role": "user",
                "teacher_verification.status":     "rejected",
                "teacher_verification.verified_at": datetime.utcnow(),
                "teacher_verification.verified_by": admin.get("sub"),
            }
        },
    )
    return {"message": "Teacher application rejected"}
