from bson import ObjectId
from datetime import datetime


def serialize_mongo(data):
    """Recursively convert ObjectId and datetime to JSON-serializable types."""
    if isinstance(data, list):
        return [serialize_mongo(item) for item in data]

    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, (dict, list)):
                result[key] = serialize_mongo(value)
            else:
                result[key] = value
        return result

    if isinstance(data, ObjectId):
        return str(data)

    if isinstance(data, datetime):
        return data.isoformat()

    return data
