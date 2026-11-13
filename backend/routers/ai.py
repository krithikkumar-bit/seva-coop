"""AI demand-forecasting router — admin-only, rate-limited, bounded query params."""
import datetime as dt
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from database import get_db
from ratelimit import limiter
import security
from forecasting import forecast as build_forecast

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/forecast")
@limiter.limit("30/minute")
def demand_forecast(
    request: Request,
    days: int = Query(default=7, ge=1, le=30, description="Forecast horizon (1-30 days)"),
    user: dict = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    return {
        "method": "28-day history + day-of-week adjusted moving average (XGBoost upgrade path)",
        "generated_at": dt.datetime.utcnow().isoformat(),
        "forecast": build_forecast(db, days),
    }
