from fastapi import APIRouter

from backend.schemas import DashboardOverview
from backend.services.dashboard_service import get_dashboard_overview


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverview)
def dashboard_overview() -> DashboardOverview:
    return get_dashboard_overview()
