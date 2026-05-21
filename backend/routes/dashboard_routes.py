from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.schemas import DashboardOverview
from backend.services.dashboard_service import get_dashboard_overview


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverview)
def dashboard_overview(db: Session = Depends(get_db)) -> DashboardOverview:
    return get_dashboard_overview(db)
