import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  CreditCard,
  Droplets,
  Hammer,
  HardHat,
  HeartHandshake,
  IndianRupee,
  Info,
  Landmark,
  Pocket,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
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
import { fmtINR } from "../lib/cn";

const WEIGHTS = [
  ["Skill Match", "30%", "Verified trade certification and experience"],
  ["Proximity", "25%", "Closest available worker to reduce travel time"],
  ["Rating", "20%", "Consistent feedback from local households"],
  ["Availability", "15%", "Workers actively ready for immediate dispatch"],
  ["Fair Rotation", "10%", "Balanced job distribution across members"],
];

const PRIMARY_SERVICES = [
  {
    num: "01",
    id: 1,
    title: "Electrician",
    desc: "Wiring safety, circuit repairs, fan/light installation, and power backup setup.",
    icon: Zap,
    basePrice: 350,
    workerCount: 4,
  },
  {
    num: "02",
    id: 2,
    title: "Plumber",
    desc: "Leak detection, pipe fitting, tap repairs, and water purifier maintenance.",
    icon: Droplets,
    basePrice: 350,
    workerCount: 4,
  },
  {
    num: "03",
    id: 3,
    title: "Carpenter",
    desc: "Door/lock repair, custom furniture assembly, and wooden fixtures.",
    icon: Hammer,
    basePrice: 400,
    workerCount: 4,
  },
  {
    num: "04",
    id: 5,
    title: "Home Cleaning",
    desc: "Deep kitchen & bathroom sanitization, appliance cleaning, and full-home care.",
    icon: Sparkles,
    basePrice: 450,
    workerCount: 4,
  },
  {
    num: "05",
    id: 10,
    title: "AC Technician",
    desc: "AC servicing, filter cleaning, cooling checkups, and gas top-up.",
    icon: Snowflake,
    basePrice: 600,
    workerCount: 4,
  },
];

const SECONDARY_SERVICES = [
  {
    num: "06",
    id: 4,
    title: "Painter",
    desc: "Interior & exterior painting, waterproofing putty, and clean wall finishes.",
    icon: Wrench,
    basePrice: 500,
    workerCount: 3,
  },
  {
    num: "07",
    id: 6,
    title: "Driver",
    desc: "Verified hourly city and outstation drivers with audited licenses.",
    icon: HardHat,
    basePrice: 300,
    workerCount: 3,
  },
  {
    num: "08",
    id: 8,
    title: "Caregiver",
    desc: "Compassionate elderly care, health monitoring, and patient assistance.",
    icon: HeartHandshake,
    basePrice: 550,
    workerCount: 3,
  },
  {
    num: "09",
    id: 9,
    title: "Domestic Helper",
    desc: "Trusted daily household help, kitchen assistance, and home upkeep.",
    icon: Pocket,
    basePrice: 280,
    workerCount: 4,
  },
  {
    num: "10",
    id: 7,
    title: "Gardener",
    desc: "Terrace gardens, lawn care, seasonal pruning, and organic potting.",
    icon: Compass,
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
      const p = Math.min(1, (now - start) / 1000);
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
  const [selectedServiceId, setSelectedServiceId] = useState("1");
  const [calcAmount, setCalcAmount] = useState(1000);

  const { setSceneData } = useSceneData();

  useEffect(() => {
    api.get("/services")
      .then((r) => setServices(Array.isArray(r.data) ? r.data : []))
      .catch(() => setServices([]));
    api.get("/workers")
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
  const safeWorkers = Array.isArray(workers) ? workers : [];
  const safeServices = Array.isArray(services) ? services : [];
  const rated = safeWorkers.filter((w) => w && w.avg_rating > 0);
  const avgRating = rated.length ? rated.reduce((n, w) => n + w.avg_rating, 0) / rated.length : 4.9;

  const artisanShare = Math.round(calcAmount * 0.9);
  const welfareShare = Math.round(calcAmount * 0.1);
  const corporateCut = Math.round(calcAmount * 0.35);

  return (
    <PublicLayout>
      {/* SECTION 1: HERO */}
      <section className="relative w-full border-b border-slate-200 bg-gradient-to-b from-white via-emerald-50/30 to-slate-50/80 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Clear Value Proposition + Instant Service Picker */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{tr("Ministry of Cooperation Aligned · 90% Fair Payout")}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                {tr("Trusted Home Services,")}{" "}
                <span className="text-emerald-600">{tr("Owned by Workers.")}</span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-slate-600 max-w-xl">
                {t("heroSub")}
              </p>

              {/* Quick Booking Widget */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-card max-w-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-emerald-600" />
                    {tr("Quick Service Booking")}
                  </span>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {tr("Instant Matching")}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    aria-label="Choose a service"
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
                  >
                    {(safeServices.length > 0 ? safeServices : PRIMARY_SERVICES).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name ? tService(s.name) : tr(s.title)} — From ₹{s.base_price || s.basePrice}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => navigate(`/book/${selectedServiceId}`)}
                    className="btn-primary-coop py-2.5 px-5 justify-center whitespace-nowrap"
                  >
                    <span>{tr("Book Now")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {tr("Upfront transparent pricing")}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {tr("Razorpay & Cash supported")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/services" className="btn-secondary-coop">
                  {tr("Explore All 10 Services")}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition"
                >
                  {tr("Join as a Cooperative Worker")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Service Highlights */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-glass">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{tr("Popular Services Near You")}</h2>
                    <p className="text-xs text-slate-500">{tr("Click any service to schedule a visit")}</p>
                  </div>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setActiveCluster("primary")}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                        activeCluster === "primary"
                          ? "bg-white text-emerald-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tr("Home Repairs")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCluster("secondary")}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                        activeCluster === "secondary"
                          ? "bg-white text-emerald-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tr("Care & Daily Help")}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {activeSpecs.map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <Link
                        key={spec.num}
                        to={`/book/${spec.id}`}
                        className="spec-card group flex items-center gap-4 p-3.5"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {tr(spec.title)}
                            </h3>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
                              From ₹{spec.basePrice}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                            {tr(spec.desc)}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: COMMUNITY TRUST PARTNERS */}
      <TrustedTeams />

      {/* SECTION 3: COOPERATIVE MODEL & LIVE FAIR-WAGE CALCULATOR */}
      <section id="about" className="relative z-10 scroll-mt-20 border-b border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {tr("Sahakar Se Samriddhi · Fair Gig Economy")}
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {tr("Why Choose a Worker Cooperative?")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              {tr("Commercial apps take up to 35% in hidden commissions. SevaCoop keeps money with the skilled workers who serve your home.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[
              {
                icon: ShieldCheck,
                stat: "90%",
                color: "bg-emerald-50 text-emerald-600",
                title: "Direct Worker Payout",
                desc: "90% of every service payment goes directly to the artisan's verified account with zero hidden cuts.",
                footer: "Zero middleman commissions",
              },
              {
                icon: HeartHandshake,
                stat: "10%",
                color: "bg-sky-50 text-sky-600",
                title: "Worker Welfare Fund",
                desc: "10% supports accident insurance, medical coverage, tools, and education benefits for worker families.",
                footer: "Social safety net included",
              },
              {
                icon: Users,
                stat: "1 Member = 1 Vote",
                color: "bg-indigo-50 text-indigo-600",
                title: "Democratic Ownership",
                desc: "Artisans vote on fair rates, work schedules, and welfare policies through their local cooperative society.",
                footer: "Worker-governed rules",
              },
              {
                icon: Landmark,
                stat: "Verified",
                color: "bg-amber-50 text-amber-600",
                title: "Audited & Compliant",
                desc: "Background-checked workers with government ID verification and transparent multi-state society audits.",
                footer: "Safe & trusted households",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                        {item.stat}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{tr(item.title)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{tr(item.desc)}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{tr(item.footer)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Fair-Wage Simulator */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 max-w-4xl mx-auto shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{tr("See Where Your Payment Goes")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr("Select or slide a service amount to compare SevaCoop vs commercial apps")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCalcAmount(amt)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                      calcAmount === amt
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <input
                type="range"
                min={300}
                max={10000}
                step={50}
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                aria-label="Service amount slider"
                className="w-full h-2 accent-emerald-600 cursor-pointer border-0 bg-transparent p-0 focus:ring-0"
              />
              <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-1">
                <span>₹300</span>
                <span className="text-slate-700 font-bold">Booking Amount: ₹{calcAmount}</span>
                <span>₹10,000</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  {tr("Worker Take-Home (90%)")}
                </span>
                <p className="font-display text-3xl font-extrabold text-slate-900 mt-1.5">
                  ₹{artisanShare}
                </p>
                <p className="text-xs text-emerald-800 mt-2">
                  {tr("Paid directly to the verified artisan who completed your job.")}
                </p>
              </div>

              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">
                  {tr("Welfare & Insurance (10%)")}
                </span>
                <p className="font-display text-3xl font-extrabold text-slate-900 mt-1.5">
                  ₹{welfareShare}
                </p>
                <p className="text-xs text-sky-800 mt-2">
                  {tr("Covers health insurance, safety gear, and family welfare.")}
                </p>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                  {tr("Corporate Commission")}
                </span>
                <p className="font-display text-3xl font-extrabold text-rose-600 mt-1.5">
                  ₹0
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  Commercial apps deduct ~35% (₹{corporateCut}) from workers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TRANSPARENT MATCHING ENGINE */}
      <section id="impact" className="relative z-10 scroll-mt-20 border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {tr("Fair & Explainable AI")}
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {tr("Transparent Worker Matching")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              {tr("No secret black-box algorithms. Every job is matched openly using five clear factors so every member gets a fair chance.")}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Info className="h-4 w-4 text-emerald-600" />
                <span>{tr("Published Matching Formula")}</span>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                100% Auditable
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xs overflow-x-auto">
              <code className="whitespace-nowrap font-mono text-xs sm:text-sm text-emerald-700 font-semibold">
                {t("matchScore")} = 0.30 × {tr("Skill")} + 0.25 × {tr("Proximity")} + 0.20 × {tr("Rating")} + 0.15 × {tr("Availability")} + 0.10 × {tr("Fairness")}
              </code>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {WEIGHTS.map(([label, w, desc]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{tr(label)}</span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      {w}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{tr(desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: ALL 10 SERVICES DIRECTORY */}
      <section id="catalogue" className="relative z-10 scroll-mt-20 border-b border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {tr("Service Directory")}
              </span>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {tr("Everything Your Home Needs")}
              </h2>
            </div>
            <Link to="/services" className="btn-secondary-coop self-start sm:self-auto">
              {tr("Browse Full Directory")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(safeServices.length > 0 ? safeServices : PRIMARY_SERVICES.concat(SECONDARY_SERVICES)).map((c, i) => (
              <Link
                key={c.id || i}
                to={`/book/${c.id}`}
                className="spec-card group flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <CategoryIcon name={c.name || c.title} className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                      {tr("Verified")}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {c.name ? tService(c.name) : tr(c.title)}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                    {c.name ? tServiceDesc(c.name, c.description) : tr(c.desc)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">From {fmtINR(c.base_price || c.basePrice)}</span>
                  <span className="font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                    {tr("Book →")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: HOW IT WORKS (4 SIMPLE STEPS) */}
      <section id="how" className="relative z-10 scroll-mt-20 border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {tr("Simple 4-Step Process")}
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {tr("How SevaCoop Works")}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              {tr("From booking to secure digital payment in just a few taps.")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ClipboardCheck,
                step: "1",
                title: tr("Pick a Service"),
                desc: tr("Choose from 10 verified household categories with upfront base pricing."),
              },
              {
                icon: CalendarCheck,
                step: "2",
                title: tr("Choose Date & Address"),
                desc: tr("Pick your convenient time slot or request priority emergency support."),
              },
              {
                icon: Zap,
                step: "3",
                title: tr("Smart Co-op Match"),
                desc: tr("Get matched automatically with the best nearby verified worker, or choose your own."),
              },
              {
                icon: CreditCard,
                step: "4",
                title: tr("Pay & Rate"),
                desc: tr("Pay securely via Razorpay UPI/Cards or cash, and receive an instant 90/10 fair-pay receipt."),
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700">
                        {s.step}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7: LIVE METRICS */}
      <section className="relative z-10 bg-emerald-900 text-white py-12">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4">
          {[
            { icon: BadgeCheck, value: safeWorkers.length || 32, label: tr("Verified Cooperative Workers") },
            { icon: CalendarCheck, value: safeServices.length || 10, label: tr("Household Service Trades") },
            { icon: IndianRupee, value: 90, suffix: "%", label: tr("Direct Worker Payout") },
            { icon: Star, value: avgRating, decimals: 1, suffix: "★", label: tr("Average Customer Rating") },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 p-5 backdrop-blur-xs border border-white/10">
              <s.icon className="h-5 w-5 text-emerald-300" />
              <div className="mt-3 font-display text-3xl font-extrabold text-white">
                <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-100">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
