import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  HeartHandshake,
  IndianRupee,
  Info,
  Landmark,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useLang } from "../i18n";
import { useSceneData } from "../scene/SceneStore";
import PublicLayout from "../components/PublicLayout";
import TrustedTeams from "../components/TrustedTeams";
import CategoryIcon from "../components/CategoryIcon";
import { FALLBACK_SERVICES, fmtINR } from "../lib/cn";

const BENTO_SHOWCASE = [
  {
    id: 10,
    title: "AC & Electrical Care",
    subtitle: "Servicing, wiring & repairs",
    price: 600,
    rating: "4.9",
    bg: "from-sky-100 via-blue-50 to-indigo-100",
    accent: "text-sky-700",
    badge: "Most Booked",
    serviceName: "AC Technician",
  },
  {
    id: 5,
    title: "Deep Home Cleaning",
    subtitle: "Kitchen, bath & full home",
    price: 450,
    rating: "4.9",
    bg: "from-emerald-100 via-teal-50 to-emerald-50",
    accent: "text-emerald-700",
    badge: "Top Rated",
    serviceName: "Cleaning",
  },
  {
    id: 2,
    title: "Plumbing & Carpentry",
    subtitle: "Leaks, taps & furniture",
    price: 350,
    rating: "4.8",
    bg: "from-amber-100 via-orange-50 to-amber-50",
    accent: "text-amber-800",
    badge: "Instant Visit",
    serviceName: "Plumber",
  },
  {
    id: 8,
    title: "Caregiver & Home Help",
    subtitle: "Trusted elder & daily care",
    price: 550,
    rating: "4.9",
    bg: "from-violet-100 via-purple-50 to-fuchsia-50",
    accent: "text-violet-700",
    badge: "Verified Staff",
    serviceName: "Caregiver",
  },
];

const CARD_TINTS = [
  "bg-sky-50 text-sky-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-violet-50 text-violet-700",
  "bg-rose-50 text-rose-700",
];

const WEIGHTS = [
  ["Skill Match", "30%", "Verified trade certification and experience"],
  ["Proximity", "25%", "Closest worker for faster arrival"],
  ["Rating", "20%", "Consistent feedback from households"],
  ["Availability", "15%", "Active on-duty shift readiness"],
  ["Fair Rotation", "10%", "Equitable job rotation across members"],
];

export default function Home() {
  const { t, tr, tService, tServiceDesc } = useLang();
  const { user } = useAuth();
  const [services, setServices] = useState(null);
  const [workers, setWorkers] = useState(null);
  const [calcAmount, setCalcAmount] = useState(1000);
  const { setSceneData } = useSceneData();

  useEffect(() => {
    api.get("/services")
      .then((r) => setServices(Array.isArray(r.data) && r.data.length > 0 ? r.data : FALLBACK_SERVICES))
      .catch(() => setServices(FALLBACK_SERVICES));
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

  const safeWorkers = Array.isArray(workers) ? workers : [];
  const safeServices = Array.isArray(services) && services.length > 0 ? services : FALLBACK_SERVICES;
  const rated = safeWorkers.filter((w) => w && w.avg_rating > 0);
  const avgRating = rated.length ? (rated.reduce((n, w) => n + w.avg_rating, 0) / rated.length).toFixed(1) : "4.9";

  const artisanShare = Math.round(calcAmount * 0.9);
  const welfareShare = Math.round(calcAmount * 0.1);
  const corporateCut = Math.round(calcAmount * 0.35);

  return (
    <PublicLayout>
      {/* SECTION 1: URBAN COMPANY INSPIRED SPLIT HERO */}
      <section className="relative w-full bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Bold Headline + "What are you looking for?" Category Box */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-neutral-900 leading-[1.15]">
                  {tr("Home services at your doorstep")}
                </h1>
                <p className="mt-2.5 text-sm sm:text-base text-neutral-500">
                  {tr("Verified cooperative professionals · 90% goes straight to workers.")}
                </p>
              </div>

              {/* UC Signature Category Tile Selector Card */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-neutral-800">
                    {tr("What are you looking for?")}
                  </h2>
                  <Link to="/services" className="text-xs font-semibold text-neutral-600 hover:text-neutral-900">
                    {tr("View all →")}
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {safeServices.slice(0, 9).map((s) => (
                    <Link
                      key={s.id}
                      to={`/book/${s.id}`}
                      className="uc-tile group flex flex-col items-center justify-center p-3 text-center"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-neutral-800 shadow-xs mb-2 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                        <CategoryIcon name={s.name} className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-semibold text-neutral-800 leading-tight line-clamp-2">
                        {tService(s.name)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* UC Signature 2-Column Trust Metric Row */}
              <div className="flex flex-wrap items-center gap-8 pt-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
                    <Star className="h-5 w-5 fill-neutral-900 text-neutral-900" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-neutral-900 leading-none">{avgRating}</p>
                    <p className="text-xs text-neutral-500 mt-1">{tr("Service Rating")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
                    <Users className="h-5 w-5 text-neutral-900" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-neutral-900 leading-none">
                      {safeWorkers.length || 32}+ Verified
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">{tr("Co-op Artisans")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-emerald-700 leading-none">90%</p>
                    <p className="text-xs text-neutral-500 mt-1">{tr("Direct Payout")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Urban Company 2x2 Visual Showcase Bento Collage */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                {BENTO_SHOWCASE.map((item, idx) => (
                  <Link
                    key={item.id}
                    to={`/book/${item.id}`}
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.bg} border border-neutral-200/60 p-5 sm:p-6 flex flex-col justify-between transition-all hover:shadow-glass ${
                      idx === 0 || idx === 3 ? "min-h-[200px] sm:min-h-[230px]" : "min-h-[180px] sm:min-h-[210px]"
                    }`}
                  >
                    {/* Decorative clean background motif */}
                    <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-300">
                      <CategoryIcon name={item.serviceName} className="h-36 w-36" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-neutral-900 shadow-xs">
                        {item.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-neutral-900 shadow-xs">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        {item.rating}
                      </span>
                    </div>

                    <div className="relative z-10 mt-6">
                      <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs ${item.accent}`}>
                        <CategoryIcon name={item.serviceName} className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-base sm:text-lg font-extrabold text-neutral-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-0.5">{item.subtitle}</p>
                      <div className="mt-3 flex items-center justify-between text-xs font-bold text-neutral-900">
                        <span>Starts at {fmtINR(item.price)}</span>
                        <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Book <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MOST BOOKED SERVICES (UC-STYLE HORIZONTAL CARDS) */}
      <section className="w-full border-t border-neutral-100 bg-white py-12 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                {tr("Most booked services")}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {tr("Transparent cooperative rates with verified local professionals")}
              </p>
            </div>
            <Link to="/services" className="btn-secondary-coop py-2 px-4 text-xs">
              {tr("See all")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {safeServices.slice(0, 5).map((s, i) => (
              <Link
                key={s.id}
                to={`/book/${s.id}`}
                className="spec-card group flex flex-col justify-between p-4"
              >
                <div>
                  <div className={`mb-4 flex h-32 items-center justify-center rounded-xl ${CARD_TINTS[i % CARD_TINTS.length]} transition group-hover:scale-[1.02]`}>
                    <CategoryIcon name={s.name} className="h-12 w-12" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 group-hover:text-black">
                    {tService(s.name)}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                    <Star className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />
                    <span className="font-semibold text-neutral-800">4.9</span>
                    <span>· Verified Co-op</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500 line-clamp-2">
                    {tServiceDesc(s.name, s.description)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-900">{fmtINR(s.base_price)}</span>
                  <span className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition">
                    {tr("Book")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: TRUSTED PARTNERS STRIP */}
      <TrustedTeams />

      {/* SECTION 4: FAIR-WAGE COOPERATIVE CALCULATOR */}
      <section id="about" className="w-full bg-white py-14 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {tr("Sahakar Se Samriddhi · Fair Gig Economy")}
            </span>
            <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
              {tr("The SevaCoop 90/10 Fair-Pay Promise")}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-500">
              {tr("Unlike commercial platforms that charge up to 35% commission, SevaCoop returns 90% directly to the worker.")}
            </p>
          </div>

          {/* 4 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: ShieldCheck, stat: "90%", title: "Direct Worker Payout", desc: "Paid directly into the artisan's verified account with zero hidden cuts." },
              { icon: HeartHandshake, stat: "10%", title: "Worker Welfare Fund", desc: "Covers accident insurance, medical support, tools, and family welfare." },
              { icon: Users, stat: "1M = 1V", title: "Democratic Ownership", desc: "Artisans vote on fair rates and guidelines in cooperative councils." },
              { icon: Landmark, stat: "Verified", title: "Background Checked", desc: "Government ID verification and multi-state cooperative oversight." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white border border-neutral-200 px-2.5 py-0.5 text-xs font-bold text-neutral-900">
                      {item.stat}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">{tr(item.title)}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">{tr(item.desc)}</p>
                </div>
              );
            })}
          </div>

          {/* Interactive Calculator */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 max-w-4xl mx-auto shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">{tr("Interactive Payout Breakdown")}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{tr("Slide or click a booking amount to see the cooperative split")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCalcAmount(amt)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                      calcAmount === amt
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
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
                className="w-full h-2 accent-neutral-900 cursor-pointer border-0 bg-transparent p-0 focus:ring-0"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>₹300</span>
                <span className="font-bold text-neutral-900">Booking Amount: ₹{calcAmount}</span>
                <span>₹10,000</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <span className="text-xs font-bold text-emerald-800">{tr("Worker Take-Home (90%)")}</span>
                <p className="font-display text-2xl font-extrabold text-neutral-900 mt-1">₹{artisanShare}</p>
                <p className="text-xs text-emerald-800 mt-1.5">{tr("Direct bank/UPI payout to artisan.")}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <span className="text-xs font-bold text-neutral-700">{tr("Welfare & Insurance (10%)")}</span>
                <p className="font-display text-2xl font-extrabold text-neutral-900 mt-1">₹{welfareShare}</p>
                <p className="text-xs text-neutral-600 mt-1.5">{tr("Health cover & society welfare fund.")}</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                <span className="text-xs font-bold text-rose-700">{tr("Corporate Commission")}</span>
                <p className="font-display text-2xl font-extrabold text-rose-600 mt-1">₹0</p>
                <p className="text-xs text-neutral-600 mt-1.5">Commercial apps take ~35% (₹{corporateCut}).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS + TRANSPARENT MATCHING */}
      <section id="impact" className="w-full border-t border-neutral-200 bg-neutral-50 py-14 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 space-y-12">
          <div id="how" className="scroll-mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-900 text-center">
              {tr("How SevaCoop Works")}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Sparkles, step: "1", title: "Pick a Service", desc: "Choose from 10 verified categories with upfront base pricing." },
                { icon: CalendarCheck, step: "2", title: "Choose Slot & Address", desc: "Select a convenient time slot or priority urgent visit." },
                { icon: Zap, step: "3", title: "Transparent Matching", desc: "Auto-match by skill, proximity, rating & fair job rotation." },
                { icon: CreditCard, step: "4", title: "Pay via Razorpay / Cash", desc: "Pay securely and view your instant 90/10 fair-pay invoice." },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="rounded-2xl border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-neutral-400">STEP {s.step}</span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">{tr(s.title)}</h3>
                    <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">{tr(s.desc)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Info className="h-4 w-4 text-neutral-700" />
                <span>{tr("Transparent Matching Formula")}</span>
              </div>
              <code className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {t("matchScore")} = 0.30×Skill + 0.25×Proximity + 0.20×Rating + 0.15×Availability + 0.10×Fairness
              </code>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {WEIGHTS.map(([label, w, desc]) => (
                <div key={label} className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{tr(label)}</span>
                    <span className="text-xs font-extrabold text-neutral-900">{w}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">{tr(desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
