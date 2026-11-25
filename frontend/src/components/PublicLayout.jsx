import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, ShieldCheck, X } from "lucide-react";
import Brand from "./Brand";
import LangSelect from "./LangSelect";
import { useLang } from "../i18n";

export function PublicHeader() {
  const { tr } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      {/* Subtle Top Cooperative Trust Strip */}
      <div className="hidden border-b border-emerald-100 bg-emerald-50/70 py-1.5 text-center sm:block">
        <p className="text-xs font-medium text-emerald-800 flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>{tr("Verified Cooperative Artisans · 90% Direct Worker Payout · Insured & Background-Checked")}</span>
        </p>
      </div>

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <Brand />
        </Link>

        {/* Center Navigation */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          <Link to="/services" className="text-slate-900 font-semibold hover:text-emerald-600 transition-colors">
            {tr("Services")}
          </Link>
          <a href="/#how" className="hover:text-emerald-600 transition-colors">
            {tr("How It Works")}
          </a>
          <a href="/#about" className="hover:text-emerald-600 transition-colors">
            {tr("Fair Wage Model")}
          </a>
          <a href="/#impact" className="hover:text-emerald-600 transition-colors">
            {tr("Matching Engine")}
          </a>
          <a href="/#teams" className="hover:text-emerald-600 transition-colors">
            {tr("Partners")}
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-2.5">
          <LangSelect />
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
          >
            {tr("Sign In")}
          </Link>
          <Link
            to="/services"
            className="btn-primary-coop py-2 px-4 text-xs sm:text-sm"
          >
            <span>{tr("Book a Service")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 space-y-2 lg:hidden">
          <Link to="/services" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            {tr("Services")}
          </Link>
          <a href="/#how" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            {tr("How It Works")}
          </a>
          <a href="/#about" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            {tr("Fair Wage Model")}
          </a>
          <Link to="/login" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
            {tr("Sign In / Register")}
          </Link>
        </div>
      )}
    </header>
  );
}

export function LandingFooter() {
  const { tr } = useLang();
  return (
    <footer className="relative z-10 mt-auto border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Brand />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            {tr("A cooperative-owned home services marketplace built for dignified worker livelihoods, transparent matching, and direct household-to-artisan payments.")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{tr("NCCT Aligned")}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{tr("Ministry of Cooperation")}</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1">90% Fair Payout</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{tr("Explore Platform")}</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li><Link to="/services" className="hover:text-emerald-600 transition-colors">{tr("Browse All Services")}</Link></li>
            <li><a href="/#how" className="hover:text-emerald-600 transition-colors">{tr("How It Works")}</a></li>
            <li><a href="/#impact" className="hover:text-emerald-600 transition-colors">{tr("Fair Matching Formula")}</a></li>
            <li><a href="/#about" className="hover:text-emerald-600 transition-colors">{tr("Worker Welfare Fund")}</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{tr("Account Portals")}</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li><Link to="/login" className="hover:text-emerald-600 transition-colors">{tr("Customer Sign In")}</Link></li>
            <li><Link to="/register" className="hover:text-emerald-600 transition-colors">{tr("Join as a Worker")}</Link></li>
            <li><Link to="/worker" className="hover:text-emerald-600 transition-colors">{tr("Worker Dashboard")}</Link></li>
            <li><Link to="/admin" className="hover:text-emerald-600 transition-colors">{tr("Cooperative Admin")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 py-4 px-4 text-center text-xs text-slate-500">
        {tr("© 2026 SevaCoop Platform Cooperative · Sahakar Se Samriddhi · Fair & Transparent Local Services")}
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden text-slate-900">
      <div className="relative z-10 flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <LandingFooter />
      </div>
    </div>
  );
}
