from fastapi import APIRouter, Depends, HTTPException, Path, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from ratelimit import limiter
import models, schemas, security

router = APIRouter(prefix="/ratings", tags=["ratings"])


@router.post("")
@limiter.limit("20/minute")
def create(
    request: Request,
    payload: schemas.RatingCreate,
    user: models.User = Depends(security.require_roles("customer")),
    db: Session = Depends(get_db),
):
    b = db.get(models.Booking, payload.booking_id)
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.customer_id != user.id:
        raise HTTPException(403, "Not allowed")
    if b.status != "COMPLETED":
        raise HTTPException(400, "Can rate only completed bookings")
    if not b.worker_id:
        raise HTTPException(400, "No worker assigned")
    if db.query(models.Rating).filter_by(booking_id=b.id).first():
        raise HTTPException(400, "Already rated")
    if not 1 <= payload.stars <= 5:
        raise HTTPException(400, "Stars must be 1-5")
    r = models.Rating(
        booking_id=b.id,
        customer_id=user.id,
        worker_id=b.worker_id,
        stars=payload.stars,
        comment=payload.comment,
    )
    prof = db.query(models.WorkerProfile).filter_by(user_id=b.worker_id).first()
    if prof:
        prof.rating_sum += payload.stars
        prof.rating_count += 1
    db.add(r)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "Already rated")
    return {"id": r.id, "stars": r.stars, "comment": r.comment}


@router.get("/worker/{worker_id}")
@limiter.limit("60/minute")
def worker_ratings(
    request: Request,
    worker_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    prof = (
        db.query(models.WorkerProfile)
        .filter_by(user_id=worker_id, verification_status="verified")
        .first()
    )
    if not prof:
        raise HTTPException(404, "Worker not found")
    rows = (
        db.query(models.Rating)
        .filter_by(worker_id=worker_id)
        .order_by(models.Rating.created_at.desc())
        .limit(20)
        .all()
    )
    return [{"stars": r.stars, "comment": r.comment, "created_at": r.created_at.isoformat()} for r in rows]
