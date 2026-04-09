from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from app.core.database import get_database
from app.utils.jwt_handler import verify_token
from app.utils.serializer import serialize_mongo

router   = APIRouter(prefix="/admin/users", tags=["User Management"])
security = HTTPBearer()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = verify_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=403, detail="Invalid or expired token")
    return payload


def valid_oid(user_id: str) -> ObjectId:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail=f"Invalid ID: {user_id}")
    return ObjectId(user_id)


# ── GET ALL ──────────────────────────────────────────────────
@router.get("/")
def get_all_users(admin=Depends(get_current_admin)):
    db = get_database()

    # ONE-TIME FIX: add is_banned=False to every old user doc missing the field
    db.users.update_many(
        {"is_banned": {"$exists": False}},
        {"$set": {"is_banned": False}}
    )

    users = list(db.users.find({}, {"password": 0}).sort("created_at", -1))
    return serialize_mongo(users)


# ── BAN ───────────────────────────────────────────────────────
@router.put("/ban/{user_id}")
def ban_user(user_id: str, admin=Depends(get_current_admin)):
    oid = valid_oid(user_id)
    db  = get_database()

    user = db.users.find_one({"_id": oid}, {"_id": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.users.update_one({"_id": oid}, {"$set": {"is_banned": True}})
    return {"message": "User banned successfully", "user_id": user_id}


# ── UNBAN ─────────────────────────────────────────────────────
@router.put("/unban/{user_id}")
def unban_user(user_id: str, admin=Depends(get_current_admin)):
    oid = valid_oid(user_id)
    db  = get_database()

    user = db.users.find_one({"_id": oid}, {"_id": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.users.update_one({"_id": oid}, {"$set": {"is_banned": False}})
    return {"message": "User unbanned successfully", "user_id": user_id}


# ── DELETE ────────────────────────────────────────────────────
@router.delete("/{user_id}")
def delete_user(user_id: str, admin=Depends(get_current_admin)):
    oid = valid_oid(user_id)
    db  = get_database()

    result = db.users.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    db.wallets.delete_many({"user_id": str(oid)})
    db.wallets.delete_many({"user_id": oid})
    db.notifications.delete_many({"user_id": str(oid)})
    db.ratings.delete_many({"user_id": str(oid)})

    return {"message": "User deleted successfully", "user_id": user_id}


# ── GET ONE ───────────────────────────────────────────────────
@router.get("/{user_id}")
def get_user(user_id: str, admin=Depends(get_current_admin)):
    oid  = valid_oid(user_id)
    db   = get_database()
    user = db.users.find_one({"_id": oid}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_mongo(user)
