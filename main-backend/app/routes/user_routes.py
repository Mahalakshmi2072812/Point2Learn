from fastapi import APIRouter, Depends, HTTPException, status, Form
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.utils.jwt_handler import get_current_user

router = APIRouter()


# =====================================================
# 📌 GET PROFILE (AUTH REQUIRED)
# =====================================================

@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):

    db = get_db()

    user = db.users.find_one({"_id": ObjectId(current_user["user_id"])})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    wallet = db.wallets.find_one({"user_id": user["_id"]})

    # Remove sensitive data
    user.pop("password", None)

    user["_id"] = str(user["_id"])
    user["wallet_points"] = wallet["points"] if wallet else 0

    if "teacher_verification" not in user:
        user["teacher_verification"] = {
            "status": "not_requested"
        }

    return {
        "success": True,
        "data": user
    }


# =====================================================
# HEARTBEAT - track user online status
# =====================================================

@router.post("/heartbeat")
def heartbeat(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = ObjectId(current_user["user_id"])
    db.users.update_one(
        {"_id": user_id},
        {"$set": {"last_active": datetime.utcnow()}}
    )
    return {"ok": True}
# 📌 REQUEST TEACHER VERIFICATION (FIELD BOXES)
# =====================================================

@router.post("/request-teacher", status_code=status.HTTP_201_CREATED)
def request_teacher_verification(

    # 🔹 Basic Personal Details
    first_name: str = Form(...),
    last_name: str = Form(...),
    work_email: str = Form(...),
    country: str = Form(...),
    profile_photo_url: str = Form(...),

    # 🔹 Institution Details
    institution_name: str = Form(...),
    institution_website: str = Form(...),
    institution_type: str = Form(...),

    # 🔹 Professional Details
    qualification: str = Form(...),
    university_name: str = Form(...),
    graduation_year: int = Form(...),
    experience_years: int = Form(...),
    previous_company: str = Form(None),
    phone: str = Form(...),

    # 🔹 Identity Proof
    government_id_number: str = Form(...),
    id_proof_url: str = Form(...),

    # 🔹 Professional Links
    linkedin_url: str = Form(...),
    portfolio_url: str = Form(None),
    github_url: str = Form(None),
    demo_video_url: str = Form(...),

    bio: str = Form(...),

    current_user=Depends(get_current_user)
):

    db = get_db()
    user_id = ObjectId(current_user["user_id"])
    user = db.users.find_one({"_id": user_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🚫 Already teacher
    if user.get("role") == "teacher":
        raise HTTPException(
            status_code=400,
            detail="You are already a verified teacher"
        )

    existing = user.get("teacher_verification")

    if existing:
        status_existing = existing.get("status")

        if status_existing == "pending":
            raise HTTPException(
                status_code=400,
                detail="Verification request already pending"
            )

        if status_existing == "approved":
            raise HTTPException(
                status_code=400,
                detail="You are already approved"
            )

    # 🔎 Validations
    current_year = datetime.utcnow().year

    if graduation_year > current_year:
        raise HTTPException(
            status_code=400,
            detail="Graduation year cannot be in the future"
        )

    if experience_years < 0:
        raise HTTPException(
            status_code=400,
            detail="Experience cannot be negative"
        )

    # -------------------------------------------------
    # Create verification object
    # -------------------------------------------------
    verification_data = {
        "status": "pending",
        "submitted_at": datetime.utcnow(),
        "verified_at": None,
        "rejection_reason": None,

        "basic_details": {
            "first_name": first_name,
            "last_name": last_name,
            "work_email": work_email,
            "country": country,
            "profile_photo_url": profile_photo_url
        },

        "institution_details": {
            "institution_name": institution_name,
            "institution_website": institution_website,
            "institution_type": institution_type
        },

        "professional_details": {
            "qualification": qualification,
            "university_name": university_name,
            "graduation_year": graduation_year,
            "experience_years": experience_years,
            "previous_company": previous_company,
            "phone": phone
        },

        "verification_proof": {
            "government_id_number": government_id_number,
            "id_proof_url": id_proof_url
        },

        "professional_links": {
            "linkedin_url": linkedin_url,
            "portfolio_url": portfolio_url,
            "github_url": github_url,
            "demo_video_url": demo_video_url
        },

        "bio": bio
    }

    db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "teacher_verification": verification_data,
                "teacher_requested": True
            }
        }
    )

    return {
        "success": True,
        "message": "Teacher verification request submitted",
        "status": "pending"
    }