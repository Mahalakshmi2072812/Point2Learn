from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.core.database import get_database
from app.core.dependencies import get_current_admin
from app.utils.serializer import serialize_mongo

router = APIRouter(prefix="/admin/ratings", tags=["Rating Monitor"])


# ── ALL RATINGS ───────────────────────────────────────────────
@router.get("/all")
def get_all_ratings(admin=Depends(get_current_admin)):
    db = get_database()
    ratings = list(db.ratings.find().sort("created_at", -1))
    return serialize_mongo(ratings)


# ── SUSPICIOUS (> 5 ratings submitted by same user) ───────────
@router.get("/suspicious")
def get_suspicious_ratings(admin=Depends(get_current_admin)):
    db = get_database()
    pipeline = [
        {"$group": {"_id": "$user_id", "total_ratings": {"$sum": 1}}},
        {"$match": {"total_ratings": {"$gt": 5}}},
        {"$sort": {"total_ratings": -1}},
    ]
    result = list(db.ratings.aggregate(pipeline))
    return serialize_mongo(result)


# ── LOW-RATED TEACHERS (avg < 3) ──────────────────────────────
@router.get("/low-rated-teachers")
def low_rated_teachers(admin=Depends(get_current_admin)):
    db = get_database()
    pipeline = [
        {
            "$group": {
                "_id":            "$teacher_id",
                "average_rating": {"$avg": "$rating"},
                "total_reviews":  {"$sum": 1},
            }
        },
        {"$match": {"average_rating": {"$lt": 3}}},
        {"$sort": {"average_rating": 1}},
    ]
    result = list(db.ratings.aggregate(pipeline))
    return serialize_mongo(result)


# ── DELETE RATING ─────────────────────────────────────────────
@router.delete("/{rating_id}")
def delete_rating(rating_id: str, admin=Depends(get_current_admin)):
    if not ObjectId.is_valid(rating_id):
        raise HTTPException(status_code=400, detail="Invalid rating ID format")
    db = get_database()
    result = db.ratings.delete_one({"_id": ObjectId(rating_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rating not found")
    return {"message": "Rating deleted successfully"}
