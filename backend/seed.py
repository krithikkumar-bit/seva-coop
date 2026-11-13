"""Startup bootstrap - NO demo users, NO fake bookings.

Creates only:
  1. the service catalogue (if empty)
  2. the federation admin account, from ADMIN_EMAIL / ADMIN_PASSWORD in .env (if set and not present)
Customers and workers create their own accounts through the Register page.
"""
import os
from database import SessionLocal
import models
from security import hash_password, verify_password

SERVICES = [
    ("Electrician", "बिजली मिस्त्री", "⚡", "Wiring, repairs, appliance installation", 350),
    ("Plumber", "नल मिस्त्री", "🚰", "Leaks, taps, bathroom fitting", 350),
    ("Carpenter", "बढ़ई", "🪚", "Furniture repair, doors, custom work", 400),
    ("Painter", "पेंटर", "🎨", "Wall painting, polish, texture", 500),
    ("Cleaning", "सफाई", "🧹", "Home deep cleaning, bathroom, kitchen", 450),
    ("Driver", "ड्राइवर", "🚗", "Hourly / outstation driving", 300),
    ("Gardener", "माली", "🌿", "Garden care, plants, trimming", 300),
    ("Caregiver", "देखभाल", "🤝", "Elderly & patient care", 550),
    ("Domestic Helper", "घरेलू सहायक", "🏠", "Cooking & household help", 280),
    ("AC Technician", "एसी तकनीशियन", "❄️", "AC service, gas refill, repair", 600),
]


def run_seed():
    db = SessionLocal()
    try:
        if not db.query(models.Service).first():
            for name, name_hi, icon, desc, price in SERVICES:
                db.add(models.Service(name=name, name_hi=name_hi, icon=icon, description=desc, base_price=price))
            db.commit()
            print("Service catalogue created.")

        email = os.getenv("ADMIN_EMAIL", "").strip().lower()
        password = os.getenv("ADMIN_PASSWORD", "")
        if email and password:
            is_weak = (
                len(password) < 12
                or password.lower() in {"123456#*", "change_this_to_a_strong_password", "admin123", "password"}
                or not any(c.isalpha() for c in password)
                or not any(c.isdigit() for c in password)
            )
            if is_weak:
                print(
                    "WARNING: ADMIN_PASSWORD is too weak (require >= 12 chars with letters & digits) - admin not created."
                )
            else:
                existing_admin = db.query(models.User).filter(models.User.email == email).first()
                if not existing_admin:
                    db.add(models.User(
                        full_name=os.getenv("ADMIN_NAME", "Federation Admin"),
                        phone=os.getenv("ADMIN_PHONE", "0000000000"),
                        email=email, password_hash=hash_password(password), role="admin"))
                    db.commit()
                    print(f"Admin account created: {email}")
                elif existing_admin.role == "admin" and not verify_password(password, existing_admin.password_hash):
                    existing_admin.password_hash = hash_password(password)
                    db.commit()
                    print(f"Admin account password synced from environment: {email}")
        elif not db.query(models.User).filter_by(role="admin").first():
            print("WARNING: no admin exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env and restart.")

        # Seed initial verified cooperative artisans if none exist
        if not db.query(models.WorkerProfile).first():
            from seed_workers import seed_workers
            seed_workers()
            print("Initial cooperative artisans seeded.")
    finally:
        db.close()
