import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Compass,
  HardHat,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { useLang } from "../i18n";
import { useSceneData } from "../scene/SceneStore";
import { Badge, Button, Input, Skeleton, EmptyState } from "../components/ui";
import CategoryIcon from "../components/CategoryIcon";
import { Frame } from "../components/CustomerShell";
import { fmtINR } from "../lib/cn";

export function ServiceCard({ s, workerCount, onHighlight, onUnhighlight }) {
  const { tr, tService, tServiceDesc } = useLang();
  return (
    <Link
      to={`/book/${s.id}`}
      onMouseEnter={() => onHighlight?.(s)}
      onMouseLeave={() => onUnhighlight?.()}
      className="group block h-full border border-white/15 bg-black/60 p-5 text-left shadow-xl backdrop-blur-2xl transition-all hover:border-white hover:bg-stoneblack-surface hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
    >
      <div className="mb-3.5 flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center border border-white/15 bg-stoneblack text-white group-hover:border-emerald-400 transition-colors">
          <CategoryIcon name={s.name} className="h-5 w-5" />
        </div>
        {workerCount != null && (
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-emerald-300">
            {workerCount} {workerCount === 1 ? tr("ARTISAN") : tr("ARTISANS")}
          </span>
        )}
      </div>
      <p className="font-display text-base font-black uppercase text-white group-hover:text-emerald-300 transition-colors">
        {tService(s.name)}
      </p>
      {s.name_hi && (
        <p className="font-mono text-[11px] text-slate-400">{s.name_hi}</p>
      )}
      <p className="mt-2 line-clamp-2 font-mono text-xs text-slate-400 uppercase leading-relaxed">
        {tServiceDesc(s.name, s.description)}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs">
        <p className="font-bold text-white">
          {tr("FROM")} {fmtINR(s.base_price)}
          <span className="font-normal text-slate-400 text-[10px]"> {tr("/ VISIT")}</span>
        </p>
        <span className="inline-flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
          {tr("BOOK NOW →")}
        </span>
      </div>
    </Link>
  );
}

const CATEGORY_ZONES = [
  { key: "all", label: "ALL 10 COOPERATIVE SERVICES" },
  { key: "ac_technician", label: "AC TECHNICIAN" },
  { key: "caregiver", label: "CAREGIVER" },
  { key: "carpenter", label: "CARPENTER" },
  { key: "cleaning", label: "CLEANING" },
  { key: "domestic_helper", label: "DOMESTIC HELPER" },
  { key: "driver", label: "DRIVER" },
  { key: "electrician", label: "ELECTRICIAN" },
  { key: "gardener", label: "GARDENER" },
  { key: "painter", label: "PAINTER" },
  { key: "plumber", label: "PLUMBER" },
];

export default function Services() {
  const { t, tr, tService } = useLang();
  const [services, setServices] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [q, setQ] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

  const {
    setSceneData,
    marketplaceSector,
    setMarketplaceSector,
    hoveredServiceZone,
    setHoveredServiceZone,
    resetCamera,
  } = useSceneData();

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

  // Zone filtering
  const matchesZone = (s, zone) => {
    if (zone === "all") return true;
    const name = (s.name + " " + (s.description || "")).toLowerCase();
    const zoneClean = zone.replace(/_/g, " ").toLowerCase();
    return name.includes(zoneClean);
  };

  const filtered = useMemo(() => {
    return (Array.isArray(services) ? services : [])
      .filter((s) => matchesZone(s, selectedZone))
      .filter((s) =>
        (s.name + s.name_hi + (s.description || "")).toLowerCase().includes(q.toLowerCase())
      );
  }, [services, selectedZone, q]);

  // Use worker_count embedded in service data (from backend), fallback to client-side count
  const count = (s) => {
    if (s.worker_count != null) return s.worker_count;
    return (Array.isArray(workers) ? workers : []).filter((w) =>
      (w.skills || []).map((x) => x.toLowerCase()).includes(s.name.toLowerCase())
    ).length;
  };

  const handleSelectZoneFilter = (zoneKey) => {
    setSelectedZone(zoneKey);
    setMarketplaceSector(zoneKey);
  };

  const handleCardHighlight = (s) => {
    const key = s.name.toLowerCase().replace(/\s+/g, "_");
    setHoveredServiceZone({
      id: key,
      title: `${s.name} (${s.name_hi || ""})`,
      category: "Cooperative Service",
      desc: s.description || "Verified cooperative service with standardized pricing.",
      price: `FROM ${fmtINR(s.base_price)} / VISIT`,
    });
  };

  return (
    <Frame title={t("browseServices")}>
      {/* 3D SERVICES COMMUNITY HERO WITH CONTROLS HUD */}
      <section className="relative mb-10 border border-white/15 bg-black/60 p-6 sm:p-10 backdrop-blur-2xl">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-emerald-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 font-bold">
                <Sparkles className="h-3 w-3" /> {tr("DISTRICT 2 · 3D SERVICES WORLD")}
              </span>
              <span className="text-slate-400">
                {services ? `${services.length}` : "..."}
              </span>
            </div>

            <h2 className="mt-4 font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight">
              {tr("Decentralized")} <span className="text-emerald-400">{tr("Services.")}</span>
            </h2>
            <p className="mt-3 max-w-lg font-mono text-xs uppercase leading-relaxed text-slate-400">
              {tr("Verified local artisans, standardized transparent pricing, and 90% direct digital remittances. Select a trade station to dispatch.")}
            </p>

            {/* Search Bar */}
            <div className="relative mt-6 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full border border-white/15 bg-stoneblack/90 pl-10 pr-4 py-2.5 font-mono text-xs text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                placeholder={tr("Search electrician, plumber, AC, cleaning, driver...")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            {/* 3D Reset Controls */}
            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <Compass className="h-4 w-4 animate-spin" />
                ORBIT TO INSPECT 3D NODES
              </span>
              <div className="h-3 w-px bg-white/20" />
              <button
                type="button"
                onClick={() => {
                  resetCamera();
                  setSelectedZone("all");
                }}
                className="border border-white/20 bg-stoneblack px-3 py-1 text-[11px] uppercase font-bold text-slate-300 hover:text-white transition"
              >
                <RotateCcw className="h-3 w-3 inline mr-1" /> RESET CAMERA
              </button>
            </div>
          </div>

          {/* Right: Live 3D Zone Hover Card */}
          <div className="relative min-h-[14rem] flex flex-col justify-end font-mono">
            <AnimatePresence>
              {hoveredServiceZone && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="border border-emerald-500/40 bg-stoneblack/95 p-6 shadow-2xl backdrop-blur-2xl"
                >
                  <span className="border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-[9px] font-bold text-emerald-300 uppercase">
                    {hoveredServiceZone.category || "COOPERATIVE STATION"}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-black uppercase text-white">
                    {hoveredServiceZone.title || hoveredServiceZone.name}
                  </h3>
                  <p className="mt-1.5 text-xs uppercase text-slate-400 leading-relaxed">
                    {hoveredServiceZone.desc || hoveredServiceZone.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-sm font-black text-emerald-400">
                      {hoveredServiceZone.price}
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 90% TO ARTISAN
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Category Zone Filter Pills */}
        <div className="relative z-10 mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6 font-mono text-[10px]">
          {CATEGORY_ZONES.map((zone) => (
            <button
              key={zone.key}
              type="button"
              onClick={() => handleSelectZoneFilter(zone.key)}
              className={
                "border px-3 py-1.5 uppercase font-bold transition " +
                (selectedZone === zone.key
                  ? "border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "border-white/15 bg-black/40 text-slate-400 hover:border-white/40 hover:text-white")
              }
            >
              {zone.key === "all" ? tr(zone.label) : tService(zone.label)}
            </button>
          ))}
        </div>
      </section>

      {/* SERVICE CARDS GRID */}
      <section className="mb-14">
        <div className="mb-6 flex items-center justify-between font-mono">
          <h3 className="font-display text-xl font-black uppercase text-white">
            {tr("Available Verified Services")}
          </h3>
          <span className="text-xs text-slate-400 uppercase">
            {filtered.length} / {services?.length || 10}
          </span>
        </div>

        {services === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 border border-white/10 bg-black/30 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-white/15 bg-black/40 p-10 text-center font-mono">
            <Search className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-white uppercase">{tr("No services match query")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((s) => (
              <ServiceCard
                key={s.id}
                s={s}
                workerCount={count(s)}
                onHighlight={handleCardHighlight}
                onUnhighlight={() => setHoveredServiceZone(null)}
              />
            ))}
          </div>
        )}
      </section>

      {/* WORKER DISCOVERY SECTION */}
      {workers && workers.length > 0 && (
        <section className="relative border border-white/15 bg-black/60 p-6 sm:p-8 backdrop-blur-2xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono">
            <div>
              <span className="border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[9px] font-bold text-emerald-300 uppercase">
                {tr("VERIFIED")}
              </span>
              <h3 className="mt-2 font-display text-xl font-black uppercase text-white">
                {tr("Verified Cooperative Artisans")}
              </h3>
              <p className="text-[11px] text-slate-400 uppercase mt-0.5">
                {tr("Background-checked by Federation · 90% direct remittance")}
              </p>
            </div>
            <Link
              to="/register"
              className="btn-tech-outline text-xs py-1.5 px-3 self-start sm:self-auto"
            >
              {tr("JOIN AS ARTISAN →")}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-mono">
            {workers.slice(0, 6).map((w) => (
              <div
                key={w.user_id || w.profile_id}
                className="border border-white/12 bg-black/40 p-4 transition hover:border-white/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white uppercase text-xs flex items-center gap-1.5">
                      {w.name}
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{w.address || "Metro Cooperative Zone"}</p>
                  </div>
                  <span className="font-bold text-amber-400 text-xs">
                    {Number(w.avg_rating || 4.9).toFixed(1)}★
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {(w.skills || []).map((sk) => (
                    <span
                      key={sk}
                      className="border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-slate-300 uppercase"
                    >
                      {tService(sk)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px]">
                  <span className="text-slate-400">
                    {w.jobs_done != null ? `${w.jobs_done}` : tr("VERIFIED")}
                  </span>
                  <span className="font-bold text-emerald-400">
                    ₹{w.hourly_rate} {tr("/ VISIT")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Frame>
  );
}
