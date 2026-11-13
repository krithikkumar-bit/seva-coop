"""One-time cleanup: removes the old demo/seed data from the database.

Deletes the demo users (admin@sevacoop.in, *@demo.in) and every booking, payment and
rating that involves them. Real users who registered themselves are NOT touched.

Run from the backend folder:   python cleanup_demo.py
"""
from database import SessionLocal
import models

db = SessionLocal()
demo = db.query(models.User).filter(
    (models.User.email.like("%@demo.in")) | (models.User.email == "admin@sevacoop.in")).all()
ids = [u.id for u in demo]
if not ids:
    print("No demo data found. Nothing to do.")
    raise SystemExit

bookings = db.query(models.Booking).filter(
    models.Booking.customer_id.in_(ids) | models.Booking.worker_id.in_(ids)).all()
bids = [b.id for b in bookings]
print(f"Found {len(ids)} demo users and {len(bids)} bookings linked to them.")
if input("Delete them permanently? type yes: ").strip().lower() != "yes":
    raise SystemExit("Cancelled.")

if bids:
    db.query(models.Rating).filter(models.Rating.booking_id.in_(bids)).delete(synchronize_session=False)
    db.query(models.Payment).filter(models.Payment.booking_id.in_(bids)).delete(synchronize_session=False)
    db.query(models.Booking).filter(models.Booking.id.in_(bids)).delete(synchronize_session=False)
db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id.in_(ids)).delete(synchronize_session=False)
db.query(models.User).filter(models.User.id.in_(ids)).delete(synchronize_session=False)
db.commit()
print("Done. Demo data removed.")
