from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.core.database import connect_db

load_dotenv()

app = FastAPI(title="Point2Learn Backend", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event
@app.on_event("startup")
async def startup_event():
    connect_db()
    print("Database Connected ✅")

# Root
@app.get("/")
def root():
    return {"status": "success", "message": "Backend Running 🚀"}

# Health
@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected"}
