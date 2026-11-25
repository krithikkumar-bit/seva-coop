import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Loader2,
  MapPin,
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
import { Skeleton } from "../components/ui";
import { cn, extractApiError, fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

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
  const { setSceneData } = useSceneData();

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
        }
      })
      .catch(() => setService(null));
  }, [serviceId]);

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
        setErr("Location permission was denied. You can still enter your address manually below."),
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
        <Skeleton className="h-96 rounded-2xl" />
      </CustomerShell>
    );
  }

  if (service === null) {
    return (
      <CustomerShell title={t("bookService")}>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          Service not found.{" "}
          <Link className="underline font-bold text-rose-900" to="/services">
            Back to services directory →
          </Link>
        </div>
      </CustomerShell>
    );
  }

  const est = service.base_price * (form.is_emergency ? 1.25 : 1);

  return (
    <CustomerShell title={`${t("bookService")} · ${tService(service.name)}`}>
      <div className="mb-5 flex items-center justify-between">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> {t("browseServices")}
        </Link>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-5 items-start">
        {/* Left: Booking Details Form */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-card">
          <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CategoryIcon name={service.name} className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                {tr("Verified Cooperative Service")}
              </span>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
                {tService(service.name)}
              </h2>
              {service.name_hi && (
                <p className="text-xs font-medium text-slate-400">{service.name_hi}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Base visit fee: <strong className="text-slate-900">{fmtINR(service.base_price)}</strong> · 90% goes directly to the artisan
              </p>
            </div>
          </div>

          {err && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
              {err}
            </div>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  {tr("Preferred Date")}
                </label>
                <input
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={set("date")}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                  {tr("Preferred Time")}
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={set("time")}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                {tr("Service Address")}
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={set("address")}
                minLength={5}
                maxLength={500}
                required
                placeholder="House / Flat No., Building, Street, Landmark, City"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="flex-1 truncate">
                {form.lat == null
                  ? "Optional: Share GPS location to find the nearest artisan"
                  : `Location pinned: ${Number(form.lat).toFixed(4)}, ${Number(form.lng).toFixed(4)}`}
              </span>
              <button
                type="button"
                onClick={gps}
                className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
              >
                Use Current GPS
              </button>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-700">
                {tr("Work Notes or Instructions (Optional)")}
              </label>
              <textarea
                rows={2}
                value={form.notes}
                maxLength={1000}
                onChange={set("notes")}
                placeholder="Describe the issue briefly (e.g. kitchen sink leak, ceiling fan installation)"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <label
              className={cn(
                "flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-all",
                form.is_emergency
                  ? "border-amber-400 bg-amber-50 text-amber-950"
                  : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-amber-300",
              )}
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-amber-600 rounded"
                checked={form.is_emergency}
                onChange={(e) => setForm((f) => ({ ...f, is_emergency: e.target.checked }))}
              />
              <div className="flex-1">
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <Siren className="h-4 w-4 text-amber-600" /> {tr("Priority Emergency Visit (+25%)")}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prioritizes fastest available artisan dispatch for urgent repairs.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Right: Artisan Selection & Summary */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Users className="h-4 w-4 text-emerald-600" />
                {tr("Choose an Artisan")}
              </p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {workers.length} {workers.length === 1 ? "available" : "available"}
              </span>
            </div>

            {/* Auto Assign Option */}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, worker_id: "" }))}
              className={cn(
                "mb-3 flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
                form.worker_id === ""
                  ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-slate-50/50 hover:border-slate-300",
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">{tr("Smart Auto-Match (Recommended)")}</p>
                </div>
                <p className="mt-0.5 text-xs leading-snug text-slate-500">
                  Automatically picks the highest-rated nearby available artisan.
                </p>
              </div>
            </button>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1 thin-scrollbar">
              {workers.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                  No specific artisans listed right now — Smart Auto-Match will assign one on confirmation.
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
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                      on
                        ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-xs font-bold text-slate-900">
                        {w.name}
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {w.distance_km != null ? `${w.distance_km} km · ` : ""}
                        {fmtINR(w.hourly_rate)} ·{" "}
                        <span className={w.availability === "available" ? "text-emerald-600 font-semibold" : "text-amber-600"}>
                          {w.availability}
                        </span>
                      </p>
                    </div>

                    <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      {w.avg_rating || "5.0"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 mb-3">{tr("Estimated Fare Summary")}</h3>
            <div className="mb-4 space-y-2 border-b border-slate-100 pb-4 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Base Visit Fare</span>
                <span className="font-semibold text-slate-900">{fmtINR(service.base_price)}</span>
              </div>
              {form.is_emergency && (
                <div className="flex items-center justify-between text-amber-700">
                  <span>Priority Emergency (+25%)</span>
                  <span className="font-semibold">+{fmtINR(service.base_price * 0.25)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 text-base font-bold text-slate-900">
                <span>{t("total")}</span>
                <span className="font-display text-2xl font-extrabold text-emerald-600">{fmtINR(est)}</span>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>90% goes directly to your verified artisan</span>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary-coop w-full py-3 justify-center text-sm"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Confirming...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {tr("Confirm Booking")} <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </CustomerShell>
  );
}
