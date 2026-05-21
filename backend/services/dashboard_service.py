from backend.database import queries
from backend.schemas import DashboardOverview


def get_dashboard_overview() -> DashboardOverview:
    counts = queries.dashboard_counts()
    return DashboardOverview(
        **counts,
        recent_meetings=queries.list_meetings(limit=5),
        upcoming_schedule=queries.list_upcoming_meetings(limit=5),
    )
