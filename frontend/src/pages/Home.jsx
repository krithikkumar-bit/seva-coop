import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  CalendarCheck,
  CreditCard,
  Info,
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
import { FALLBACK_SERVICES, fmtINR, getServiceImage, SERVICE_GROUPS } from "../lib/cn";

const HERO_TILES = [
  { label: "Salon for Women", to: "/book/11", img: "/images/salon_women.jpg" },
  { label: "Salon for Men & Kids", to: "/book/12", img: "/images/salon_men.jpg" },
  { label: "Spa & Massage", to: "/services?group=salon_spa", img: "/images/spa_women.jpg" },
  { label: "AC & Appliances", to: "/services?group=appliances", img: "/images/ac_technician.jpg" },
  { label: "Cleaning & Pest", to: "/services?group=cleaning_pest", img: "/images/cleaning.jpg" },
  { label: "Electrician", to: "/book/1", img: "/images/electrician.jpg" },
  { label: "Plumber", to: "/book/2", img: "/images/plumber.jpg" },
  { label: "Carpenter", to: "/book/3", img: "/images/carpenter.jpg" },
  { label: "Home Painting", to: "/book/4", img: "/images/painter.jpg" },
];

const WEIGHTS = [
  ["Skill Match", "30%", "Verified trade certification and experience"],
  ["Proximity", "25%", "Closest worker for faster arrival"],
  ["Rating", "20%", "Consistent feedback from households"],
  ["Availability", "15%", "Active on-duty shift readiness"],
  ["Fair Rotation", "10%", "Equitable job rotation across members"],
];

export default function Home() {
  const { t, tr, tService } = useLang();
  const { user } = useAuth();
  const [services, setServices] = useState(null);
  const [workers, setWorkers] = useState(null);
  const [calcAmount, setCalcAmount] = useState(1000);
  const { setSceneData } = useSceneData();

  useEffect(() => {
    api.get("/services")
      .then((r) => setServices(Array.isArray(r.data) && r.data.length >= 22 ? r.data : FALLBACK_SERVICES))
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
  const avgRating = rated.length ? (rated.reduce((n, w) => n + w.avg_rating, 0) / rated.length).toFixed(1) : "4.8";

  const artisanShare = Math.round(calcAmount * 0.9);
  const welfareShare = Math.round(calcAmount * 0.1);
  const corporateCut = Math.round(calcAmount * 0.35);

  const findSvc = (name) =>
    safeServices.find((s) => s.name.toLowerCase() === name.toLowerCase()) ||
    FALLBACK_SERVICES.find((s) => s.name.toLowerCase() === name.toLowerCase());

  const mostBooked = [
    findSvc("Salon for Women"),
    findSvc("AC Technician"),
    findSvc("Washing Machine Repair"),
    findSvc("Pest Control"),
    findSvc("Cleaning"),
  ].filter(Boolean);

  return (
    <PublicLayout>
      {/* 1. SPLIT SERVICE SHOWCASE HERO */}
      <section className="w-full bg-white py-10 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Headline + "What are you looking for?" 3x3 UC Tiles */}
            <div className="lg:col-span-5 space-y-6">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-neutral-900 leading-[1.18]">
                {tr("Home services at your doorstep")}
              </h1>

              <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-neutral-700">
                    {tr("What are you looking for?")}
                  </h2>
                  <Link to="/services" className="text-xs font-semibold text-neutral-900 hover:underline">
                    {tr("See all 22")}
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {HERO_TILES.map((tile) => (
                    <Link
                      key={tile.label}
                      to={tile.to}
                      className="group flex flex-col items-center justify-start rounded-lg bg-[#F5F5F5] p-2.5 text-center transition hover:bg-[#EBEBEB]"
                    >
                      <div className="h-14 w-16 overflow-hidden rounded-md mb-2 bg-white">
                        <img
                          src={tile.img}
                          alt={tile.label}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-neutral-800 leading-tight line-clamp-2">
                        {tile.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-10 pt-2">
                <div className="flex items-center gap-3">
                  <Star className="h-7 w-7 text-neutral-800 stroke-[1.5]" />
                  <div>
                    <p className="text-lg font-bold text-neutral-900 leading-none">{avgRating}</p>
                    <p className="text-xs text-neutral-500 mt-1">{tr("Service Rating")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-7 w-7 text-neutral-800 stroke-[1.5]" />
                  <div>
                    <p className="text-lg font-bold text-neutral-900 leading-none">
                      {safeWorkers.length || 32}+ Verified
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">{tr("Co-op Artisans · 90% Pay")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4-Photo Stitched Service Collage (Salon, Appliances, Cleaning, Pest/Repairs) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                <Link
                  to="/services?group=salon_spa"
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-neutral-100"
                >
                  <img
                    src="/images/salon_women.jpg"
                    alt="Salon & Spa at Home"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4">
                    <p className="text-xs sm:text-sm font-bold text-white">Salon & Spa at Home</p>
                  </div>
                </Link>

                <Link
                  to="/services?group=appliances"
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-neutral-100"
                >
                  <img
                    src="/images/ac_technician.jpg"
                    alt="AC & Appliance Repair"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4">
                    <p className="text-xs sm:text-sm font-bold text-white">AC & Appliance Repair</p>
                  </div>
                </Link>

                <Link
                  to="/services?group=cleaning_pest"
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-neutral-100"
                >
                  <img
                    src="/images/cleaning.jpg"
                    alt="Cleaning & Pest Control"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4">
                    <p className="text-xs sm:text-sm font-bold text-white">Cleaning & Pest Control</p>
                  </div>
                </Link>

                <Link
                  to="/services?group=repairs"
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-neutral-100"
                >
                  <img
                    src="/images/plumber.jpg"
                    alt="Electricians, Plumbers & Carpenters"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4">
                    <p className="text-xs sm:text-sm font-bold text-white">Electricians, Plumbers & More</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "Most booked services" */}
      <section className="w-full bg-white py-10 border-t border-neutral-100">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
              {tr("Most booked services")}
            </h2>
            <Link to="/services" className="btn-secondary-coop py-1.5 px-3.5 text-xs">
              {tr("See all")}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {mostBooked.map((s) => (
              <Link key={s.id} to={`/book/${s.id}`} className="group block">
                <div className="overflow-hidden rounded-xl aspect-[4/3] bg-neutral-100">
                  <img
                    src={getServiceImage(s.name)}
                    alt={s.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-2.5 text-sm font-semibold text-neutral-900 leading-snug">
                  {tService(s.name)}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                  <Star className="h-3 w-3 fill-neutral-900 text-neutral-900" />
                  <span className="font-medium text-neutral-800">4.85</span>
                  <span>(1.2K)</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {fmtINR(s.base_price)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FULL-WIDTH PROMO BANNER */}
      <section className="w-full bg-white py-6">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl bg-[#F5F5F7] border border-neutral-200/80 grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 p-7 sm:p-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> SevaCoop Fair-Pay Standard
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
                All SevaCoop services — with 90% direct worker payout
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                From Salon, Spa & Pest Control to AC, Fridge, RO, Plumber & Electrician — every service is fulfilled by verified Labour Cooperative Society artisans.
              </p>
              <div className="pt-1 flex flex-wrap gap-3">
                <Link to="/services" className="btn-primary-coop py-2.5 px-5 text-sm">
                  Explore All 22 Services
                </Link>
                <a href="#about" className="btn-secondary-coop py-2.5 px-5 text-sm">
                  90/10 Calculator
                </a>
              </div>
            </div>
            <div className="lg:col-span-6 h-56 sm:h-72 lg:h-80">
              <img
                src="/images/pest_control.jpg"
                alt="Verified Cooperative Specialist"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. ALL SEVACOOP SERVICE CATEGORY ROWS */}
      <section className="w-full bg-white py-10 sm:py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 space-y-12">
          {SERVICE_GROUPS.map((group) => {
            const items = group.names.map(findSvc).filter(Boolean);
            return (
              <div key={group.key}>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold text-neutral-900">
                    {tr(group.label)}
                  </h2>
                  <Link
                    to={`/services?group=${group.key}`}
                    className="btn-secondary-coop py-1.5 px-3.5 text-xs"
                  >
                    See all
                  </Link>
                </div>
                <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${items.length >= 5 ? "lg:grid-cols-6" : "lg:grid-cols-4"}`}>
                  {items.map((s) => (
                    <Link key={s.id} to={`/book/${s.id}`} className="group block">
                      <div className="overflow-hidden rounded-xl aspect-[4/3] bg-neutral-100 border border-neutral-200/60">
                        <img
                          src={getServiceImage(s.name)}
                          alt={s.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-2.5 text-sm font-semibold text-neutral-900 leading-snug">
                        {tService(s.name)}
                      </p>
                      <p className="text-xs text-neutral-500">From {fmtINR(s.base_price)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <TrustedTeams />

      {/* 5. INTERACTIVE 90/10 FAIR-PAY CALCULATOR & MATCHING FORMULA */}
      <section id="about" className="w-full bg-white py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 max-w-4xl mx-auto shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">{tr("Where your service payment goes")}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{tr("Zero middlemen commissions — compare SevaCoop vs commercial apps")}</p>
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
                <p className="text-xs text-emerald-800 mt-1.5">{tr("Paid directly to your artisan.")}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <span className="text-xs font-bold text-neutral-700">{tr("Welfare & Insurance (10%)")}</span>
                <p className="font-display text-2xl font-extrabold text-neutral-900 mt-1">₹{welfareShare}</p>
                <p className="text-xs text-neutral-600 mt-1.5">{tr("Medical cover & safety fund.")}</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                <span className="text-xs font-bold text-rose-700">{tr("Corporate Commission")}</span>
                <p className="font-display text-2xl font-extrabold text-rose-600 mt-1">₹0</p>
                <p className="text-xs text-neutral-600 mt-1.5">Commercial apps deduct ~35% (₹{corporateCut}).</p>
              </div>
            </div>
          </div>

          <div id="impact" className="scroll-mt-20 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Info className="h-4 w-4 text-neutral-700" />
                <span>{tr("Transparent Matching Formula")}</span>
              </div>
              <code className="font-mono text-xs text-emerald-700 bg-white border border-emerald-200 px-2.5 py-1 rounded-md">
                {t("matchScore")} = 0.30×Skill + 0.25×Proximity + 0.20×Rating + 0.15×Availability + 0.10×Fairness
              </code>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {WEIGHTS.map(([label, w, desc]) => (
                <div key={label} className="rounded-xl bg-white border border-neutral-200 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{tr(label)}</span>
                    <span className="text-xs font-extrabold text-neutral-900">{w}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">{tr(desc)}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="how" className="scroll-mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Sparkles, step: "1", title: "Pick a Service", desc: "Choose from 22 verified categories with upfront base pricing." },
              { icon: CalendarCheck, step: "2", title: "Choose Slot & Address", desc: "Pick your convenient time slot or urgent visit." },
              { icon: Zap, step: "3", title: "Smart Co-op Match", desc: "Matched by skill, proximity, rating & fair job rotation." },
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
      </section>
    </PublicLayout>
  );
}
