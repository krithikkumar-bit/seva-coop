"""Admin router — all endpoints require admin role, rate-limited, includes phone for admin context."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from ratelimit import limiter
import models, schemas, security
from routers.workers import serialize as worker_serialize
from routers.bookings import booking_dict

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
@limiter.limit("60/minute")
def stats(
    request: Request,
    user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    revenue = float(db.query(func.coalesce(func.sum(models.Payment.amount), 0.0)).scalar() or 0.0)
    return {
        "customers": db.query(models.User).filter_by(role="customer").count(),
        "workers_total": db.query(models.WorkerProfile).count(),
        "workers_verified": db.query(models.WorkerProfile).filter_by(verification_status="verified").count(),
        "workers_pending": db.query(models.WorkerProfile).filter_by(verification_status="pending").count(),
        "bookings_total": db.query(models.Booking).count(),
        "bookings_active": db.query(models.Booking).filter(
            models.Booking.status.in_(["PENDING", "ACCEPTED", "IN_PROGRESS"])
        ).count(),
        "bookings_completed": db.query(models.Booking).filter_by(status="COMPLETED").count(),
        "revenue": round(revenue, 2),
        "coop_fee": round(revenue * 0.10, 2),
        "worker_payout": round(revenue * 0.90, 2),
    }


@router.get("/workers")
@limiter.limit("60/minute")
def all_workers(
    request: Request,
    status: Optional[str] = Query(default=None, max_length=20),
    user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    # Validate status to prevent arbitrary filter injection
    if status and status not in ("pending", "verified", "rejected"):
        raise HTTPException(400, "Invalid status filter — must be pending, verified, or rejected")
    q = db.query(models.WorkerProfile)
    if status:
        q = q.filter_by(verification_status=status)
    return [worker_serialize(p, include_phone=True, include_id_proof=True) for p in q.limit(500).all()]


@router.post("/workers/{profile_id}/verify")
@limiter.limit("60/minute")
def verify_worker(
    request: Request,
    body: schemas.VerifyBody,
    profile_id: int = Path(..., ge=1),
    user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    p = db.get(models.WorkerProfile, profile_id)
    if not p:
        raise HTTPException(404, "Profile not found")
    # body.status is already validated to Literal["verified","rejected","pending"] by schema
    p.verification_status = body.status
    db.commit()
    return worker_serialize(p, include_phone=True, include_id_proof=True)


@router.get("/bookings")
@limiter.limit("60/minute")
def all_bookings(
    request: Request,
    limit: int = Query(default=50, ge=1, le=200),
    user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.Booking)
        .order_by(models.Booking.created_at.desc())
        .limit(limit)
        .all()
    )
    return [booking_dict(db, b) for b in rows]
