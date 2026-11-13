import os
import uuid
import datetime as dt
import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
import models

_PLACEHOLDER_MARKERS = ("change-this", "replace_me", "replace-me", "your-secret", "dev-secret")


def validate_secret_key(raw: str) -> str:
    cleaned = (raw or "").strip()
    if len(cleaned) < 32 or any(m in cleaned.lower() for m in _PLACEHOLDER_MARKERS):
        raise RuntimeError(
            "FATAL: SECRET_KEY is missing, weak (<32 chars), or still set to a placeholder. "
            "Generate a real key: python -c \"import secrets; print(secrets.token_urlsafe(48))\""
        )
    return cleaned


SECRET_KEY = validate_secret_key(os.getenv("SECRET_KEY", ""))
ALGORITHM = "HS256"
TOKEN_ISSUER = "sevacoop-api"
TOKEN_AUDIENCE = "sevacoop-client"
# Token valid for 8 hours
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Pre-computed dummy bcrypt hash so unknown-user logins take constant time
DUMMY_PASSWORD_HASH = bcrypt.hashpw(b"dummy-timing-guard-key", bcrypt.gensalt(rounds=12)).decode("utf-8")


def hash_password(p: str) -> str:
    raw = p.encode("utf-8")
    if len(raw) > 72:
        raise ValueError("Password must not exceed 72 bytes")
    return bcrypt.hashpw(raw, bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(p: str, h: str) -> bool:
    if not p or not h:
        return False
    raw = p.encode("utf-8")
    if len(raw) > 72:
        return False
    try:
        return bcrypt.checkpw(raw, h.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_token(user_id: int, role: str) -> str:
    now = dt.datetime.now(dt.timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "typ": "access",
        "iss": TOKEN_ISSUER,
        "aud": TOKEN_AUDIENCE,
        "jti": uuid.uuid4().hex,
        "iat": now,
        "exp": now + dt.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
        issuer=TOKEN_ISSUER,
        audience=TOKEN_AUDIENCE,
        options={"require": ["sub", "role", "exp", "iat", "jti", "typ"]},
    )


def revoke_token(token: str, db: Session) -> None:
    try:
        payload = decode_token(token)
    except InvalidTokenError:
        return
    jti = payload.get("jti")
    exp = payload.get("exp")
    if not jti or not exp:
        return
    expires_at = dt.datetime.fromtimestamp(exp, tz=dt.timezone.utc).replace(tzinfo=None)
    # Opportunistically purge expired revocations
    now_naive = dt.datetime.utcnow()
    db.query(models.RevokedToken).filter(models.RevokedToken.expires_at < now_naive).delete(synchronize_session=False)
    if not db.get(models.RevokedToken, jti):
        db.add(models.RevokedToken(jti=jti, expires_at=expires_at))
        db.commit()


def get_current_user(token: str = Depends(oauth2), db: Session = Depends(get_db)) -> models.User:
    cred_exc = HTTPException(
        status_code=401,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload.get("typ") != "access":
            raise cred_exc
        uid = int(payload["sub"])
        jti = payload["jti"]
        token_role = payload["role"]
    except (InvalidTokenError, KeyError, ValueError, TypeError):
        raise cred_exc

    if db.get(models.RevokedToken, jti):
        raise cred_exc

    user = db.get(models.User, uid)
    if not user or user.role != token_role:
        raise cred_exc
    return user


def require_roles(*roles):
    def dep(user: models.User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return dep
