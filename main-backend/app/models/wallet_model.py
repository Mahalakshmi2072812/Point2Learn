from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URL"))
db = client.point2learn
wallets_collection = db.wallets


def create_wallet(user_id):
    wallet = {
        "user_id": user_id,
        "points": 500,
        "last_refill": datetime.utcnow()
    }
    wallets_collection.insert_one(wallet)


def get_wallet(user_id):
    return wallets_collection.find_one({"user_id": user_id})
