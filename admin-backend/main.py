from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import get_database

from app.routes.auth_routes                import router as auth_router
from app.routes.logout_routes              import router as logout_router
from app.routes.user_management_routes     import router as user_management_router
from app.routes.teacher_verification_routes import router as teacher_router
from app.routes.analytics_routes          import router as analytics_router
from app.routes.rating_monitor_routes     import router as rating_router
from app.routes.fake_user_routes          import router as fake_user_router
from app.routes.notification_routes       import router as notification_router
from app.routes.home_routes               import router as home_router


# ── App ───────────────────────────────────────────────────────
app = FastAPI(
    title="Point2Learn Admin API",
    version="2.0.0",
    description="Admin backend for managing users, teachers, analytics, ratings, fake users, and notifications.",
)


# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(logout_router)
app.include_router(user_management_router)
app.include_router(teacher_router)
app.include_router(analytics_router)
app.include_router(rating_router)
app.include_router(fake_user_router)
app.include_router(notification_router)
app.include_router(home_router)


# ── Startup ───────────────────────────────────────────────────
@app.on_event("startup")
def startup_db():
    db = get_database()

    # Create indexes for performance
    db.blacklisted_tokens.create_index("token", unique=True)
    db.users.create_index("email", unique=True)
    db.users.create_index("created_at")
    db.ratings.create_index("user_id")
    db.notifications.create_index("created_at")

    # One-time migration: add is_banned=False to all existing users missing the field
    result = db.users.update_many(
        {"is_banned": {"$exists": False}},
        {"$set": {"is_banned": False}}
    )
    if result.modified_count > 0:
        print(f"Migrated {result.modified_count} users: added is_banned=False")

    print("Admin backend started — MongoDB connected")


# ── Root ──────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Point2Learn Admin Backend v2.0 running"}
