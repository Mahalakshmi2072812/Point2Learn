from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.utils.jwt_handler import get_current_user
from app.utils.notification_helper import create_notification

router = APIRouter()

SESSION_COST = 500
TEACHER_EARNING_PER_STUDENT = 10
JOIN_WINDOW_MINUTES = 10
MIN_ATTENDANCE_PERCENT = 50


@router.post("/start/{course_id}")
def start_session(course_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    teacher_id = ObjectId(current_user["user_id"])

    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course["teacher_id"] != teacher_id:
        raise HTTPException(status_code=403, detail="Only the course teacher can start a session")

    existing = db.sessions.find_one({"course_id": ObjectId(course_id), "status": "active"})
    if existing:
        raise HTTPException(status_code=400, detail="Session already active for this course")

    room_name    = f"point2learn-{uuid.uuid4()}"
    meeting_link = f"https://meet.jit.si/{room_name}"
    started_at   = datetime.utcnow()
    join_deadline = started_at + timedelta(minutes=JOIN_WINDOW_MINUTES)

    session = {
        "teacher_id":    teacher_id,
        "course_id":     ObjectId(course_id),
        "meeting_link":  meeting_link,
        "attendees":     [],
        "started_at":    started_at,
        "join_deadline": join_deadline,
        "status":        "active"
    }
    db.sessions.insert_one(session)

    # Send notification to each enrolled student
    student_ids = course.get("students", [])
    course_title = course.get("title", "your course")
    print(f"[SESSION START] course='{course_title}' students={len(student_ids)}")

    for sid in student_ids:
        create_notification(
            user_id=str(sid),
            title=f"Live session started - {course_title}",
            message=f"Your teacher just started a live session for '{course_title}'. Join now within 10 minutes!",
            type_="session_start"
        )

    return {
        "message":            "Session started",
        "meeting_link":       meeting_link,
        "join_allowed_until": join_deadline.isoformat(),
        "started_at":         started_at.isoformat(),
    }


@router.post("/attend/{course_id}")
def attend_session(course_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    student_id = ObjectId(current_user["user_id"])

    session = db.sessions.find_one({"course_id": ObjectId(course_id), "status": "active"})
    if not session:
        raise HTTPException(status_code=404, detail="No active session for this course")

    if datetime.utcnow() > session["join_deadline"]:
        raise HTTPException(status_code=403, detail="Join window closed (10 minutes passed)")

    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if student_id not in course.get("students", []):
        raise HTTPException(status_code=403, detail="Join this course first before attending sessions")

    if student_id in session.get("attendees", []):
        raise HTTPException(status_code=400, detail="You have already attended this session")

    wallet = db.wallets.find_one({"user_id": student_id})
    if not wallet or wallet["points"] < SESSION_COST:
        raise HTTPException(status_code=403, detail=f"Insufficient credits. Need {SESSION_COST}, you have {wallet['points'] if wallet else 0}")

    db.wallets.update_one({"user_id": student_id}, {"$inc": {"points": -SESSION_COST}})
    db.sessions.update_one({"_id": session["_id"]}, {"$push": {"attendees": student_id}})
    db.courses.update_one({"_id": ObjectId(course_id)}, {"$inc": {f"attendance.{student_id}": 1}})

    return {"message": "Joined session", "meeting_link": session["meeting_link"]}


@router.post("/end/{course_id}")
def end_session(course_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    teacher_id = ObjectId(current_user["user_id"])

    session = db.sessions.find_one({
        "teacher_id": teacher_id,
        "course_id":  ObjectId(course_id),
        "status":     "active"
    })
    if not session:
        raise HTTPException(status_code=404, detail="No active session found for this course")

    attended_count = len(session.get("attendees", []))
    earnings = attended_count * TEACHER_EARNING_PER_STUDENT

    db.wallets.update_one({"user_id": teacher_id}, {"$inc": {"points": earnings}})
    db.sessions.update_one(
        {"_id": session["_id"]},
        {"$set": {"status": "completed", "ended_at": datetime.utcnow(), "coins_earned": earnings}}
    )

    return {
        "message":          "Session ended",
        "students_attended": attended_count,
        "teacher_earned":   earnings
    }


@router.post("/remove-student/{course_id}/{student_id}")
def remove_low_attendance(course_id: str, student_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    teacher_id = ObjectId(current_user["user_id"])
    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if course["teacher_id"] != teacher_id:
        raise HTTPException(status_code=403, detail="Only the course teacher can remove students")

    total_sessions = db.sessions.count_documents({"course_id": ObjectId(course_id), "status": "completed"})
    student_attendance = course.get("attendance", {}).get(student_id, 0)
    if total_sessions == 0:
        raise HTTPException(status_code=400, detail="No completed sessions yet")

    attendance_percent = (student_attendance / total_sessions) * 100
    if attendance_percent >= MIN_ATTENDANCE_PERCENT:
        raise HTTPException(status_code=400, detail="Student attendance is sufficient, cannot remove")

    db.courses.update_one({"_id": ObjectId(course_id)}, {"$pull": {"students": ObjectId(student_id)}})
    return {"message": "Student removed due to low attendance", "attendance_percent": attendance_percent}


@router.get("/active/{course_id}")
def get_active_session(course_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    session = db.sessions.find_one({"course_id": ObjectId(course_id), "status": "active"})
    if not session:
        return {"active": False, "meeting_link": None, "join_deadline": None, "started_at": None}

    now = datetime.utcnow()
    deadline = session.get("join_deadline")
    started  = session.get("started_at")
    window_open = deadline and now <= deadline

    elapsed_minutes = int((now - started).total_seconds() / 60) if started else 0
    remaining_seconds = max(0, int((deadline - now).total_seconds())) if deadline and window_open else 0

    return {
        "active":            True,
        "meeting_link":      session["meeting_link"],
        "join_deadline":     deadline.isoformat() if deadline else None,
        "started_at":        started.isoformat() if started else None,
        "window_open":       window_open,
        "attendees_count":   len(session.get("attendees", [])),
        "elapsed_minutes":   elapsed_minutes,
        "remaining_seconds": remaining_seconds,
    }
