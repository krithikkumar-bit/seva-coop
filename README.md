# SevaCoop (Co-op Gig Protocol) 🤝⚡

> **A decentralized, cooperative gig platform engineered for dignified livelihood, transparent dispatch algorithms, direct artisan remittances, and interactive 3D interfaces.**

---

## 🌟 Overview

**SevaCoop** redesigns the gig economy by eliminating corporate intermediary exploitation. Operating on a **90/10 cooperative model**, 90% of every customer payment directly reaches the service artisan, while 10% fuels a mutual welfare reserve governed democratically by the federation.

### Key Highlights
- **Interactive 3D Experience**: Embedded Spline 3D robot terminal providing real-time visual feedback and futuristic glassmorphic UI.
- **Full Multilingual Support**: 6-language dynamic localization engine covering **English**, **Hindi (हिंदी)**, **Marathi (मराठी)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, and **Bengali (বাংলা)** across all client portals.
- **Triple-Node Federation Architecture**:
  - 👤 **Customer Portal**: On-demand dispatch, transparent booking breakdown, and real-time artisan tracking.
  - 🛠️ **Artisan Portal**: Fair job dispatch, autonomous schedule toggling, direct remittance logs, and earnings analytics.
  - 🛡️ **Federation Admin Terminal**: Cooperative governance, worker auditing, platform metrics, and dispute resolution.
- **Production-Hardened Security**:
  - Secure bcrypt password verification with cryptographic salt rounds.
  - Granular in-memory IP & endpoint rate limiting (auth, booking, admin).
  - Strict HTML/XSS sanitization on all user input fields.
  - Hardened security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) and CORS origin isolation.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS, PostCSS, Lucide React
- **3D Graphics**: `@splinetool/react-spline` + Spline WebGL runtime
- **State & Routing**: React Router DOM, Custom Contexts (Auth, Language, Scene Preferences)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (via Supabase) with SQLAlchemy ORM
- **Authentication**: OAuth2 / JWT (python-jose, bcrypt)
- **Validation**: Pydantic v2
- **Testing**: Pytest & custom automated security validation suites

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- PostgreSQL database (or Supabase instance)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and supply your real DATABASE_URL, SECRET_KEY, and ALLOWED_ORIGINS

# Run database migrations and seed baseline data
python seed.py

# Launch development server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Launch Vite development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔒 Security Architecture

| Security Layer | Implementation |
|---|---|
| **Password Hashing** | Bcrypt with secure salt generation |
| **Authentication** | Bearer JWT with algorithm enforcement (`HS256`) and short-lived expiry |
| **XSS & Injection Protection** | Input sanitization middleware on strings and payload payloads |
| **Rate Limiting** | Strict per-IP token bucket limits on `/auth/login`, `/auth/register`, and admin endpoints |
| **CORS** | Strict domain allowlist with credential protection |
| **Environment Hygiene** | Secrets strictly isolated from git tracking; `.env` excluded |

---

## 📂 Project Structure

```text
seva-coop/
├── backend/
│   ├── routers/            # Auth, Bookings, Workers, Admin, AI endpoints
│   ├── database.py         # SQLAlchemy engine & session manager
│   ├── models.py           # Database schema definitions
│   ├── ratelimit.py        # Token-bucket rate limiter
│   ├── sanitize.py         # XSS sanitization helpers
│   ├── security.py         # JWT & Bcrypt password security
│   ├── seed.py             # Database seeder & admin provisioner
│   └── main.py             # FastAPI app initialization & middleware
├── frontend/
│   ├── public/             # 3D Spline scene assets & icons
│   ├── src/
│   │   ├── components/     # UI widgets, layouts, 3D world wrapper
│   │   ├── pages/          # Home, Services, Bookings, Portals, Admin
│   │   ├── i18n.jsx        # 6-Language translation dictionary
│   │   ├── AuthContext.jsx # Global user session management
│   │   └── App.jsx         # Application routing & root layout
│   └── index.html
└── README.md
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
