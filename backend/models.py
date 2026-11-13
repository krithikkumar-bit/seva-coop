import datetime as dt
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="customer")  # customer | worker | admin
    language = Column(String, default="en")
    created_at = Column(DateTime, default=dt.datetime.utcnow)


class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    name_hi = Column(String, default="")
    icon = Column(String, default="🛠️")
    description = Column(Text, default="")
    base_price = Column(Float, default=299)


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    user = relationship("User")
    skills = Column(String, default="")  # comma-separated service names
    experience_years = Column(Float, default=0)
    hourly_rate = Column(Float, default=300)
    bio = Column(Text, default="")
    address = Column(String, default="")
    lat = Column(Float, default=0.0)
    lng = Column(Float, default=0.0)
    availability = Column(String, default="available")  # available | busy | offline
    verification_status = Column(String, default="pending")  # pending | verified | rejected
    id_proof_no = Column(String, default="")
    rating_sum = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    jobs_done = Column(Integer, default=0)

    @property
    def skills_list(self):
        return [s.strip() for s in (self.skills or "").split(",") if s.strip()]

    @property
    def avg_rating(self):
        return round(self.rating_sum / self.rating_count, 2) if self.rating_count else 0.0


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    worker_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    service = relationship("Service")
    scheduled_at = Column(DateTime)
    address = Column(String)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    notes = Column(Text, default="")
    is_emergency = Column(Boolean, default=False)
    status = Column(String, default="PENDING")
    # PENDING -> ACCEPTED -> IN_PROGRESS -> COMPLETED / CANCELLED
    estimated_cost = Column(Float, default=0)
    final_cost = Column(Float, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    invoice_no = Column(String, unique=True)
    amount = Column(Float)
    method = Column(String, default="upi")  # upi | card | cash
    status = Column(String, default="PAID")
    paid_at = Column(DateTime, default=dt.datetime.utcnow)


class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    worker_id = Column(Integer, ForeignKey("users.id"))
    stars = Column(Integer)
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=dt.datetime.utcnow)


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    jti = Column(String, primary_key=True)
    expires_at = Column(DateTime, nullable=False)