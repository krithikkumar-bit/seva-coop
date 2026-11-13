import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  CreditCard,
  Crosshair,
  Droplets,
  Globe,
  Hammer,
  HardHat,
  HeartHandshake,
  IndianRupee,
  Info,
  Landmark,
  Maximize2,
  Pocket,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Snowflake,
  Sparkles,
  Star,
  Thermometer,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useLang } from "../i18n";
import { useSceneData } from "../scene/SceneStore";
import PublicLayout from "../components/PublicLayout";
import TrustedTeams from "../components/TrustedTeams";
import CategoryIcon from "../components/CategoryIcon";
import { BRAND, fmtINR } from "../lib/cn";

// Mathematical workforce allocation weights
const WEIGHTS = [
  ["Skill Match", "0.30", "Verified competence and society trade skills"],
  ["Proximity", "0.25", "Real-time GPS proximity to destination household"],
  ["Rating", "0.20", "Historical decentralized customer rating index"],
  ["Availability", "0.15", "Active shift status & on-duty availability"],
  ["Fairness", "0.10", "Equitable job rotation across society members"],
];

// Primary 5 Technical Spec Services (Cluster 1)
const PRIMARY_SERVICES = [
  {
    num: "01",
    id: 1,
    title: "ELECTRICAL & POWER SYSTEMS",
    desc: "CERTIFIED TECHNICIANS FOR CIRCUIT OVERHAUL, WIRING SAFETY, AND POWER BACKUP INSTALLATION.",
    icon: Zap,
    tag: "ELC-01",
    basePrice: 350,
    workerCount: 4,
  },
  {
    num: "02",
    id: 2,
    title: "PLUMBING & HYDRAULIC REPAIRS",
    desc: "HIGH-PRESSURE LEAK DETECTION, PIPELINE REPLACEMENTS, AND WATER PURIFIER MAINTENANCE.",
    icon: Droplets,
    tag: "PLB-02",
    basePrice: 350,
    workerCount: 4,
  },
  {
    num: "03",
    id: 3,
    title: "CARPENTRY & TIMBER STRUCTURES",
    desc: "STRUCTURAL JOINERY, CUSTOM FURNITURE ASSEMBLY, AND HARDWARE RETROFITTING.",
    icon: Hammer,
    tag: "CPT-03",
    basePrice: 400,
    workerCount: 4,
  },
  {
    num: "04",
    id: 5,
    title: "DEEP FACILITY SANITATION",
    desc: "HOSPITAL-GRADE CHEMICAL PURIFICATION, APPLIANCE DEEP CLEANING, AND GERM PROTECTION.",
    icon: Sparkles,
    tag: "CLN-04",
    basePrice: 450,
    workerCount: 4,
  },
  {
    num: "05",
    id: 10,
    title: "HVAC & THERMAL REGULATION",
    desc: "COMPLETE AIR CONDITIONING SERVICE, FILTER EXTRACTION, AND HIGH-EFFICIENCY REFRIGERANT TUNING.",
    icon: Snowflake,
    tag: "HVC-05",
    basePrice: 600,
    workerCount: 4,
  },
];

// Secondary 5 Technical Spec Services (Cluster 2)
const SECONDARY_SERVICES = [
  {
    num: "06",
    id: 4,
    title: "ARCHITECTURAL WALL COATINGS",
    desc: "PRECISION INTERIOR / EXTERIOR PAINTING, WATERPROOFING PUTTY, AND TEXTURED FINISHES.",
    icon: Wrench,
    tag: "PNT-06",
    basePrice: 500,
    workerCount: 3,
  },
  {
    num: "07",
    id: 6,
    title: "VERIFIED CHAUFFEUR DISPATCH",
    desc: "HOURLY CITY AND HIGHWAY TRANSIT DRIVERS WITH AUDITED LICENSES AND DEFENSIVE VEHICLE TRAINING.",
    icon: HardHat,
    tag: "DRV-07",
    basePrice: 300,
    workerCount: 3,
  },
  {
    num: "08",
    id: 8,
    title: "HEALTHCARE & GERIATRIC CARE",
    desc: "COMPASSIONATE ELDERLY ASSISTANCE, VITAL HEALTH MONITORING, AND CERTIFIED BEDSIDE SUPPORT.",
    icon: HeartHandshake,
    tag: "CRG-08",
    basePrice: 550,
    workerCount: 3,
  },
  {
    num: "09",
    id: 9,
    title: "DOMESTIC FACILITY ASSISTANCE",
    desc: "TRUSTED DAILY HOUSEHOLD COOKING, PANTRY SANITIZATION, AND ESSENTIAL APARTMENT CARE.",
    icon: Pocket,
    tag: "DOM-09",
    basePrice: 280,
    workerCount: 4,
  },
  {
    num: "10",
    id: 7,
    title: "LANDSCAPE & HORTICULTURE",
    desc: "TERRACE PLANTING, DRIP IRRIGATION BALANCING, LAWN RESTORATION, AND BIO-FERTILIZATION.",
    icon: Compass,
    tag: "GRD-10",
    basePrice: 300,
    workerCount: 3,
  },
];

function CountUp({ value, decimals = 0, suffix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1100);
      setV(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span>
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t, tr, tService, tServiceDesc } = useLang();
  const { user } = useAuth();
  const [services, setServices] = useState(null);
  const [workers, setWorkers] = useState(null);
  const [activeCluster, setActiveCluster] = useState("primary");
  const [activeHoverCard, setActiveHoverCard] = useState(null);

  // Quick Dispatch Console State in Hero
  const [selectedServiceId, setSelectedServiceId] = useState("1");
  const [pincode, setPincode] = useState("");

  // Live 90% Fair-Wage Simulator State
  const [calcAmount, setCalcAmount] = useState(1000);

  const { setSceneData } = useSceneData();

  useEffect(() => {
    api
      .get("/services")
      .then((r) => setServices(Array.isArray(r.data) ? r.data : []))
      .catch(() => setServices([]));
    api
      .get("/workers")
      .then((r) => setWorkers(Array.isArray(r.data) ? r.data : []))
      .catch(() => setWorkers([]));
  }, []);

  useEffect(() => {
    setSceneData({
      services: Array.isArray(services) ? services : [],
      workers: Array.isArray(workers) ? workers : [],
    });
  }, [services, workers, setSceneData]);

  if (user) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin" : user.role === "worker" ? "/worker" : "/dashboard"}
        replace
      />
    );
  }

  const activeSpecs = activeCluster === "primary" ? PRIMARY_SERVICES : SECONDARY_SERVICES;
  const loading = services === null || workers === null;
  const safeWorkers = Array.isArray(workers) ? workers : [];
  const safeServices = Array.isArray(services) ? services : [];
  const rated = safeWorkers.filter((w) => w && w.avg_rating > 0);
  const avgRating = rated.length ? rated.reduce((n, w) => n + w.avg_rating, 0) / rated.length : 4.9;

  // Fair-wage math
  const artisanShare = Math.round(calcAmount * 0.9);
  const welfareShare = Math.round(calcAmount * 0.1);
  const corporateCut = Math.round(calcAmount * 0.35); // typical 35% commission on commercial apps

  return (
    <PublicLayout>
      {/* =========================================================================
          SECTION 1: HERO VIEWPORT (FEATURING AMBIENT 3D NEXBOT ROBOT BACKGROUND)
          ========================================================================= */}
      <section
        data-spline-passthrough=""
        className="relative w-full overflow-hidden border-b border-white/10 min-h-[calc(100vh-4rem)] flex items-center pointer-events-none"
      >
        {/* Subtle Radial Vignette for CAD Viewport feel */}
        <div
          data-spline-passthrough=""
          className="pointer-events-none absolute inset-0 radial-vignette opacity-70"
        />

        <div
          data-spline-passthrough=""
          className="relative mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6 lg:pt-8 lg:pb-16 pointer-events-none"
        >
          {/* Top HUD Row: Corner Badges & Top Kicker Button */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center pb-8 border-b border-white/10 pointer-events-auto">
            {/* Top-Left Badge: EST. 2024 / Built on Community */}
            <div className="flex items-center gap-3 border border-white/15 bg-black/50 p-3 sm:w-fit backdrop-blur-md">
              <Globe className="h-6 w-6 text-emerald-400 shrink-0" />
              <div className="font-mono text-[10px] leading-tight text-slate-300 uppercase tracking-wider">
                <span className="text-white font-bold">{tr("EST. 2024")}</span> · {tr("BUILT ON COMMUNITY.")}<br />
                {tr("DRIVEN BY DEMOCRACY.")}<br />
                {tr("FOCUSED ON ARTISANS.")}
              </div>
            </div>

            {/* Top Center: Kicker Message & Sharp Monospace CTA */}
            <div className="text-center flex flex-col items-center justify-center gap-2.5">
              <p className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-emerald-300">
                {tr("FAIR-WAGE COOPERATIVE PROTOCOL · 90% DIRECT REMITTANCE")}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  to="/services"
                  className="btn-tech-outline group text-xs py-1.5 px-3"
                >
                  <span>{tr("BROWSE 10 SERVICES")}</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className="border border-white/20 bg-stoneblack px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-slate-300 hover:text-white hover:border-white transition"
                >
                  {tr("PORTAL [ LOGIN ]")}
                </Link>
              </div>
            </div>

            {/* Top-Right Badge: Reticle / On-Demand Delivery */}
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-3 border border-white/15 bg-black/50 p-3 w-full sm:w-fit backdrop-blur-md">
                <Crosshair className="h-6 w-6 text-slate-400 shrink-0" />
                <div className="font-mono text-[10px] leading-tight text-slate-300 uppercase tracking-wider text-left sm:text-right">
                  <span className="text-white font-bold">{tr("CITYWIDE CO-OP GRID")}</span><br />
                  {tr("32 VERIFIED ARTISANS")}<br />
                  {tr("FAST SECURE DISPATCH")}
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Hero Content Grid */}
          <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* -------------------------------------------------------------------
                LEFT COLUMN: BOLD OVERSIZED TYPOGRAPHY + QUICK DISPATCH CONSOLE
                ------------------------------------------------------------------- */}
            <div className="lg:col-span-7 z-10 flex flex-col justify-center pointer-events-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-emerald-400 uppercase">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{tr("[ CO-OP GIG PROTOCOL · SIH26089 ]")}</span>
                </div>
                {/* Bold Oversized Hero Display Typography */}
                <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tighter text-white leading-[0.88]">
                  {tr("SEVA")}<br />
                  <span className="text-slate-300">{tr("MATTERS.")}</span>
                </h1>
              </div>

              {/* Subtitle text */}
              <p className="mt-5 font-mono text-xs sm:text-sm leading-relaxed text-slate-400 uppercase tracking-wide max-w-xl">
                {tr("A COMMUNITY-OWNED SERVICE COOPERATIVE ENGINEERED FOR FAIR ARTISAN WAGES, TRANSPARENT ALGORITHMS, AND DIRECT HOUSEHOLD REMITTANCE BEYOND CORPORATE EXPLOITATION.")}
              </p>

              {/* NEW INTERACTIVE QUICK DISPATCH CONSOLE */}
              <div className="mt-6 border border-white/20 bg-black/70 p-4 backdrop-blur-2xl max-w-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3 font-mono text-[10px] text-emerald-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3" /> {tr("DIRECT DISPATCH CONSOLE")}
                  </span>
                  <span className="text-slate-400">{tr("INSTANT AI ALLOCATION")}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-7">
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full border border-white/15 bg-stoneblack px-3 py-2 font-mono text-xs text-white uppercase focus:border-emerald-400 focus:outline-none"
                    >
                      {(safeServices.length > 0 ? safeServices : PRIMARY_SERVICES).map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#0d0e12] text-white">
                          {s.name ? tService(s.name) : tr(s.title)} ({tr("FROM")} ₹{s.base_price || s.basePrice})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-5">
                    <button
                      type="button"
                      onClick={() => navigate(`/book/${selectedServiceId}`)}
                      className="btn-tech-outline w-full py-2 text-center justify-center font-bold text-xs"
                    >
                      <span>{tr("MATCH ARTISAN →")}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick trade switch pills */}
              <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[10px] text-slate-400">
                <span className="text-slate-400">{tr("ACTIVE TRADES:")}</span>
                <button
                  type="button"
                  onClick={() => setActiveCluster("primary")}
                  className={`border px-2.5 py-1 uppercase transition ${
                    activeCluster === "primary"
                      ? "border-emerald-400 bg-emerald-950/60 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "border-white/20 text-slate-400 hover:text-white"
                  }`}
                >
                  {tr("CORE TRADES 01-05")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCluster("secondary")}
                  className={`border px-2.5 py-1 uppercase transition ${
                    activeCluster === "secondary"
                      ? "border-emerald-400 bg-emerald-950/60 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "border-white/20 text-slate-400 hover:text-white"
                  }`}
                >
                  {tr("CARE & MOBILITY 06-10")}
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------------------
                RIGHT COLUMN: NUMBERED TECHNICAL SERVICE CARDS (01 TO 05)
                ------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col gap-3 z-10 pointer-events-auto">
              {activeSpecs.map((spec) => {
                const Icon = spec.icon;
                const isHovered = activeHoverCard === spec.num;
                return (
                  <Link
                    key={spec.num}
                    to={`/book/${spec.id}`}
                    onMouseEnter={() => setActiveHoverCard(spec.num)}
                    onMouseLeave={() => setActiveHoverCard(null)}
                    className={`spec-card group relative block border p-4 transition-all duration-200 ${
                      isHovered
                        ? "border-white bg-stoneblack-surface shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                        : "border-white/12 bg-black/50 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Left: Number + Line Icon Box */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
                          {spec.num}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center border border-white/15 bg-stoneblack/80 text-white group-hover:border-white transition-colors">
                          <Icon className="h-4 w-4 text-slate-300 group-hover:text-white" />
                        </div>
                      </div>

                      {/* Right: Technical Title + 2-line Description */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-display text-xs font-black tracking-wider text-white uppercase group-hover:text-emerald-300 transition-colors">
                            {tr(spec.title)}
                          </h4>
                          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest group-hover:text-white">
                            {tr("FROM")} ₹{spec.basePrice}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[10px] leading-tight text-slate-400 uppercase tracking-wide">
                          {tr(spec.desc)}
                        </p>
                        <div className="mt-2 flex items-center justify-between font-mono text-[9px]">
                          <span className="text-emerald-400 font-bold">
                            ● {spec.workerCount} {tr("VERIFIED ACTIVE")}
                          </span>
                          <span className="text-slate-400 group-hover:text-white transition">
                            {tr("BOOK NOW →")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: "TRUSTED BY FORWARD-THINKING TEAMS" (BRAND LOGOS SECTION)
          ========================================================================= */}
      <TrustedTeams />

      {/* =========================================================================
          SECTION 3: LIVE 90% FAIR-WAGE VS CORPORATE MIDDLEMEN SIMULATOR
          ========================================================================= */}
      <section className="relative z-10 border-b border-white/10 bg-black/80 py-16 sm:py-20 pointer-events-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <span className="font-mono text-[10px] tracking-[0.25em] text-emerald-400 uppercase border border-emerald-500/30 px-3 py-1 bg-emerald-950/30">
              {tr("ECONOMIC ARCHITECTURE SIMULATION")}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              {tr("Where Your Money Goes")}
            </h2>
            <p className="mt-2 font-mono text-xs text-slate-400 uppercase tracking-wide">
              {tr("Compare SevaCoop's transparent 90/10 cooperative model against predatory corporate gig apps.")}
            </p>
          </div>

          <div className="border border-white/15 bg-stoneblack/90 p-6 sm:p-8 backdrop-blur-2xl max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 font-mono">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block">
                  {tr("Simulate Service Amount (₹):")}
                </label>
                <span className="text-[10px] text-slate-500 uppercase">
                  {tr("Select common booking value")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCalcAmount(amt)}
                    className={`border px-3 py-1.5 text-xs font-bold uppercase transition ${
                      calcAmount === amt
                        ? "border-emerald-400 bg-emerald-950/60 text-emerald-300"
                        : "border-white/15 text-slate-400 hover:border-white/40"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="border border-emerald-500/40 bg-emerald-950/20 p-5 text-left">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  {tr("ARTISAN TAKE-HOME (90%)")}
                </span>
                <p className="font-display text-3xl font-black text-white mt-2">
                  ₹{artisanShare}
                </p>
                <p className="text-[10px] text-emerald-300 mt-2 uppercase leading-tight">
                  {tr("Direct digital payment straight into verified worker bank account. Zero delays.")}
                </p>
              </div>

              <div className="border border-cyan-500/40 bg-cyan-950/20 p-5 text-left">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  {tr("WELFARE & HEALTH FUND (10%)")}
                </span>
                <p className="font-display text-3xl font-black text-white mt-2">
                  ₹{welfareShare}
                </p>
                <p className="text-[10px] text-cyan-300 mt-2 uppercase leading-tight">
                  {tr("Democratically pooled for accident insurance, medical claims, and child education.")}
                </p>
              </div>

              <div className="border border-rose-500/30 bg-rose-950/10 p-5 text-left">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  {tr("COMMERCIAL MIDDLEMEN CUT")}
                </span>
                <p className="font-display text-3xl font-black text-rose-400 mt-2">
                  ₹0
                </p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase leading-tight">
                  35% (~₹{corporateCut}) → ₹0
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ALGORITHMIC WORKFORCE TRANSPARENCY
          ========================================================================= */}
      <section id="impact" className="relative z-10 scroll-mt-20 border-b border-white/10 bg-stoneblack py-16 sm:py-20 pointer-events-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <span className="font-mono text-[10px] tracking-[0.25em] text-emerald-400 uppercase border border-emerald-500/30 px-3 py-1 bg-emerald-950/30">
              {tr("DECENTRALIZED WORK ALLOCATION")}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              {tr("Transparent Matching Engine")}
            </h2>
            <p className="mt-3 font-mono text-xs text-slate-400 uppercase tracking-wide">
              {tr("Unlike predatory gig platforms that hide dispatch rules, every booking in SevaCoop is matched using our published mathematical formula.")}
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-8 border border-white/15">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                  {tr("Audited Formula Specification")}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">VERSION 2.4-COOP</span>
            </div>

            <div className="border border-white/10 bg-black/70 p-4 text-center">
              <code className="block whitespace-nowrap font-mono text-xs sm:text-sm text-emerald-300 font-bold tracking-wider">
                {t("matchScore")} = 0.30×{tr("Skill Match")} + 0.25×{tr("Proximity")} + 0.20×{tr("Rating")} + 0.15×{tr("Availability")} + 0.10×{tr("Fairness")}
              </code>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-5">
              {WEIGHTS.map(([label, w, desc]) => (
                <div
                  key={label}
                  className="border border-white/10 bg-white/[0.02] p-3.5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white uppercase">{tr(label)}</span>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5">
                      {w}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] leading-tight text-slate-400 uppercase">{tr(desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: COOPERATIVE SERVICE CATALOGUE
          ========================================================================= */}
      <section id="catalogue" className="relative z-10 scroll-mt-20 border-b border-white/10 bg-grid-stoneblack py-16 sm:py-20 pointer-events-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] text-emerald-400 uppercase">
                {tr("CO-OP DISPATCH CATALOGUE")}
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                {tr("Available Cooperative Services")}
              </h2>
            </div>
            <Link
              to="/services"
              className="btn-tech-outline self-start sm:self-auto"
            >
              {tr("FULL DIRECTORY")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(safeServices.length > 0 ? safeServices : PRIMARY_SERVICES.concat(SECONDARY_SERVICES)).map((c, i) => (
              <Link
                key={c.id || i}
                to={`/book/${c.id}`}
                className="group border border-white/10 bg-black/40 p-5 transition-all duration-200 hover:border-white hover:bg-stoneblack-surface hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/15 bg-stoneblack text-white group-hover:border-white">
                    <CategoryIcon name={c.name || c.title} className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-0.5">
                    {tr("VERIFIED")}
                  </span>
                </div>

                <h3 className="font-display text-sm font-bold uppercase text-white group-hover:text-emerald-300 transition-colors">
                  {c.name ? tService(c.name) : tr(c.title)}
                </h3>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-400 line-clamp-2 uppercase">
                  {c.name ? tServiceDesc(c.name, c.description) : tr(c.desc)}
                </p>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-white font-bold">{tr("FROM")} {fmtINR(c.base_price || c.basePrice)}</span>
                  <span className="text-slate-400 group-hover:text-white transition-colors">{tr("BOOK →")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: 4-STEP TECHNICAL PROTOCOL (HOW IT WORKS)
          ========================================================================= */}
      <section id="how" className="relative z-10 scroll-mt-20 border-b border-white/10 bg-stoneblack py-16 sm:py-20 pointer-events-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <span className="font-mono text-[10px] tracking-[0.25em] text-emerald-400 uppercase border border-emerald-500/30 px-3 py-1 bg-emerald-950/30">
              {tr("OPERATIONAL PROTOCOL")}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              {tr("How Dispatch Functions")}
            </h2>
            <p className="mt-3 font-mono text-xs text-slate-400 uppercase tracking-wide">
              {tr("From doorstep requirement to artisan arrival — an automated, transparent, cooperative workflow.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ClipboardCheck,
                step: "01",
                title: tr("FEDERATION ONBOARDING"),
                desc: tr("Equitable job rotation across society members"),
              },
              {
                icon: CalendarCheck,
                step: "02",
                title: tr("DISPATCH REQUISITION"),
                desc: tr("Select common booking value"),
              },
              {
                icon: Zap,
                step: "03",
                title: tr("AI WORKFORCE ALLOCATION"),
                desc: tr("Verified competence and society trade skills"),
              },
              {
                icon: CreditCard,
                step: "04",
                title: tr("DIRECT SETTLEMENT"),
                desc: tr("Direct digital payment straight into verified worker bank account. Zero delays."),
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="border border-white/10 bg-black/40 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex h-9 w-9 items-center justify-center border border-white/15 bg-stoneblack text-white">
                        <Icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400">#{s.step}</span>
                    </div>
                    <h3 className="font-display text-xs font-bold tracking-wider text-white uppercase">{s.title}</h3>
                    <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-400 uppercase">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: METRICS TICKER
          ========================================================================= */}
      <section className="relative z-10 border-b border-white/10 bg-black/60 py-10 pointer-events-auto">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, value: safeWorkers.length || 32, label: tr("VERIFIED CO-OP ARTISANS") },
            { icon: CalendarCheck, value: safeServices.length || 10, label: tr("LIVE SERVICE TRADES") },
            { icon: Landmark, value: 90, suffix: "%", label: tr("DIRECT REMITTANCE TO ARTISAN") },
            { icon: Star, value: avgRating, decimals: 1, suffix: "★", label: tr("CUSTOMER SATISFACTION INDEX") },
          ].map((s) => (
            <div key={s.label} className="border border-white/10 bg-stoneblack/50 p-5">
              <div className="flex items-center justify-between">
                <s.icon className="h-5 w-5 text-emerald-400" />
                <span className="font-mono text-[10px] text-slate-400">[ LIVE ]</span>
              </div>
              <div className="mt-3 font-display text-2xl sm:text-3xl font-black text-white">
                <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
