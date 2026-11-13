from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from ratelimit import limiter
import models, schemas, security

router = APIRouter(prefix="/services", tags=["services"])


@router.get("")
@limiter.limit("120/minute")
def list_services(request: Request, db: Session = Depends(get_db)):
    """Return all services with live worker_count for each category."""
    services = db.query(models.Service).order_by(models.Service.name).all()
    all_workers = (
        db.query(models.WorkerProfile)
        .filter_by(verification_status="verified")
        .all()
    )
    skill_counts = {}
    for w in all_workers:
        for sk in (w.skills or "").split(","):
            key = sk.strip().lower()
            if key:
                skill_counts[key] = skill_counts.get(key, 0) + 1

    return [
        {
            "id": svc.id,
            "name": svc.name,
            "name_hi": svc.name_hi,
            "icon": svc.icon,
            "description": svc.description,
            "base_price": svc.base_price,
            "worker_count": skill_counts.get(svc.name.lower(), 0),
        }
        for svc in services
    ]


@router.post("", response_model=schemas.ServiceOut)
@limiter.limit("20/minute")
def create_service(
    request: Request,
    payload: schemas.ServiceCreate,
    user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    svc = models.Service(**payload.model_dump())
    db.add(svc)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "A service with this name already exists.")
    db.refresh(svc)
    return svc
