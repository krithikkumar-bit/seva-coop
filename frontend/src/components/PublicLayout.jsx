import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, MapPin, Menu, Search, UserCircle2, X } from "lucide-react";
import Brand from "./Brand";
import LangSelect from "./LangSelect";
import { useLang } from "../i18n";
import { FALLBACK_SERVICES, fmtINR } from "../lib/cn";

const CITIES = ["Delhi NCR", "Bengaluru", "Mumbai", "Pune", "Hyderabad", "Chennai", "Kolkata"];

export function PublicHeader() {
  const { tr, tService } = useLang();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [city, setCity] = useState("Delhi NCR");
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const searchMatches = searchQ.trim()
    ? FALLBACK_SERVICES.filter((s) =>
        (s.name + s.description).toLowerCase().includes(searchQ.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Brand + UC-style Location Selector */}
        <div className="flex items-center gap-4 min-w-0">
          <Link to="/" className="shrink-0">
            <Brand compact />
          </Link>

          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-300 transition">
            <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="Select City"
              className="border-none bg-transparent p-0 text-xs font-semibold text-neutral-800 outline-none focus:ring-0 cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Urban Company Style Header Search Bar */}
        <div className="relative hidden sm:block flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQ}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
            onChange={(e) => {
              setSearchQ(e.target.value);
              setSearchOpen(true);
            }}
            placeholder={tr("Search for 'AC repair', 'Electrician', 'Plumber'...")}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:outline-none"
          />

          {/* Quick Search Dropdown */}
          {searchOpen && searchQ.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-neutral-200 bg-white p-2 shadow-glass z-50">
              {searchMatches.length === 0 ? (
                <p className="px-3 py-2 text-xs text-neutral-500">No services found for "{searchQ}"</p>
              ) : (
                searchMatches.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={() => nav(`/book/${s.id}`)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-neutral-100 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-neutral-900 truncate">{tService(s.name)}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{s.description}</p>
                    </div>
                    <span className="shrink-0 font-bold text-neutral-900">{fmtINR(s.base_price)}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Clean Navigation + Account */}
        <div className="flex shrink-0 items-center gap-3">
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600 mr-2">
            <Link to="/services" className="text-neutral-900 hover:text-black transition">
              {tr("Services")}
            </Link>
            <a href="/#about" className="hover:text-neutral-900 transition">
              {tr("Fair Pay")}
            </a>
            <Link to="/register" className="hover:text-neutral-900 transition">
              {tr("Join as Partner")}
            </Link>
          </nav>

          <LangSelect />

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition"
          >
            <UserCircle2 className="h-4 w-4 text-neutral-700" />
            <span>{tr("Login")}</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-neutral-100 bg-white px-4 py-4 space-y-2 lg:hidden">
          <Link to="/services" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">
            {tr("Services")}
          </Link>
          <a href="/#about" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            {tr("90% Fair Pay Model")}
          </a>
          <Link to="/register" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            {tr("Register as a Partner")}
          </Link>
          <Link to="/login" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-neutral-900 bg-neutral-100">
            {tr("Login / Sign Up")}
          </Link>
        </div>
      )}
    </header>
  );
}

export function LandingFooter() {
  const { tr } = useLang();
  return (
    <footer className="relative z-10 mt-auto border-t border-neutral-200 bg-neutral-50 text-neutral-600">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Brand />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            {tr("Cooperative-owned doorstep home services platform. 90% of every payment goes directly to verified artisans, and 10% supports worker welfare & insurance.")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-neutral-700">
            <span className="rounded-md border border-neutral-200 bg-white px-2.5 py-1">NCCT Aligned</span>
            <span className="rounded-md border border-neutral-200 bg-white px-2.5 py-1">Ministry of Cooperation</span>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-1">90% Direct Worker Payout</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">{tr("Company")}</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li><Link to="/services" className="hover:text-neutral-900 transition-colors">{tr("All Services")}</Link></li>
            <li><a href="/#how" className="hover:text-neutral-900 transition-colors">{tr("How It Works")}</a></li>
            <li><a href="/#about" className="hover:text-neutral-900 transition-colors">{tr("Fair Wage Calculator")}</a></li>
            <li><a href="/#impact" className="hover:text-neutral-900 transition-colors">{tr("Matching Formula")}</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">{tr("For Customers & Partners")}</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li><Link to="/login" className="hover:text-neutral-900 transition-colors">{tr("Customer Login")}</Link></li>
            <li><Link to="/register" className="hover:text-neutral-900 transition-colors">{tr("Register as a Professional")}</Link></li>
            <li><Link to="/worker" className="hover:text-neutral-900 transition-colors">{tr("Partner Dashboard")}</Link></li>
            <li><Link to="/admin" className="hover:text-neutral-900 transition-colors">{tr("Cooperative Admin")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200 py-4 px-4 text-center text-xs text-neutral-500">
        {tr("© 2026 SevaCoop Cooperative Technologies · Sahakar Se Samriddhi · Fair Doorstep Services")}
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white text-neutral-900">
      <div className="relative z-10 flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <LandingFooter />
      </div>
    </div>
  );
}
