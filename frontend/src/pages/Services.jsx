import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import api from "../api";
import { useLang } from "../i18n";
import { useSceneData } from "../scene/SceneStore";
import CategoryIcon from "../components/CategoryIcon";
import { Frame } from "../components/CustomerShell";
import { FALLBACK_SERVICES, fmtINR } from "../lib/cn";

export function ServiceCard({ s, workerCount }) {
  const { tr, tService, tServiceDesc } = useLang();
  return (
    <Link
      to={`/book/${s.id}`}
      className="spec-card group flex flex-col justify-between p-5 text-left"
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CategoryIcon name={s.name} className="h-6 w-6" />
          </div>
          {workerCount != null && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              {workerCount} {workerCount === 1 ? tr("Artisan") : tr("Artisans")}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
          {tService(s.name)}
        </h3>
        {s.name_hi && (
          <p className="text-xs font-medium text-slate-400">{s.name_hi}</p>
        )}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {tServiceDesc(s.name, s.description)}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs">
        <p className="font-bold text-slate-900">
          From {fmtINR(s.base_price)}
          <span className="font-normal text-slate-400"> / visit</span>
        </p>
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
          {tr("Book")} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

const CATEGORY_ZONES = [
  { key: "all", label: "All Services" },
  { key: "ac_technician", label: "AC Technician" },
  { key: "caregiver", label: "Caregiver" },
  { key: "carpenter", label: "Carpenter" },
  { key: "cleaning", label: "Cleaning" },
  { key: "domestic_helper", label: "Domestic Helper" },
  { key: "driver", label: "Driver" },
  { key: "electrician", label: "Electrician" },
  { key: "gardener", label: "Gardener" },
  { key: "painter", label: "Painter" },
  { key: "plumber", label: "Plumber" },
];

export default function Services() {
  const { t, tr, tService } = useLang();
  const [services, setServices] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [q, setQ] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

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
        (s.name + (s.name_hi || "") + (s.description || "")).toLowerCase().includes(q.toLowerCase())
      );
  }, [services, selectedZone, q]);

  const count = (s) => {
    if (s.worker_count != null) return s.worker_count;
    return (Array.isArray(workers) ? workers : []).filter((w) =>
      (w.skills || []).map((x) => x.toLowerCase()).includes(s.name.toLowerCase())
    ).length;
  };

  return (
    <Frame title={t("browseServices")}>
      {/* Search & Filter Hero Banner */}
      <section className="mb-8 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              {tr("Verified Home Services Directory")}
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {tr("What help do you need today?")}
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {tr("Upfront pricing, verified cooperative artisans, and 90% direct worker payouts. Pick a service to schedule a visit.")}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-emerald-600 focus:outline-none"
              placeholder={tr("Search electrician, plumber, AC...")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-emerald-200/50 pt-5">
          {CATEGORY_ZONES.map((zone) => (
            <button
              key={zone.key}
              type="button"
              onClick={() => setSelectedZone(zone.key)}
              className={
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition " +
                (selectedZone === zone.key
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700")
              }
            >
              {zone.key === "all" ? tr(zone.label) : tService(zone.label)}
            </button>
          ))}
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-slate-900">
            {tr("Available Services")}
          </h3>
          <span className="text-xs font-medium text-slate-500">
            Showing {filtered.length} of {services?.length || 10}
          </span>
        </div>

        {services === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Search className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">{tr("No matching services found")}</p>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setSelectedZone("all");
              }}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((s) => (
              <ServiceCard key={s.id} s={s} workerCount={count(s)} />
            ))}
          </div>
        )}
      </section>

      {/* Verified Workers Directory */}
      {workers && workers.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> {tr("Background Verified")}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold text-slate-900">
                {tr("Meet Our Cooperative Artisans")}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {tr("Trained & certified members earning 90% of every booking.")}
              </p>
            </div>
            <Link to="/register" className="btn-secondary-coop text-xs py-2 px-3.5 self-start sm:self-auto">
              {tr("Join as a Worker")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workers.slice(0, 6).map((w) => (
              <div
                key={w.user_id || w.profile_id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-emerald-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {w.name}
                      <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{w.address || "Local Cooperative Zone"}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 font-bold text-amber-700 text-xs">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                    {Number(w.avg_rating || 4.9).toFixed(1)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(w.skills || []).map((sk) => (
                    <span
                      key={sk}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
                    >
                      {tService(sk)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3 text-xs">
                  <span className="text-slate-500">
                    {w.jobs_done != null ? `${w.jobs_done} jobs done` : tr("Verified")}
                  </span>
                  <span className="font-bold text-emerald-700">
                    ₹{w.hourly_rate} / visit
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
