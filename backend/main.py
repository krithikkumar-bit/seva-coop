"""
SevaCoop Backend — Production-hardened FastAPI application.

Security layers applied:
  1. Restricted CORS (explicit origin allowlist from ALLOWED_ORIGINS env var)
  2. Global + per-route rate limiting via slowapi
  3. HTTP Security Headers middleware (strict CSP, HSTS, X-Frame-Options, COOP/CORP, no-store)
  4. TrustedHost protection (via ALLOWED_HOSTS env var) & 1 MB request body limit
  5. OpenAPI docs disabled in production (set ENABLE_DOCS=1 for local dev only)
  6. SECRET_KEY startup validation — refuses to start with weak/placeholder keys
  7. Global exception shield — never leaks stack traces or DB internals
"""
from contextlib import asynccontextmanager
import os
from urllib.parse import urlparse

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from database import Base, engine
from ratelimit import limiter
import models  # noqa: F401  (registers models)
import security
from routers import auth, services, workers, bookings, payments, ratings, admin, ai
from seed import run_seed

MAX_REQUEST_BYTES = 1_048_576  # 1 MB

# Validate SECRET_KEY strength at startup
security.validate_secret_key(os.getenv("SECRET_KEY", ""))


def _parse_origins(raw: str) -> list[str]:
    origins = []
    for item in raw.split(","):
        candidate = item.strip().rstrip("/")
        if not candidate or candidate in ("*", "null"):
            continue
        parsed = urlparse(candidate)
        if parsed.scheme in ("http", "https") and parsed.netloc:
            origins.append(f"{parsed.scheme}://{parsed.netloc}")
    return origins


_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173")
ALLOWED_ORIGINS = _parse_origins(_raw_origins)

_raw_hosts = os.getenv("ALLOWED_HOSTS", "")
ALLOWED_HOSTS = [h.strip() for h in _raw_hosts.split(",") if h.strip() and h.strip() != "*"]

_enable_docs = os.getenv("ENABLE_DOCS", "0") == "1"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_seed()
    yield


app = FastAPI(
    title="SevaCoop — Cooperative Gig Services",
    description="SIH26089 | Ministry of Cooperation | NCCT",
    version="1.0.0",
    debug=False,
    docs_url="/docs" if _enable_docs else None,
    redoc_url="/redoc" if _enable_docs else None,
    openapi_url="/openapi.json" if _enable_docs else None,
    lifespan=lifespan,
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded ({exc.detail}). Please slow down and try again shortly."},
        headers={"Retry-After": "60"},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never expose internal tracebacks, SQL errors, or file paths in responses
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > MAX_REQUEST_BYTES:
                    return JSONResponse(status_code=413, content={"detail": "Request payload too large"})
            except ValueError:
                return JSONResponse(status_code=400, content={"detail": "Invalid Content-Length header"})
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(self), camera=(), microphone=(), payment=()"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        if request.url.scheme == "https" or request.headers.get("x-forwarded-proto", "").lower() == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        if request.url.path.startswith(("/api/auth", "/api/admin", "/api/payments", "/api/bookings")):
            response.headers["Cache-Control"] = "no-store"
        if "server" in response.headers:
            del response.headers["server"]
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'wasm-unsafe-eval' https://checkout.razorpay.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: blob: https://*.razorpay.com; "
            "connect-src 'self' https://prod.spline.design https://*.vercel.app https://api.razorpay.com https://lumberjack.razorpay.com; "
            "frame-src 'self' https://api.razorpay.com; "
            "frame-ancestors 'none'; "
            "form-action 'self'; "
            "object-src 'none'; "
            "base-uri 'self';"
        )
        return response


# Middleware order (last added runs outermost on request & response):
# SecurityHeadersMiddleware -> MaxBodySizeMiddleware -> SlowAPIMiddleware -> CORSMiddleware -> TrustedHostMiddleware
if ALLOWED_HOSTS:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    max_age=600,
)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(MaxBodySizeMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

API = "/api"
for r in (auth, services, workers, bookings, payments, ratings, admin, ai):
    app.include_router(r.router, prefix=API)


@app.get("/api/health")
def health():
    return {"status": "ok"}
