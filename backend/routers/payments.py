from fastapi import APIRouter, Depends, HTTPException, Path, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from ratelimit import limiter
import models, schemas, security

router = APIRouter(prefix="/payments", tags=["payments"])
COOP_FEE_PCT = 0.10  # 90% to worker (fair wage), 10% cooperative federation fund


@router.post("/pay")
@limiter.limit("20/minute")
def pay(
    request: Request,
    payload: schemas.PayCreate,
    user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(models.Booking).filter(models.Booking.id == payload.booking_id).with_for_update().first()
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.customer_id != user.id:
        raise HTTPException(403, "Not allowed")
    if b.status != "COMPLETED":
        raise HTTPException(400, "Booking not completed yet")
    if db.query(models.Payment).filter_by(booking_id=b.id).first():
        raise HTTPException(400, "Already paid")

    amount = b.final_cost if b.final_cost is not None else b.estimated_cost
    p = models.Payment(booking_id=b.id, invoice_no=f"INV-{b.code}", amount=amount, method=payload.method)
    db.add(p)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "Already paid")
    db.refresh(p)
    return {
        "status": "PAID",
        "invoice_no": p.invoice_no,
        "amount": amount,
        "method": p.method,
        "worker_payout": round(amount * (1 - COOP_FEE_PCT), 2),
        "coop_fee": round(amount * COOP_FEE_PCT, 2),
    }


@router.get("/invoice/{booking_id}")
@limiter.limit("60/minute")
def invoice(
    request: Request,
    booking_id: int = Path(..., ge=1),
    user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    b = db.get(models.Booking, booking_id)
    if not b:
        raise HTTPException(404, "Not found")
    if user.id not in (b.customer_id, b.worker_id) and user.role != "admin":
        raise HTTPException(403, "Not allowed")
    p = db.query(models.Payment).filter_by(booking_id=b.id).first()
    if not p:
        raise HTTPException(404, "Invoice not generated yet")
    return {
        "invoice_no": p.invoice_no,
        "paid_at": p.paid_at.isoformat(),
        "method": p.method,
        "amount": p.amount,
        "worker_payout": round(p.amount * 0.9, 2),
        "coop_fee": round(p.amount * 0.1, 2),
        "booking": {
            "code": b.code,
            "service": b.service.name,
            "scheduled_at": b.scheduled_at.isoformat(),
            "customer": db.get(models.User, b.customer_id).full_name,
            "worker": db.get(models.User, b.worker_id).full_name if b.worker_id else None,
        },
    }


@router.get("/worker/earnings")
@limiter.limit("60/minute")
def earnings(
    request: Request,
    user: models.User = Depends(security.require_roles("worker")),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.Payment, models.Booking)
        .join(models.Booking, models.Payment.booking_id == models.Booking.id)
        .filter(models.Booking.worker_id == user.id)
        .limit(500)
        .all()
    )
    total = sum(p.amount for p, _ in rows)
    return {
        "total_earned": round(total * (1 - COOP_FEE_PCT), 2),
        "gross": round(total, 2),
        "coop_fee": round(total * COOP_FEE_PCT, 2),
        "paid_jobs": len(rows),
        "items": [
            {
                "invoice_no": p.invoice_no,
                "amount": p.amount,
                "payout": round(p.amount * 0.9, 2),
                "service": b.service.name,
                "date": p.paid_at.isoformat()[:10],
            }
            for p, b in rows
        ],
    }
