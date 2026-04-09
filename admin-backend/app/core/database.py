from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URL = os.getenv("MONGO_URI")

DB_NAME = os.getenv("DB_NAME")

# Global client variable
client = None


def get_database():
    global client

    if client is None:
        try:
            client = MongoClient(
                MONGO_URL,
                serverSelectionTimeoutMS=5000  # 5 seconds timeout
            )

            # Force connection test
            client.server_info()

            print("✅ MongoDB Atlas Connected Successfully")

        except Exception as e:
            print("❌ MongoDB Connection Failed:", e)
            raise e

    return client[DB_NAME]
