"""Workers router — phone numbers hidden from public endpoints, unverified profiles protected."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from sqlalchemy.orm import Session

from database import get_db
from ratelimit import limiter
import models, schemas, security
from matching import rank_workers

router = APIRouter(prefix="/workers", tags=["workers"])


def serialize(
    p: models.WorkerProfile,
    score=None,
    dist=None,
    include_phone: bool = False,
    include_id_proof: bool = False,
):
    """Serialize a worker profile. Phone and ID proof are only included for authorized admin/self views."""
    result = {
        "profile_id": p.id,
        "user_id": p.user_id,
        "name": p.user.full_name,
        "skills": p.skills_list,
        "experience_years": p.experience_years,
        "hourly_rate": p.hourly_rate,
        "bio": p.bio,
        "address": p.address,
        "availability": p.availability,
        "verification_status": p.verification_status,
        "avg_rating": p.avg_rating,
        "jobs_done": p.jobs_done,
        "score": score,
        "distance_km": dist,
    }
    if include_phone:
        result["phone"] = p.user.phone
    if include_id_proof:
        result["id_proof_no"] = p.id_proof_no
    return result


@router.get("")
@limiter.limit("60/minute")
def list_workers(
    request: Request,
    service: Optional[str] = Query(default=None, max_length=100),
    lat: Optional[float] = Query(default=None, ge=-90, le=90),
    lng: Optional[float] = Query(default=None, ge=-180, le=180),
    db: Session = Depends(get_db),
):
    if service:
        ranked = rank_workers(db, service, lat, lng, limit=50)
        return [serialize(p, s, d) for p, s, d in ranked]
    profs = (
        db.query(models.WorkerProfile)
        .filter_by(verification_status="verified")
        .limit(100)
        .all()
    )
    return [serialize(p) for p in profs]


@router.get("/me")
def my_profile(
    user: models.User = Depends(security.require_roles("worker")),
    db: Session = Depends(get_db),
):
    p = db.query(models.WorkerProfile).filter_by(user_id=user.id).first()
    if not p:
        raise HTTPException(404, "Worker profile not found")
    return serialize(p, include_phone=True)


@router.put("/me")
@limiter.limit("20/minute")
def update_me(
    request: Request,
    payload: schemas.WorkerUpdate,
    user: models.User = Depends(security.require_roles("worker")),
    db: Session = Depends(get_db),
):
    p = db.query(models.WorkerProfile).filter_by(user_id=user.id).first()
    if not p:
        raise HTTPException(404, "Worker profile not found")
    data = payload.model_dump(exclude_unset=True)
    if isinstance(data.get("skills"), list):
        allowed = {s.name for s in db.query(models.Service).all()} | schemas.VALID_SKILLS
        for sk in data["skills"]:
            if sk not in allowed:
                raise HTTPException(422, f"Invalid skill '{sk}'")
        data["skills"] = ",".join(data["skills"])
    for k, v in data.items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return serialize(p, include_phone=True)


@router.get("/{user_id}")
@limiter.limit("60/minute")
def public_worker(
    request: Request,
    user_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    """Public verified worker profile — phone number and unverified profiles excluded."""
    p = (
        db.query(models.WorkerProfile)
        .filter_by(user_id=user_id, verification_status="verified")
        .first()
    )
    if not p:
        raise HTTPException(404, "Worker not found")
    return serialize(p)
