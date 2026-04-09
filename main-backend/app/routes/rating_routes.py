from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.utils.jwt_handler import get_current_user

router = APIRouter()


# -------------------------------------------------
# ⭐ ADD RATING (Student Only)
# -------------------------------------------------
@router.post("/add/{course_id}")
def add_rating(
    course_id: str,
    rating: int,
    review: str,
    current_user=Depends(get_current_user)
):
    db = get_db()
    student_id = ObjectId(current_user["user_id"])

    # Validate rating range
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # Check course
    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    teacher_id = course["teacher_id"]

    # Teacher cannot rate own course
    if teacher_id == student_id:
        raise HTTPException(status_code=400, detail="Teacher cannot rate own course")

    # Must be enrolled
    if student_id not in course.get("students", []):
        raise HTTPException(status_code=403, detail="You must join course before rating")

    # Must attend at least 1 session
    attendance = course.get("attendance", {})
    if str(student_id) not in attendance:
        raise HTTPException(
            status_code=403,
            detail="You must attend at least one session before rating"
        )

    # Only one rating per student per course
    existing = db.ratings.find_one({
        "course_id": ObjectId(course_id),
        "student_id": student_id
    })

    if existing:
        raise HTTPException(status_code=400, detail="You already rated this course")

    rating_data = {
        "teacher_id": teacher_id,
        "student_id": student_id,
        "course_id": ObjectId(course_id),
        "rating": rating,
        "review": review,
        "created_at": datetime.utcnow()
    }

    db.ratings.insert_one(rating_data)

    return {"message": "Rating submitted successfully"}
@router.get("/teacher/{teacher_id}")
def get_teacher_reviews(teacher_id: str):

    db = get_db()
    teacher_obj = ObjectId(teacher_id)

    reviews_cursor = db.ratings.find({"teacher_id": teacher_obj})

    reviews = []
    total_rating = 0
    count = 0

    for r in reviews_cursor:
        student = db.users.find_one({"_id": r["student_id"]})

        reviews.append({
            "student_name": student["name"] if student else "Unknown",
            "rating": r["rating"],
            "review": r["review"],
            "date": r["created_at"]
        })

        total_rating += r["rating"]
        count += 1

    average = round(total_rating / count, 2) if count > 0 else 0

    return {
        "teacher_id": teacher_id,
        "average_rating": average,
        "total_reviews": count,
        "reviews": reviews
    }
@router.get("/my")
def get_my_rating(current_user=Depends(get_current_user)):

    db = get_db()
    teacher_id = ObjectId(current_user["user_id"])

    reviews = list(db.ratings.find({"teacher_id": teacher_id}))

    total = sum(r["rating"] for r in reviews)
    count = len(reviews)
    average = round(total / count, 2) if count > 0 else 0

    return {
        "average_rating": average,
        "total_reviews": count
    }
@router.delete("/delete/{course_id}")
def delete_my_review(
    course_id: str,
    current_user=Depends(get_current_user)
):
    db = get_db()
    student_id = ObjectId(current_user["user_id"])

    result = db.ratings.delete_one({
        "course_id": ObjectId(course_id),
        "student_id": student_id
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")

    return {"message": "Review deleted successfully"}
