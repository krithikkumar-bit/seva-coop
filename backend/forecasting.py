"""AI demand forecasting + workforce allocation (PS: AI-based demand forecasting)."""
import datetime as dt
import math
from collections import defaultdict
from sqlalchemy.orm import Session
import models


def forecast(db: Session, days: int = 7):
    today = dt.date.today()
    start = today - dt.timedelta(days=28)
    bookings = db.query(models.Booking).filter(
        models.Booking.created_at >= dt.datetime.combine(start, dt.time.min)).all()

    per_day = defaultdict(int)
    active_days = defaultdict(set)
    for b in bookings:
        d = b.created_at.date()
        per_day[(b.service_id, d)] += 1
        active_days[b.service_id].add(d)

    verified = db.query(models.WorkerProfile).filter_by(verification_status="verified").all()
    workers_by_skill = defaultdict(int)
    for w in verified:
        for s in w.skills_list:
            workers_by_skill[s.lower()] += 1

    out = []
    for svc in db.query(models.Service).all():
        n_days = len(active_days.get(svc.id, ())) or 1
        base = sum(c for (sid, _), c in per_day.items() if sid == svc.id) / n_days

        wd_totals, wd_counts = defaultdict(float), defaultdict(int)
        for (sid, d), c in per_day.items():
            if sid == svc.id:
                wd_totals[d.weekday()] += c
                wd_counts[d.weekday()] += 1
        factor = {wd: (wd_totals[wd] / wd_counts[wd]) / base if base > 0 else 1.0
                  for wd in range(7) if wd_counts[wd]}

        daily = []
        for i in range(1, days + 1):
            d = today + dt.timedelta(days=i)
            pred = base * factor.get(d.weekday(), 1.0)
            daily.append({"date": d.isoformat(), "weekday": d.strftime("%a"),
                          "predicted_bookings": round(pred, 1)})

        weekly_total = sum(x["predicted_bookings"] for x in daily)
        available = workers_by_skill.get(svc.name.lower(), 0)
        needed = math.ceil(weekly_total / 10.0) if weekly_total > 0 else 0  # ~10 jobs/worker/week
        out.append({"service_id": svc.id, "service": svc.name, "icon": svc.icon, "daily": daily,
                    "weekly_total": round(weekly_total, 1), "available_workers": available,
                    "suggested_workers": needed, "gap": needed - available})
    out.sort(key=lambda x: -x["weekly_total"])
    return out