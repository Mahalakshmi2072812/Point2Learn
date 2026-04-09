from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from app.core.database import connect_db

# Import routes
from app.routes import (
    auth_routes,
    user_routes,
    wallet_routes,
    course_routes,
    session_routes,
    rating_routes,
    notification_routes,
    home_routes,
    admin_routes,
)

# --------------------------------------------------
# Load Environment Variables
# --------------------------------------------------
load_dotenv()


# --------------------------------------------------
# Lifespan Event (Modern Startup Handling)
# --------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_db()
    print("Database Connected")
    yield
    print("🛑 Application Shutdown")


app = FastAPI(
    title="Point2Learn Backend",
    version="2.0.0",
    lifespan=lifespan
)


# --------------------------------------------------
# CORS Configuration (Production Ready)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API Routers
# --------------------------------------------------

API_PREFIX = "/api"

app.include_router(auth_routes.router, prefix=f"{API_PREFIX}/auth", tags=["Auth"])
app.include_router(user_routes.router, prefix=f"{API_PREFIX}/user", tags=["User"])
app.include_router(wallet_routes.router, prefix=f"{API_PREFIX}/wallet", tags=["Wallet"])
app.include_router(course_routes.router, prefix=f"{API_PREFIX}/course", tags=["Course"])
app.include_router(session_routes.router, prefix=f"{API_PREFIX}/session", tags=["Session"])
app.include_router(rating_routes.router, prefix=f"{API_PREFIX}/rating", tags=["Rating"])
app.include_router(notification_routes.router, prefix=f"{API_PREFIX}/notification", tags=["Notification"])
app.include_router(home_routes.router, prefix=f"{API_PREFIX}/home", tags=["Home"])
app.include_router(admin_routes.router, prefix=f"{API_PREFIX}/admin", tags=["Admin"])


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Point2Learn Backend Running 🚀",
        "version": "2.0.0"
    }


# --------------------------------------------------
# Health Check Endpoint
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }