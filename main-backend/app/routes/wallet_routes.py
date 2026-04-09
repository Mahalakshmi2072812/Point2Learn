from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timedelta

from app.core.database import get_db
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/wallet", tags=["Wallet"])

MAX_POINTS = 500
REFILL_HOURS = 5


# =====================================================
# CREATE WALLET (INTERNAL FUNCTION)
# =====================================================

def create_wallet_if_not_exists(db, user_id: ObjectId):
    wallet = db.wallets.find_one({"user_id": user_id})

    if not wallet:
        wallet_data = {
            "user_id": user_id,
            "points": MAX_POINTS,
            "last_refill": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        db.wallets.insert_one(wallet_data)
        return wallet_data

    return wallet


# =====================================================
# GET MY WALLET (AUTO REFILL SYSTEM)
# =====================================================

@router.get("/me")
def get_my_wallet(current_user=Depends(get_current_user)):

    db = get_db()

    try:
        user_id = ObjectId(current_user["user_id"])
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # -----------------------------
    # Check user
    # -----------------------------
    user = db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("payment_status") != "paid":
        raise HTTPException(status_code=403, detail="Payment not active")

    # -----------------------------
    # Get or create wallet
    # -----------------------------
    wallet = create_wallet_if_not_exists(db, user_id)

    now = datetime.utcnow()
    last_refill = wallet.get("last_refill")

    # -----------------------------
    # Auto refill logic
    # -----------------------------
    if last_refill and now - last_refill >= timedelta(hours=REFILL_HOURS):

        db.wallets.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "points": MAX_POINTS,
                    "last_refill": now
                }
            }
        )

        wallet["points"] = MAX_POINTS
        wallet["last_refill"] = now

    # -----------------------------
    # Response
    # -----------------------------
    return {
        "success": True,
        "points": wallet["points"],
        "last_refill": wallet["last_refill"],
        "next_refill_at": wallet["last_refill"] + timedelta(hours=REFILL_HOURS)
    }