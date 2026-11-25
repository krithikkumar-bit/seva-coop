import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Search,
  ShieldCheck,
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
    <div className="spec-card group flex flex-col justify-between p-4 sm:p-5">
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
            <CategoryIcon name={s.name} className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800">
              <Star className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" /> 4.9
            </span>
            {workerCount != null && (
              <span className="text-[11px] font-medium text-neutral-500">
                {workerCount} {workerCount === 1 ? tr("Artisan") : tr("Artisans")}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-neutral-900">{tService(s.name)}</h3>
        {s.name_hi && <p className="text-xs text-neutral-400">{s.name_hi}</p>}
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
          {tServiceDesc(s.name, s.description)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3.5">
        <div>
          <span className="text-[11px] text-neutral-400 block">Starts at</span>
          <span className="text-sm font-extrabold text-neutral-900">{fmtINR(s.base_price)}</span>
        </div>
        <Link
          to={`/book/${s.id}`}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-1.5 text-xs font-bold text-neutral-900 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition"
        >
          {tr("Book")}
        </Link>
      </div>
    </div>
  );
}

const CATEGORY_ZONES = [
  { key: "all", label: "All Services", iconName: "" },
  { key: "electrician", label: "Electrician", iconName: "Electrician" },
  { key: "plumber", label: "Plumber", iconName: "Plumber" },
  { key: "carpenter", label: "Carpenter", iconName: "Carpenter" },
  { key: "cleaning", label: "Cleaning", iconName: "Cleaning" },
  { key: "ac_technician", label: "AC Technician", iconName: "AC Technician" },
  { key: "painter", label: "Painter", iconName: "Painter" },
  { key: "driver", label: "Driver", iconName: "Driver" },
  { key: "caregiver", label: "Caregiver", iconName: "Caregiver" },
  { key: "domestic_helper", label: "Domestic Helper", iconName: "Domestic Helper" },
  { key: "gardener", label: "Gardener", iconName: "Gardener" },
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
    return name.includes(zone.replace(/_/g, " ").toLowerCase());
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
      {/* Urban Company 3-Column Service Layout */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-900">
            {tr("Home Services Directory")}
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {tr("Select a service category to book a verified cooperative artisan.")}
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
            placeholder={tr("Search electrician, plumber, AC...")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Sticky Category Selector Box (UC Style) */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
            {tr("Select a service")}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2">
            {CATEGORY_ZONES.map((zone) => {
              const active = selectedZone === zone.key;
              return (
                <button
                  key={zone.key}
                  type="button"
                  onClick={() => setSelectedZone(zone.key)}
                  className={
                    "flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition border " +
                    (active
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-transparent bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70")
                  }
                >
                  <CategoryIcon name={zone.iconName} className="h-4 w-4 mb-1.5" />
                  <span className="text-[11px] font-semibold leading-tight">
                    {zone.key === "all" ? tr("All") : tService(zone.label)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Service Cards */}
        <div className="lg:col-span-6 space-y-6">
          {services === null ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl border border-neutral-200 bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
              <Search className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-800">{tr("No matching services found")}</p>
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setSelectedZone("all");
                }}
                className="mt-2 text-xs font-semibold text-neutral-900 underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((s) => (
                <ServiceCard key={s.id} s={s} workerCount={count(s)} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sticky UC-style Trust Promise Box */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900">SevaCoop Promise</h3>
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Verified & ID-checked professionals</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Upfront pricing before booking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>90% goes straight to the worker</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Pay securely via Razorpay or Cash</span>
              </li>
            </ul>
          </div>

          {workers && workers.length > 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                Top Rated Artisans
              </h4>
              <div className="space-y-3">
                {workers.slice(0, 3).map((w) => (
                  <div key={w.user_id || w.profile_id} className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-neutral-900 flex items-center gap-1">
                        {w.name}
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                      </p>
                      <p className="text-[11px] text-neutral-500">{(w.skills || []).slice(0, 2).join(", ")}</p>
                    </div>
                    <span className="font-bold text-neutral-900">★ {Number(w.avg_rating || 4.9).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </Frame>
  );
}
