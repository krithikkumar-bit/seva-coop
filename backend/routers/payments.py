import hashlib
import hmac
import os
import time

from fastapi import APIRouter, Depends, HTTPException, Path, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from ratelimit import limiter
import models, schemas, security

try:
    import razorpay
except ImportError:
    razorpay = None

router = APIRouter(prefix="/payments", tags=["payments"])
COOP_FEE_PCT = 0.10  # 90% to worker (fair wage), 10% cooperative federation fund

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "").strip()
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
ALLOW_MOCK_PAYMENTS = os.getenv("ALLOW_MOCK_PAYMENTS", "1").strip() == "1"


def is_razorpay_configured() -> bool:
    return bool(
        RAZORPAY_KEY_ID
        and RAZORPAY_KEY_SECRET
        and not RAZORPAY_KEY_ID.startswith("rzp_test_placeholder")
        and razorpay is not None
    )


def _sign_mock_order(order_id: str, booking_id: int, amount_paise: int) -> str:
    msg = f"{order_id}|{booking_id}|{amount_paise}"
    return hmac.new(security.SECRET_KEY.encode("utf-8"), msg.encode("utf-8"), hashlib.sha256).hexdigest()


def get_razorpay_client():
    if not is_razorpay_configured():
        return None
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


@router.get("/config")
@limiter.limit("60/minute")
def get_payment_config(request: Request):
    configured = is_razorpay_configured()
    return {
        "key_id": RAZORPAY_KEY_ID if configured else "rzp_test_mock_mode",
        "currency": "INR",
        "is_configured": configured,
    }


@router.post("/create-order")
@limiter.limit("20/minute")
def create_order(
    request: Request,
    payload: schemas.RazorpayOrderCreate,
    user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(models.Booking).filter(models.Booking.id == payload.booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.customer_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not allowed")
    if b.status != "COMPLETED":
        raise HTTPException(400, "Booking must be completed before payment")
    if db.query(models.Payment).filter_by(booking_id=b.id).first():
        raise HTTPException(400, "Booking has already been paid")

    amount = b.final_cost if b.final_cost is not None else b.estimated_cost
    amount_paise = int(round(amount * 100))

    mock_sig = None
    if is_razorpay_configured():
        try:
            client = get_razorpay_client()
            order_data = {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"rcpt_{b.code}",
                "notes": {
                    "booking_id": str(b.id),
                    "booking_code": b.code,
                    "service": b.service.name if b.service else "Service",
                },
            }
            order = client.order.create(data=order_data)
            order_id = order["id"]
        except Exception:
            raise HTTPException(502, "Payment gateway unavailable. Please try again.")
    else:
        if not ALLOW_MOCK_PAYMENTS:
            raise HTTPException(503, "Online payment gateway is not configured")
        order_id = f"order_mock_{b.id}_{int(time.time())}"
        mock_sig = _sign_mock_order(order_id, b.id, amount_paise)

    res = {
        "order_id": order_id,
        "amount": amount,
        "amount_paise": amount_paise,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID if is_razorpay_configured() else "rzp_test_mock_mode",
        "booking_code": b.code,
        "service_name": b.service.name if b.service else "Service",
        "customer_name": user.full_name,
        "customer_email": user.email,
        "customer_phone": user.phone or "",
        "is_mock": not is_razorpay_configured(),
    }
    if mock_sig:
        res["mock_signature"] = mock_sig
    return res


@router.post("/verify")
@limiter.limit("20/minute")
def verify_payment(
    request: Request,
    payload: schemas.RazorpayVerify,
    user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(models.Booking).filter(models.Booking.id == payload.booking_id).with_for_update().first()
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.customer_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not allowed")
    if b.status != "COMPLETED":
        raise HTTPException(400, "Booking not completed yet")
    if db.query(models.Payment).filter_by(booking_id=b.id).first():
        raise HTTPException(400, "Already paid")

    amount = b.final_cost if b.final_cost is not None else b.estimated_cost
    amount_paise = int(round(amount * 100))

    # Verify cryptographic signature (live Razorpay secret OR server-signed mock HMAC)
    if is_razorpay_configured():
        msg = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
        expected_sig = hmac.new(
            RAZORPAY_KEY_SECRET.encode("utf-8"),
            msg.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected_sig, payload.razorpay_signature):
            raise HTTPException(400, "Payment verification failed: invalid signature")
    else:
        if not ALLOW_MOCK_PAYMENTS:
            raise HTTPException(503, "Online payment verification requires Razorpay configuration")
        expected_prefix = f"order_mock_{b.id}_"
        if not payload.razorpay_order_id.startswith(expected_prefix):
            raise HTTPException(400, "Invalid mock order reference")
        expected_mock_sig = _sign_mock_order(payload.razorpay_order_id, b.id, amount_paise)
        if not hmac.compare_digest(expected_mock_sig, payload.razorpay_signature):
            raise HTTPException(400, "Mock payment verification failed: invalid signature")
    p = models.Payment(
        booking_id=b.id,
        invoice_no=f"INV-{b.code}",
        amount=amount,
        method=payload.method or "razorpay",
        transaction_id=payload.razorpay_payment_id,
        status="PAID",
    )
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
        "transaction_id": p.transaction_id,
        "worker_payout": round(amount * (1 - COOP_FEE_PCT), 2),
        "coop_fee": round(amount * COOP_FEE_PCT, 2),
    }


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
    if b.customer_id != user.id and user.role != "admin":
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
        "transaction_id": p.transaction_id,
        "amount": p.amount,
        "worker_payout": round(p.amount * 0.9, 2),
        "coop_fee": round(p.amount * 0.1, 2),
        "booking": {
            "code": b.code,
            "service": b.service.name if b.service else "Service",
            "scheduled_at": b.scheduled_at.isoformat(),
            "customer": (cust.full_name if (cust := db.get(models.User, b.customer_id)) else "Customer"),
            "worker": (wrk.full_name if b.worker_id and (wrk := db.get(models.User, b.worker_id)) else None),
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
