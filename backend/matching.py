"""Geo-location based service matching (PS: Geo-Spatial Technology + AI)."""
import math
import models

WEIGHTS = {"skill": 0.30, "proximity": 0.25, "rating": 0.20, "availability": 0.15, "fairness": 0.10}


def haversine_km(lat1, lng1, lat2, lng2):
    if None in (lat1, lng1, lat2, lng2):
        return None
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def score_worker(worker: models.WorkerProfile, lat=None, lng=None, skill_known=True):
    skill = 1.0 if skill_known else 0.0
    dist = haversine_km(lat, lng, worker.lat, worker.lng)
    proximity = 0.5 if dist is None else max(0.0, 1.0 - dist / 25.0)
    rating = (worker.avg_rating / 5.0) if worker.rating_count else 0.6
    availability = {"available": 1.0, "busy": 0.4}.get(worker.availability, 0.0)
    fairness = min(worker.experience_years / 10.0, 1.0)
    score = (WEIGHTS["skill"] * skill + WEIGHTS["proximity"] * proximity + WEIGHTS["rating"] * rating
             + WEIGHTS["availability"] * availability + WEIGHTS["fairness"] * fairness)
    return round(score, 4), (round(dist, 2) if dist is not None else None)


def rank_workers(db, service_name: str, lat=None, lng=None, limit=10):
    profs = db.query(models.WorkerProfile).filter_by(verification_status="verified").all()
    ranked = []
    for p in profs:
        if service_name.lower() not in [s.lower() for s in p.skills_list]:
            continue
        score, dist = score_worker(p, lat, lng, skill_known=True)
        ranked.append((p, score, dist))
    ranked.sort(key=lambda t: -t[1])
    return ranked[:limit]


def best_worker(db, service_name: str, lat=None, lng=None):
    r = rank_workers(db, service_name, lat, lng, limit=1)
    return r[0][0] if r else None