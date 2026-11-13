import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  Compass,
  Loader2,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import api from "../api";
import { useLang } from "../i18n";
import CustomerShell from "../components/CustomerShell";
import CategoryIcon from "../components/CategoryIcon";
import { Alert, Button, Skeleton } from "../components/ui";
import { cn, extractApiError, fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

const mapNameToZone = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("plumb")) return "plumbing";
  if (n.includes("electr")) return "electrical";
  if (n.includes("clean")) return "cleaning";
  if (n.includes("garden")) return "gardening";
  if (n.includes("assist") || n.includes("house") || n.includes("elder") || n.includes("cook")) return "assistance";
  return "craft";
};

export default function BookService() {
  const { serviceId } = useParams();
  const nav = useNavigate();
  const { t, tr, tService } = useLang();
  const [service, setService] = useState(undefined);
  const [workers, setWorkers] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date: today,
    time: "10:00",
    address: "",
    notes: "",
    is_emergency: false,
    worker_id: "",
    lat: null,
    lng: null,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const { setSceneData, marketplaceSector, setMarketplaceSector, resetCamera } = useSceneData();

  const loadWorkers = (name, lat, lng) => {
    const qs = `service=${encodeURIComponent(name)}` + (lat != null && lng != null ? `&lat=${lat}&lng=${lng}` : "");
    api.get(`/workers?${qs}`).then((r) => setWorkers(r.data)).catch(() => {});
  };

  useEffect(() => {
    api.get("/services")
      .then((r) => {
        const s = r.data.find((x) => x.id === Number(serviceId)) || null;
        setService(s);
        if (s) {
          loadWorkers(s.name);
          const zone = mapNameToZone(s.name);
          setMarketplaceSector(zone);
        }
      })
      .catch(() => setService(null));

    return () => {
      setMarketplaceSector("all");
    };
  }, [serviceId, setMarketplaceSector]);

  useEffect(() => {
    setSceneData({ workers, services: service ? [service] : [] });
  }, [workers, service, setSceneData]);

  const gps = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        setForm((f) => ({ ...f, lat: p.coords.latitude, lng: p.coords.longitude }));
        if (service) loadWorkers(service.name, p.coords.latitude, p.coords.longitude);
      },
      () =>
        setErr("Location permission denied. Please allow location access, or enter your address manually."),
    );

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await api.post("/bookings", {
        service_id: Number(serviceId),
        worker_id: form.worker_id ? Number(form.worker_id) : null,
        scheduled_at: `${form.date}T${form.time}:00`,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
        notes: form.notes,
        is_emergency: form.is_emergency,
      });
      nav("/bookings");
    } catch (ex) {
      setErr(extractApiError(ex, "Booking failed"));
      setBusy(false);
    }
  };

  if (service === undefined) {
    return (
      <CustomerShell title={t("bookService")}>
        <Skeleton className="h-96 rounded-none border border-white/10 bg-black/40" />
      </CustomerShell>
    );
  }

  if (service === null) {
    return (
      <CustomerShell title={t("bookService")}>
        <div className="border border-rose-500/40 bg-rose-950/40 p-6 text-rose-300 font-mono">
          Service not found.{" "}
          <Link className="underline font-bold text-white hover:text-rose-200" to="/services">
            Back to services catalogue →
          </Link>
        </div>
      </CustomerShell>
    );
  }

  const est = service.base_price * (form.is_emergency ? 1.25 : 1);

  return (
    <CustomerShell title={`${t("bookService")} · ${tService(service.name)}`}>
      {/* Top 3D Control & Back Row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 font-mono">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 border border-white/15 bg-black/50 px-3.5 py-1.5 text-xs font-bold uppercase text-slate-300 transition-all hover:border-white hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {t("browseServices")}
        </Link>

        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/50 px-3.5 py-1.5 text-xs text-emerald-300 backdrop-blur-md">
          <Compass className="h-3.5 w-3.5 text-emerald-400 animate-spin-slow" />
          <span>3D SECTOR: <strong className="text-white uppercase">{marketplaceSector}</strong></span>
          <button
            type="button"
            onClick={resetCamera}
            className="ml-2 inline-flex items-center gap-1 border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase hover:border-white hover:text-white transition-colors"
            title="Reset 3D camera"
          >
            <RotateCcw className="h-3 w-3" /> RESET
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-5">
        {/* Main Parameters Panel */}
        <div className="space-y-6 lg:col-span-3">
          <div className="border border-white/15 bg-black/60 p-6 sm:p-7 backdrop-blur-2xl">
            <div className="mb-6 flex items-start gap-4 border-b border-white/10 pb-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-emerald-500/40 bg-emerald-950/40 text-emerald-400">
                <CategoryIcon name={service.name} className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  COOPERATIVE SERVICE CONTRACT
                </span>
                <h2 className="font-display text-2xl font-black uppercase text-white">
                  {tService(service.name)}
                </h2>
                {service.name_hi && (
                  <p className="font-mono text-xs text-slate-400">{service.name_hi}</p>
                )}
                <p className="mt-1 font-mono text-xs text-slate-400">
                  Base rate: <strong className="text-white">{fmtINR(service.base_price)}</strong> · Direct 90% artisan payout guaranteed
                </p>
              </div>
            </div>

            {err && (
              <div className="mb-5 border border-rose-500/40 bg-rose-950/60 p-3.5 font-mono text-xs text-rose-300">
                {err}
              </div>
            )}

            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 font-bold uppercase tracking-wider text-slate-300">
                    {tr("DISPATCH DATE")}
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={set("date")}
                    required
                    className="w-full border border-white/15 bg-black/50 px-3.5 py-2.5 text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-bold uppercase tracking-wider text-slate-300">
                    {tr("PREFERRED TIME")}
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={set("time")}
                    required
                    className="w-full border border-white/15 bg-black/50 px-3.5 py-2.5 text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-slate-300">
                  {tr("SERVICE LOCATION & ADDRESS")}
                </label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={set("address")}
                  minLength={5}
                  maxLength={500}
                  required
                  placeholder={t("address")}
                  className="w-full border border-white/15 bg-black/50 px-3.5 py-2.5 text-white placeholder:text-slate-600 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="flex items-center gap-2.5 border border-white/15 bg-black/40 px-3.5 py-2 text-slate-300">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {form.lat == null
                    ? "Coordinates not calibrated (Tap GPS to calculate proximity)"
                    : `GPS: ${Number(form.lat).toFixed(4)}, ${Number(form.lng).toFixed(4)}`}
                </span>
                <button
                  type="button"
                  onClick={gps}
                  className="ml-auto shrink-0 border border-emerald-500/40 bg-emerald-950/60 px-3 py-1 text-[11px] font-bold uppercase text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900 transition-colors"
                >
                  GPS MATCH
                </button>
              </div>

              <div>
                <label className="block mb-1.5 font-bold uppercase tracking-wider text-slate-300">
                  {tr("INSTRUCTIONS / WORK NOTES (OPTIONAL)")}
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  maxLength={1000}
                  onChange={set("notes")}
                  placeholder={t("notes")}
                  className="w-full border border-white/15 bg-black/50 px-3.5 py-2.5 text-white placeholder:text-slate-600 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3.5 border p-3.5 transition-all",
                  form.is_emergency
                    ? "border-amber-400 bg-amber-950/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "border-white/15 bg-black/40 text-slate-400 hover:border-amber-400/40",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-amber-500"
                  checked={form.is_emergency}
                  onChange={(e) => setForm((f) => ({ ...f, is_emergency: e.target.checked }))}
                />
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-amber-300">
                    <Siren className="h-4 w-4 text-amber-400" /> {tr("PRIORITY EMERGENCY DISPATCH (+25%)")}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Artisan Allocation & Fare Summary */}
        <div className="space-y-6 lg:col-span-2 font-mono">
          {/* Artisan Selection */}
          <div className="border border-white/15 bg-black/60 p-5 sm:p-6 backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <Users className="h-4 w-4 text-emerald-400" />
                {tr("ARTISAN SELECTION")}
              </p>
              <span className="border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                {workers.length} {workers.length === 1 ? tr("ARTISAN") : tr("ARTISANS")}
              </span>
            </div>

            {/* Auto Assign Option */}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, worker_id: "" }))}
              className={cn(
                "mb-3 flex w-full items-start gap-3 border p-3.5 text-left transition-all",
                form.worker_id === ""
                  ? "border-emerald-400 bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-white"
                  : "border-white/15 bg-black/40 text-slate-400 hover:border-white/30 hover:text-slate-200",
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-emerald-400/50 bg-emerald-900/60 text-emerald-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-white">{tr("AUTO-ASSIGN PROTOCOL")}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-400">
                  Optimal allocation via GPS proximity, verified trade ratings & real-time availability.
                </p>
              </div>
            </button>

            {/* List of Specific Verified Workers */}
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1 thin-scrollbar">
              {workers.length === 0 && (
                <div className="border border-white/10 bg-black/30 p-3 text-center text-xs text-slate-500">
                  No verified artisans listed for this trade currently. Auto-assign will dispatch upon call.
                </div>
              )}
              {workers.map((w) => {
                const on = String(form.worker_id) === String(w.user_id);
                const initials = (w.name || "W")
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <button
                    type="button"
                    key={w.user_id}
                    onClick={() => setForm((f) => ({ ...f, worker_id: w.user_id }))}
                    className={cn(
                      "flex w-full items-center gap-3 border p-2.5 text-left transition-all",
                      on
                        ? "border-emerald-400 bg-emerald-950/60 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "border-white/15 bg-black/40 text-slate-400 hover:border-white/30 hover:text-white",
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/20 bg-stoneblack text-xs font-black text-white">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-xs font-bold text-white uppercase">
                        {w.name}
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      </p>
                      <p className="truncate text-[10px] text-slate-400">
                        {w.distance_km != null ? `${w.distance_km} km · ` : ""}
                        {fmtINR(w.hourly_rate)} ·{" "}
                        <span className={w.availability === "available" ? "text-emerald-400" : "text-amber-400"}>
                          {w.availability?.toUpperCase()}
                        </span>
                      </p>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {w.avg_rating || "5.0"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cost Estimate & Confirmation */}
          <div className="border border-white/15 bg-black/60 p-5 sm:p-6 backdrop-blur-2xl">
            <div className="mb-4 space-y-2 border-b border-white/10 pb-4 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>BASE COOPERATIVE FARE</span>
                <span className="text-white">{fmtINR(service.base_price)}</span>
              </div>
              {form.is_emergency && (
                <div className="flex items-center justify-between text-amber-400">
                  <span>EMERGENCY DISPATCH (+25%)</span>
                  <span>+{fmtINR(service.base_price * 0.25)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 text-sm font-bold text-white">
                <span>{t("total")}</span>
                <span className="font-display text-xl text-emerald-400">{fmtINR(est)}</span>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{tr("90% direct remittance")}</span>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full border border-emerald-400 bg-emerald-500 py-3 text-center text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> ...
                </span>
              ) : (
                tr("DISPATCH SERVICE NOW →")
              )}
            </button>
          </div>
        </div>
      </form>
    </CustomerShell>
  );
}
