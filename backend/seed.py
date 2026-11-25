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
    ("Salon for Women", "सैलून (महिला)", "💇‍♀️", "Haircut, facials, waxing, manicure & pedicure at home", 599),
    ("Salon for Men & Kids", "सैलून (पुरुष एवं बच्चे)", "💈", "Haircut, beard grooming, head massage & kid styling", 299),
    ("Spa for Women", "स्पा (महिला)", "🧖‍♀️", "Swedish, deep tissue & ayurvedic stress-relief massage", 999),
    ("Spa for Men", "स्पा (पुरुष)", "💆‍♂️", "Pain relief, sports & deep-tissue full body massage", 999),
    ("Pest Control", "पेस्ट कंट्रोल", "🛡️", "Cockroach, ant, bed bug, termite & mosquito control", 799),
    ("Washing Machine Repair", "वॉशिंग मशीन रिपेयर", "🧺", "Top-load, front-load & semi-automatic repair", 349),
    ("Refrigerator Repair", "फ्रिज रिपेयर", "🧊", "Single, double-door & side-by-side fridge repair", 349),
    ("Water Purifier (RO) Service", "आरओ वॉटर प्यूरीफायर", "💧", "RO filter replacement, membrane service & installation", 399),
    ("Microwave & Chimney Repair", "माइक्रोवेव और चिमनी", "🔥", "Kitchen chimney deep cleaning & microwave oven repair", 399),
    ("TV & Laptop Repair", "टीवी और लैपटॉप रिपेयर", "📺", "LED/Smart TV mounting, diagnostics & laptop service", 399),
    ("Sofa & Carpet Cleaning", "सोफा और कालीन सफाई", "🛋️", "Foam shampooing, dry vacuuming & stain removal", 499),
    ("Bathroom & Kitchen Cleaning", "बाथरूम और किचन सफाई", "🚿", "Tile descaling, degreasing & hospital-grade sanitizing", 449),
]


def run_seed():
    db = SessionLocal()
    try:
        existing_names = {s.name.lower() for s in db.query(models.Service).all()}
        added = 0
        for name, name_hi, icon, desc, price in SERVICES:
            if name.lower() not in existing_names:
                db.add(models.Service(name=name, name_hi=name_hi, icon=icon, description=desc, base_price=price))
                existing_names.add(name.lower())
                added += 1
        if added:
            db.commit()
            print(f"Service catalogue synced ({added} services added).")

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
