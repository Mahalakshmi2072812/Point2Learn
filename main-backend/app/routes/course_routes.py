from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.utils.jwt_handler import get_current_user
from app.utils.notification_helper import create_notification

router = APIRouter()


# -----------------------------
# CREATE COURSE (ONLY VERIFIED TEACHER)
# -----------------------------
@router.post("/create")
def create_course(
    title: str,
    description: str,
    session_timing: str = "",
    current_user=Depends(get_current_user)
):
    db = get_db()
    user_id = ObjectId(current_user["user_id"])

    user = db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    verification = user.get("teacher_verification")

    if not verification or verification.get("status") != "approved":
        raise HTTPException(
            status_code=403,
            detail="Only verified teachers can create courses"
        )

    course = {
        "title": title,
        "description": description,
        "session_timing": session_timing,
        "teacher_id": user_id,
        "created_at": datetime.utcnow(),
        "students": []
    }

    result = db.courses.insert_one(course)

    return {
        "message": "Course created successfully",
        "course_id": str(result.inserted_id)
    }


# -----------------------------
# GET ALL COURSES
# -----------------------------
@router.get("/")
def get_all_courses():
    db = get_db()

    courses = []
    for course in db.courses.find():
        courses.append({
            "id": str(course["_id"]),
            "title": course["title"],
            "description": course["description"],
            "session_timing": course.get("session_timing", ""),
            "teacher_id": str(course["teacher_id"]),
            "students_count": len(course.get("students", []))
        })

    return courses


# -----------------------------
# GET MY COURSES (CREATED)
# -----------------------------
@router.get("/my")
def get_my_courses(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = ObjectId(current_user["user_id"])

    courses = []
    for course in db.courses.find({"teacher_id": user_id}):
        courses.append({
            "id": str(course["_id"]),
            "title": course["title"],
            "description": course["description"],
            "session_timing": course.get("session_timing", ""),
            "students_count": len(course.get("students", []))
        })

    return courses


# -----------------------------
# NEW: GET ENROLLED COURSES
# -----------------------------
@router.get("/enrolled")
def get_enrolled_courses(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = ObjectId(current_user["user_id"])

    courses = []
    for course in db.courses.find({"students": user_id}):
        courses.append({
            "id": str(course["_id"]),
            "title": course["title"],
            "description": course["description"],
            "session_timing": course.get("session_timing", ""),
            "teacher_id": str(course["teacher_id"]),
            "students_count": len(course.get("students", []))
        })

    return courses


# -----------------------------
# JOIN COURSE (STUDENT ACTION)
# -----------------------------
@router.post("/join/{course_id}")
def join_course(
    course_id: str,
    current_user=Depends(get_current_user)
):
    db = get_db()
    user_id = ObjectId(current_user["user_id"])

    # Fix: validate ObjectId
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID")

    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course["teacher_id"] == user_id:
        raise HTTPException(
            status_code=400,
            detail="Teacher cannot join own course"
        )

    if user_id in course.get("students", []):
        raise HTTPException(
            status_code=400,
            detail="Already joined this course"
        )

    db.courses.update_one(
        {"_id": ObjectId(course_id)},
        {"$push": {"students": user_id}}
    )

    # Notify teacher
    user = db.users.find_one({"_id": user_id})
    student_name = user.get("name", "A student") if user else "A student"
    create_notification(
        user_id=str(course["teacher_id"]),
        title="New Student Enrolled",
        message=f"{student_name} joined your course '{course.get('title', '')}'.",
        type_="info"
    )

    return {
        "message": "Course joined successfully",
        "course_id": course_id
    }