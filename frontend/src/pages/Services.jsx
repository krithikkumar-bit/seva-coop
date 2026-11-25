import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BadgeCheck,
  CheckCircle2,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import api from "../api";
import { useLang } from "../i18n";
import { useSceneData } from "../scene/SceneStore";
import { Frame } from "../components/CustomerShell";
import { FALLBACK_SERVICES, fmtINR, getServiceImage, SERVICE_GROUPS } from "../lib/cn";

export function ServiceCard({ s, workerCount }) {
  const { tr, tService, tServiceDesc } = useLang();
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 transition hover:border-neutral-300 hover:shadow-card">
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          Verified Co-op
        </span>
        <h3 className="mt-0.5 text-base font-bold text-neutral-900">
          {tService(s.name)}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
          <Star className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />
          <span className="font-bold text-neutral-900">4.85</span>
          {workerCount > 0 && (
            <span>· {workerCount} {workerCount === 1 ? tr("Artisan") : tr("Artisans")}</span>
          )}
        </div>
        <p className="mt-2 text-sm font-bold text-neutral-900">
          {fmtINR(s.base_price)}
          <span className="text-xs font-normal text-neutral-500"> · Visit charge</span>
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-500">
          {tServiceDesc(s.name, s.description)}
        </p>
      </div>

      <div className="relative shrink-0 w-28 sm:w-32 pb-3">
        <div className="h-24 sm:h-28 w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/60">
          <img
            src={getServiceImage(s.name)}
            alt={s.name}
            className="h-full w-full object-cover"
          />
        </div>
        <Link
          to={`/book/${s.id}`}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-lg border border-violet-200 bg-white px-5 py-1.5 text-xs font-bold text-[#6E42E5] shadow-md hover:bg-[#6E42E5] hover:text-white hover:border-[#6E42E5] transition whitespace-nowrap"
        >
          {tr("Book")}
        </Link>
      </div>
    </div>
  );
}

export default function Services() {
  const { t, tr, tService } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGroup = searchParams.get("group") || "all";
  const [services, setServices] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [q, setQ] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);
  const { setSceneData } = useSceneData();

  useEffect(() => {
    setSelectedGroup(searchParams.get("group") || "all");
  }, [searchParams]);

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

  const selectGroup = (key) => {
    setSelectedGroup(key);
    if (key === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ group: key });
    }
  };

  const filtered = useMemo(() => {
    const activeGroup = SERVICE_GROUPS.find((g) => g.key === selectedGroup);
    return (Array.isArray(services) ? services : [])
      .filter((s) => {
        if (!activeGroup) return true;
        return activeGroup.names.some((n) => n.toLowerCase() === s.name.toLowerCase());
      })
      .filter((s) =>
        (s.name + (s.name_hi || "") + (s.description || "")).toLowerCase().includes(q.toLowerCase())
      );
  }, [services, selectedGroup, q]);

  const count = (s) => {
    if (s.worker_count != null) return s.worker_count;
    return (Array.isArray(workers) ? workers : []).filter((w) =>
      (w.skills || []).map((x) => x.toLowerCase()).includes(s.name.toLowerCase())
    ).length;
  };

  const leftTiles = [
    { key: "all", label: "All 22 Services", img: "/images/salon_women.jpg" },
    ...SERVICE_GROUPS.map((g) => ({ key: g.key, label: g.shortLabel, img: g.img })),
  ];

  return (
    <Frame title={t("browseServices")}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
            {tr("All Urban Company Services")}
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {tr("22 doorstep service categories · 90% direct payout to verified co-op artisans.")}
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
            placeholder={tr("Search salon, spa, pest control, AC, RO...")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Sticky Category Verticals */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
            {tr("Select a category")}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-2 gap-2.5">
            {leftTiles.map((tile) => {
              const active = selectedGroup === tile.key;
              return (
                <button
                  key={tile.key}
                  type="button"
                  onClick={() => selectGroup(tile.key)}
                  className={
                    "flex flex-col items-center justify-center rounded-xl p-2 text-center transition border " +
                    (active
                      ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                      : "border-transparent bg-[#F5F5F5] hover:bg-neutral-200/70")
                  }
                >
                  <img
                    src={tile.img}
                    alt={tile.label}
                    className="h-10 w-12 rounded-md object-cover mb-1.5"
                  />
                  <span className="text-[11px] font-semibold text-neutral-800 leading-tight">
                    {tr(tile.label)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Service Rows */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <span>
              {selectedGroup === "all"
                ? "All Categories"
                : SERVICE_GROUPS.find((g) => g.key === selectedGroup)?.label}
            </span>
            <span>Showing {filtered.length} services</span>
          </div>

          {services === null ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-36 rounded-2xl border border-neutral-200 bg-neutral-100 animate-pulse" />
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
                  selectGroup("all");
                }}
                className="mt-2 text-xs font-semibold text-neutral-900 underline"
              >
                Show all 22 services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((s) => (
                <ServiceCard key={s.id} s={s} workerCount={count(s)} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sticky UC Promise Box */}
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
