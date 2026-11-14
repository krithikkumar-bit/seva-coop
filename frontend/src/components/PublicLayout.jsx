import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Globe, ShieldCheck, Target, Terminal } from "lucide-react";
import Brand from "./Brand";
import LangSelect from "./LangSelect";
import SceneToggle from "./SceneToggle";
import { Button } from "./ui";
import { useLang } from "../i18n";
import { BRAND } from "../lib/cn";

export function PublicHeader() {
  const { tr } = useLang();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-stoneblack/90 backdrop-blur-md pointer-events-auto">
      {/* Top Technical Kicker Banner */}
      <div className="hidden border-b border-white/5 py-1 text-center sm:block">
        <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase">
          {tr("COOPERATIVE GIG PROTOCOL · VERIFIED ARTISANS · 90% DIRECT REMITTANCE · SIH26089")}
        </p>
      </div>

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <Brand techno={true} />
        </Link>

        {/* Center Technical Navigation */}
        <nav className="hidden items-center gap-8 font-mono text-xs font-medium tracking-wider text-slate-300 uppercase lg:flex">
          <Link to="/services" className="text-white hover:text-emerald-400 transition-colors">
            {tr("SERVICES")}
          </Link>
          <a href="/#catalogue" className="inline-flex items-center gap-1 hover:text-white transition-colors">
            {tr("CATEGORIES")} <ChevronDown className="h-3 w-3" />
          </a>
          <a href="/#impact" className="hover:text-white transition-colors">
            {tr("ALGORITHM")}
          </a>
          <a href="/#about" className="hover:text-white transition-colors">
            {tr("COOPERATIVE")}
          </a>
          <a href="/#teams" className="hover:text-white transition-colors">
            {tr("PARTNERS")}
          </a>
        </nav>

        {/* Right Action / Portal Badges */}
        <div className="flex shrink-0 items-center gap-2.5">
          <SceneToggle />
          <LangSelect />
          <Link
            to="/login"
            className="hidden font-mono text-xs font-semibold tracking-wider text-slate-300 hover:text-white sm:inline-block px-3 py-1.5"
          >
            {tr("PORTAL [ LOGIN ]")}
          </Link>
          <Link
            to="/services"
            className="btn-tech-outline"
          >
            {tr("BOOK NOW")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function LandingFooter() {
  const { tr } = useLang();
  return (
    <footer className="relative z-10 mt-auto border-t border-white/10 bg-stoneblack text-slate-400 pointer-events-auto">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Brand techno={true} />
          <p className="mt-4 max-w-md font-mono text-xs leading-relaxed text-slate-400">
            {tr("A cooperative platform architecture engineered for dignified gig labor, transparent algorithmic allocation, and direct household-to-artisan remittance.")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
            <span className="border border-white/15 px-2.5 py-1">{tr("NCCT APPROVED")}</span>
            <span className="border border-white/15 px-2.5 py-1">{tr("MINISTRY OF COOPERATION")}</span>
            <span className="border border-white/15 px-2.5 py-1">SIH26089</span>
          </div>
        </div>

        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">{tr("System Architecture")}</p>
          <ul className="mt-3 space-y-2 font-mono text-xs">
            <li><Link to="/services" className="hover:text-white transition-colors">{tr("Co-op Catalogue")}</Link></li>
            <li><a href="#how" className="hover:text-white transition-colors">{tr("Matching Engine")}</a></li>
            <li><a href="#impact" className="hover:text-white transition-colors">{tr("Fairness Equation")}</a></li>
            <li><a href="#benefits" className="hover:text-white transition-colors">{tr("Worker Welfare Fund")}</a></li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">{tr("Access Nodes")}</p>
          <ul className="mt-3 space-y-2 font-mono text-xs">
            <li><Link to="/login" className="hover:text-white transition-colors">{tr("Customer Portal")}</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">{tr("Join as Cooperative Artisan")}</Link></li>
            <li><Link to="/worker" className="hover:text-white transition-colors">{tr("Worker Terminal")}</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">{tr("Federation Admin Console")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-4 px-4 text-center font-mono text-[11px] text-slate-400">
        {tr("© 2024 SEVACOOP PLATFORM COOPERATIVE · SAHAKAR SE SAMRIDDHI · POWERED BY ADVANCED 3D DISPATCH")}
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div
      data-spline-passthrough=""
      className="relative flex min-h-screen flex-col overflow-x-hidden text-slate-100"
    >
      <div
        data-spline-passthrough=""
        className="relative z-10 flex min-h-screen flex-col pointer-events-none"
      >
        <PublicHeader />
        <main data-spline-passthrough="" className="flex-1 pointer-events-none">
          {children}
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
