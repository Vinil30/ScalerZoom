from datetime import datetime, timezone

from fastapi import HTTPException, status


def ensure_future_datetime(value: datetime, field_name: str) -> None:
    comparable = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if comparable <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} must be in the future.",
        )


def ensure_positive(value: int, field_name: str) -> None:
    if value <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} must be greater than zero.",
        )
