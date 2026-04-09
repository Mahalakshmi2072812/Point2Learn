from pymongo import MongoClient
import os

client = None
_db = None


def connect_db():
    global client, _db

    url = os.getenv("MONGO_URI")
    print("MONGO_URI:", url)
    
    if not url:
        raise Exception("❌ MONGO_URL not found in .env")

    client = MongoClient(url)

    _db = client["point2learn"]

    print("MongoDB Connected Successfully")


def get_db():
    return _db
