import uuid
import datetime as dt
from fastapi import APIRouter, Depends, HTTPException, Path, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from ratelimit import limiter
import models, schemas, security
from matching import rank_workers, best_worker
from routers.workers import serialize as worker_serialize

router = APIRouter(prefix="/bookings", tags=["bookings"])


def booking_dict(db, b: models.Booking):
    cust = db.get(models.User, b.customer_id)
    wrk = db.get(models.User, b.worker_id) if b.worker_id else None
    pay = db.query(models.Payment).filter_by(booking_id=b.id).first()
    rating = db.query(models.Rating).filter_by(booking_id=b.id).first()
    # Only expose phone numbers once the worker has accepted or is actively fulfilling the job
    show_worker_phone = wrk and b.status in ("ACCEPTED", "IN_PROGRESS", "COMPLETED")
    show_customer_phone = cust and b.status in ("ACCEPTED", "IN_PROGRESS")
    return {
        "id": b.id,
        "code": b.code,
        "service_id": b.service_id,
        "service_name": b.service.name,
        "icon": b.service.icon,
        "customer_id": b.customer_id,
        "customer_name": cust.full_name if cust else None,
        "customer_phone": cust.phone if show_customer_phone else None,
        "worker_id": b.worker_id,
        "worker_name": wrk.full_name if wrk else None,
        "worker_phone": wrk.phone if show_worker_phone else None,
        "scheduled_at": b.scheduled_at.isoformat(),
        "address": b.address,
        "lat": b.lat,
        "lng": b.lng,
        "notes": b.notes,
        "is_emergency": b.is_emergency,
        "status": b.status,
        "estimated_cost": b.estimated_cost,
        "final_cost": b.final_cost,
        "paid": bool(pay),
        "rated": bool(rating),
        "created_at": b.created_at.isoformat(),
    }


def get_booking(db, booking_id: int) -> models.Booking:
    b = db.get(models.Booking, booking_id)
    if not b:
        raise HTTPException(404, "Booking not found")
    return b


@router.post("")
@limiter.limit("30/minute")
def create_booking(
    request: Request,
    payload: schemas.BookingCreate,
    user: models.User = Depends(security.require_roles("customer", "admin")),
    db: Session = Depends(get_db),
):
    svc = db.get(models.Service, payload.service_id)
    if not svc:
        raise HTTPException(404, "Service not found")

    when = payload.scheduled_at or (dt.datetime.utcnow() + dt.timedelta(hours=2))
    est = round(svc.base_price * (1.25 if payload.is_emergency else 1.0), 2)
    b = models.Booking(
        code=uuid.uuid4().hex[:8].upper(),
        customer_id=user.id,
        service_id=svc.id,
        scheduled_at=when,
        address=payload.address,
        lat=payload.lat,
        lng=payload.lng,
        notes=payload.notes,
        is_emergency=payload.is_emergency,
        estimated_cost=est,
    )
    if payload.worker_id:
        prof = db.query(models.WorkerProfile).filter_by(user_id=payload.worker_id).first()
        if not prof or prof.verification_status != "verified":
            raise HTTPException(400, "Selected worker is not available")
        if svc.name.lower() not in [s.lower() for s in prof.skills_list]:
            raise HTTPException(400, "Selected worker does not offer this service")
        b.worker_id = payload.worker_id
    else:
        best = best_worker(db, svc.name, payload.lat, payload.lng)
        if best:
            b.worker_id = best.user_id

    db.add(b)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Could not create booking, please try again.")
    db.refresh(b)
    return booking_dict(db, b)


@router.get("/mine")
@limiter.limit("60/minute")
def my_bookings(
    request: Request,
    user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(models.Booking)
    if user.role == "customer":
        q = q.filter(models.Booking.customer_id == user.id)
    elif user.role == "worker":
        q = q.filter(models.Booking.worker_id == user.id)
    return [booking_dict(db, b) for b in q.order_by(models.Booking.created_at.desc()).limit(200).all()]


@router.get("/{booking_id}")
def get_one(
    booking_id: int = Path(..., ge=1),
    user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    b = get_booking(db, booking_id)
    if user.role != "admin" and user.id not in (b.customer_id, b.worker_id):
        raise HTTPException(403, "Not allowed")
    return booking_dict(db, b)


@router.get("/{booking_id}/matches")
def matches(
    booking_id: int = Path(..., ge=1),
    user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    b = get_booking(db, booking_id)
    if user.id != b.customer_id and user.role != "admin":
        raise HTTPException(403, "Not allowed")
    ranked = rank_workers(db, b.service.name, b.lat, b.lng, limit=10)
    return [{"score": s, "distance_km": d, **worker_serialize(p, include_phone=False)} for p, s, d in ranked]


@router.post("/{booking_id}/assign")
def assign(
    body: schemas.AssignBody,
    booking_id: int = Path(..., ge=1),
    user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    b = get_booking(db, booking_id)
    if user.id != b.customer_id and user.role != "admin":
        raise HTTPException(403, "Not allowed")
    if b.status != "PENDING":
        raise HTTPException(400, f"Cannot assign in status {b.status}")
    prof = db.query(models.WorkerProfile).filter_by(user_id=body.worker_id).first()
    if not prof or prof.verification_status != "verified":
        raise HTTPException(400, "Worker not available")
    if b.service and b.service.name.lower() not in [s.lower() for s in prof.skills_list]:
        raise HTTPException(400, "Worker does not offer this service")
    b.worker_id = body.worker_id
    db.commit()
    return booking_dict(db, b)


def _worker_action(db, user, booking_id, allowed_from, to_status=None):
    prof = db.query(models.WorkerProfile).filter_by(user_id=user.id).first()
    if not prof or prof.verification_status != "verified":
        raise HTTPException(403, "Verified worker status required")
    b = get_booking(db, booking_id)
    if b.worker_id != user.id:
        raise HTTPException(403, "Not your job")
    if b.status not in allowed_from:
        raise HTTPException(400, f"Invalid transition from {b.status}")
    if to_status:
        b.status = to_status
    return b


@router.post("/{booking_id}/accept")
def accept(
    booking_id: int = Path(..., ge=1),
    user: models.User = Depends(security.require_roles("worker")),
    db: Session = Depends(get_db),
):
    b = _worker_action(db, user, booking_id, ["PENDING"], "ACCEPTED")
    db.commit()
    return booking_dict(db, b)


@router.post("/{booking_id}/reject")
def reject(
    booking_id: int = Path(..., ge=1),
    user: models.User = Depends(security.require_roles("worker")),
    db: Session = Depends(get_db),
):
    b = _worker_action(db, user, booking_id, ["PENDING"])
    b.worker_id = None
    b.status = "PENDING"
    db.commit()
    return booking_dict(db, b)


@router.post("/{booking_id}/start")
def start(
    booking_id: int = Path(..., ge=1),
    user: models.User = Depends(security.require_roles("worker")),
    db: Session = Depends(get_db),
):
    b = _worker_action(db, user, booking_id, ["ACCEPTED"], "IN_PROGRESS")
    db.commit()
    return booking_dict(db, b)


@router.post("/{booking_id}/complete")
def complete(
    booking_id: int = Path(..., ge=1),
    body: schemas.CompleteBody = None,
    user: models.User = Depends(security.require_roles("worker")),
    db: Session = Depends(get_db),
):
    b = _worker_action(db, user, booking_id, ["IN_PROGRESS"], "COMPLETED")
    if body and body.final_cost is not None:
        max_allowed = max(round(b.estimated_cost * 5, 2), 10000.0)
        if body.final_cost > max_allowed:
            raise HTTPException(400, f"Final cost cannot exceed ₹{int(max_allowed)}")
        b.final_cost = round(body.final_cost, 2)
    else:
        b.final_cost = b.estimated_cost
    prof = db.query(models.WorkerProfile).filter_by(user_id=user.id).first()
    if prof:
        prof.jobs_done += 1
    db.commit()
    return booking_dict(db, b)


@router.post("/{booking_id}/cancel")
def cancel(
    booking_id: int = Path(..., ge=1),
    user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    b = get_booking(db, booking_id)
    if user.id != b.customer_id and user.role != "admin":
        raise HTTPException(403, "Not allowed")
    if b.status not in ("PENDING", "ACCEPTED"):
        raise HTTPException(400, f"Cannot cancel in status {b.status}")
    b.status = "CANCELLED"
    db.commit()
    return booking_dict(db, b)
