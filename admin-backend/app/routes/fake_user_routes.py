from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from app.core.database import get_database
from app.core.dependencies import get_current_admin
from app.utils.serializer import serialize_mongo

router = APIRouter(prefix="/admin/fake-users", tags=["Fake User Detection"])


# ── SAME IP (> 3 accounts from one IP) ───────────────────────
@router.get("/same-ip")
def detect_same_ip(admin=Depends(get_current_admin)):
    db = get_database()
    pipeline = [
        # BUG FIX: exclude documents where ip_address is null/missing
        # Without this, ALL users without an IP get grouped together
        {"$match": {"ip_address": {"$ne": None, "$exists": True, "$ne": ""}}},
        {
            "$group": {
                "_id":   "$ip_address",
                "count": {"$sum": 1},
                "users": {"$push": {"name": "$name", "email": "$email", "created_at": "$created_at"}},
            }
        },
        {"$match": {"count": {"$gt": 3}}},
        {"$sort": {"count": -1}},
    ]
    result = list(db.users.aggregate(pipeline))
    return serialize_mongo(result)


# ── RATING SPAM (> 5 ratings by same user) ───────────────────
@router.get("/rating-spam")
def detect_rating_spam(admin=Depends(get_current_admin)):
    db = get_database()
    pipeline = [
        {
            "$group": {
                "_id":          "$user_id",
                "rating_count": {"$sum": 1},
            }
        },
        {"$match": {"rating_count": {"$gt": 5}}},
        {"$sort": {"rating_count": -1}},
    ]
    result = list(db.ratings.aggregate(pipeline))
    return serialize_mongo(result)


# ── RECENT BULK REGISTRATIONS (last 24 h) ────────────────────
@router.get("/recent-bulk")
def detect_recent_bulk(admin=Depends(get_current_admin)):
    db = get_database()
    last_24h = datetime.utcnow() - timedelta(hours=24)

    # BUG FIX: never return passwords; only return safe fields
    users = list(
        db.users.find(
            {"created_at": {"$gte": last_24h}},
            {"password": 0},
        ).sort("created_at", -1)
    )
    return serialize_mongo(users)
