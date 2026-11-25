"""
SevaCoop Pydantic Schemas
All fields have explicit max_length, strict extra='forbid', and automatic sanitization to prevent XSS / mass assignment.
"""
import re
import datetime as dt
from typing import Optional, List, Literal
from pydantic import BaseModel, ConfigDict, field_validator, Field

from sanitize import sanitize_text

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Whitelist of allowed service names (keeps skills validated across all Urban Company verticals)
VALID_SKILLS = {
    "AC Technician", "Bathroom & Kitchen Cleaning", "Caregiver", "Carpenter",
    "Cleaning", "Domestic Helper", "Driver", "Electrician", "Gardener",
    "Microwave & Chimney Repair", "Painter", "Pest Control", "Plumber",
    "Refrigerator Repair", "Salon for Men & Kids", "Salon for Women",
    "Sofa & Carpet Cleaning", "Spa for Men", "Spa for Women",
    "TV & Laptop Repair", "Washing Machine Repair", "Water Purifier (RO) Service",
}

ALLOWED_LANGUAGES = {"en", "hi", "mr", "ta", "te", "bn"}
ALLOWED_PAYMENT_METHODS: set[str] = {"upi", "card", "cash"}

_COMMON_WEAK_PASSWORDS = {
    "password", "password1", "password123", "12345678", "123456789",
    "1234567890", "qwerty123", "worker123", "admin123", "sevacoop",
    "sevacoop123", "welcome1", "letmein1", "changeme",
}


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    phone: str
    email: Optional[str] = None
    role: str
    language: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    name_hi: str
    icon: str
    description: str
    base_price: float


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=7, max_length=20)
    email: str = Field(..., max_length=254)
    password: str = Field(..., min_length=8, max_length=72)
    role: str = Field(default="customer")
    language: str = Field(default="en", max_length=10)

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = sanitize_text(v).lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Enter a valid email address")
        return v

    @field_validator("password")
    @classmethod
    def _password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must not exceed 72 bytes")
        if v.strip().lower() in _COMMON_WEAK_PASSWORDS:
            raise ValueError("Password is too common. Choose a stronger password")
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must include at least one letter and one number")
        return v

    @field_validator("full_name")
    @classmethod
    def _full_name(cls, v: str) -> str:
        cleaned = sanitize_text(v)
        if len(cleaned) < 2:
            raise ValueError("Full name must contain at least 2 valid characters")
        return cleaned

    @field_validator("role")
    @classmethod
    def _role(cls, v: str) -> str:
        if v not in ("customer", "worker"):
            raise ValueError("Invalid role — must be 'customer' or 'worker'")
        return v

    @field_validator("language")
    @classmethod
    def _language(cls, v: str) -> str:
        cleaned = sanitize_text(v).lower()
        if cleaned not in ALLOWED_LANGUAGES:
            return "en"
        return cleaned

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        cleaned = sanitize_text(v)
        if not re.match(r"^[\d\s\+\-\(\)]{7,20}$", cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned


class WorkerCreate(UserCreate):
    skills: List[str] = Field(default=[], max_length=10)
    experience_years: float = Field(default=0, ge=0, le=60)
    hourly_rate: float = Field(default=300, ge=50, le=10000)
    bio: str = Field(default="", max_length=1000)
    address: str = Field(default="", max_length=500)
    lat: float = Field(default=0.0, ge=-90, le=90)
    lng: float = Field(default=0.0, ge=-180, le=180)
    id_proof_no: str = Field(default="", max_length=50)

    @field_validator("bio", "address", "id_proof_no")
    @classmethod
    def _clean_text(cls, v: str) -> str:
        return sanitize_text(v)

    @field_validator("skills")
    @classmethod
    def _skills(cls, v: List[str]) -> List[str]:
        cleaned = []
        for s in v:
            item = sanitize_text(s)[:100]
            if not item:
                raise ValueError("Invalid empty skill")
            cleaned.append(item)
        return cleaned


class WorkerUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    skills: Optional[List[str]] = None
    experience_years: Optional[float] = Field(default=None, ge=0, le=60)
    hourly_rate: Optional[float] = Field(default=None, ge=50, le=10000)
    bio: Optional[str] = Field(default=None, max_length=1000)
    address: Optional[str] = Field(default=None, max_length=500)
    lat: Optional[float] = Field(default=None, ge=-90, le=90)
    lng: Optional[float] = Field(default=None, ge=-180, le=180)
    availability: Optional[Literal["available", "busy", "offline"]] = None

    @field_validator("bio", "address")
    @classmethod
    def _clean_opt_text(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_text(v) if v is not None else None

    @field_validator("skills")
    @classmethod
    def _skills(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        if len(v) > 20:
            raise ValueError("Too many skills specified")
        cleaned = []
        for s in v:
            item = sanitize_text(s)[:100]
            if not item:
                raise ValueError("Invalid empty skill")
            cleaned.append(item)
        return cleaned


class ServiceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(..., min_length=2, max_length=100)
    name_hi: str = Field(default="", max_length=100)
    icon: str = Field(default="🛠️", max_length=10)
    description: str = Field(default="", max_length=1000)
    base_price: float = Field(default=299, ge=0, le=100000)

    @field_validator("name", "name_hi", "icon", "description")
    @classmethod
    def _clean_svc_text(cls, v: str) -> str:
        return sanitize_text(v)

    @field_validator("name")
    @classmethod
    def _check_name(cls, v: str) -> str:
        if len(v) < 2:
            raise ValueError("Service name must contain at least 2 valid characters")
        return v


class BookingCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    service_id: int = Field(..., ge=1)
    worker_id: Optional[int] = Field(default=None, ge=1)
    scheduled_at: Optional[dt.datetime] = None
    address: str = Field(..., min_length=5, max_length=500)
    lat: Optional[float] = Field(default=None, ge=-90, le=90)
    lng: Optional[float] = Field(default=None, ge=-180, le=180)
    notes: str = Field(default="", max_length=1000)
    is_emergency: bool = False

    @field_validator("address")
    @classmethod
    def _clean_address(cls, v: str) -> str:
        cleaned = sanitize_text(v)
        if len(cleaned) < 5:
            raise ValueError("Please provide a valid service address (minimum 5 characters)")
        return cleaned

    @field_validator("notes")
    @classmethod
    def _clean_notes(cls, v: str) -> str:
        return sanitize_text(v)

    @field_validator("scheduled_at")
    @classmethod
    def _valid_schedule(cls, v: Optional[dt.datetime]) -> Optional[dt.datetime]:
        if v is None:
            return v
        now = dt.datetime.utcnow()
        cmp_v = v.replace(tzinfo=None) if v.tzinfo else v
        if cmp_v < now - dt.timedelta(days=1):
            raise ValueError("Scheduled time cannot be in the past")
        if cmp_v > now + dt.timedelta(days=365):
            raise ValueError("Scheduled time cannot be more than 1 year ahead")
        return v


class AssignBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    worker_id: int = Field(..., ge=1)


class CompleteBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    final_cost: Optional[float] = Field(default=None, ge=1, le=200000)


class PayCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    booking_id: int = Field(..., ge=1)
    method: Literal["upi", "card", "cash", "razorpay"] = "upi"


class RazorpayOrderCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    booking_id: int = Field(..., ge=1)


_SAFE_ID_RE = re.compile(r"^[A-Za-z0-9_\-]{5,100}$")


class RazorpayVerify(BaseModel):
    model_config = ConfigDict(extra="forbid")
    booking_id: int = Field(..., ge=1)
    razorpay_order_id: str = Field(..., min_length=5, max_length=100)
    razorpay_payment_id: str = Field(..., min_length=5, max_length=100)
    razorpay_signature: str = Field(..., min_length=10, max_length=200)
    method: Literal["razorpay", "razorpay_upi", "razorpay_card", "upi", "card"] = "razorpay"

    @field_validator("razorpay_order_id", "razorpay_payment_id")
    @classmethod
    def _safe_id(cls, v: str) -> str:
        if not _SAFE_ID_RE.match(v):
            raise ValueError("Invalid gateway reference identifier")
        return v

    @field_validator("razorpay_signature")
    @classmethod
    def _clean_sig(cls, v: str) -> str:
        cleaned = v.strip()
        if not re.match(r"^[A-Za-z0-9_\-=+/]{10,200}$", cleaned):
            raise ValueError("Invalid signature format")
        return cleaned


class RatingCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    booking_id: int = Field(..., ge=1)
    stars: int = Field(..., ge=1, le=5)
    comment: str = Field(default="", max_length=2000)

    @field_validator("comment")
    @classmethod
    def _clean_comment(cls, v: str) -> str:
        return sanitize_text(v)


class VerifyBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Literal["verified", "rejected", "pending"]
