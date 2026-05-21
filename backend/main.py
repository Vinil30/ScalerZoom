import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from backend.database.database import init_db
from backend.schemas import APIHealth
from backend.routes import ai_routes, dashboard_routes, meeting_routes, participant_routes, schedule_routes


app = FastAPI(
    title="AI Zoom Clone Backend",
    description="Production-oriented backend foundation for an AI-powered meeting collaboration platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health", response_model=APIHealth, tags=["System"])
def health_check() -> APIHealth:
    return APIHealth(status="ok", service="AI Zoom Clone Backend", database="sqlite")


@app.get("/join/{meeting_code}", include_in_schema=False)
def redirect_invite_link(meeting_code: str) -> RedirectResponse:
    frontend_base_url = os.getenv("PUBLIC_BASE_URL", "http://localhost:3000").rstrip("/")
    if frontend_base_url.endswith(":8000"):
        frontend_base_url = "http://localhost:3000"
    return RedirectResponse(url=f"{frontend_base_url}/join/{meeting_code}")


app.include_router(meeting_routes.router, prefix="/api/v1")
app.include_router(participant_routes.router, prefix="/api/v1")
app.include_router(schedule_routes.router, prefix="/api/v1")
app.include_router(dashboard_routes.router, prefix="/api/v1")
app.include_router(ai_routes.router, prefix="/api/v1")
