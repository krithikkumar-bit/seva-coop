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
import { cn, extractApiError, FALLBACK_SERVICES, fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

const TIME_SLOTS = [
  { label: "09:00 AM", val: "09:00" },
  { label: "10:30 AM", val: "10:30" },
  { label: "12:00 PM", val: "12:00" },
  { label: "02:30 PM", val: "14:30" },
  { label: "04:30 PM", val: "16:30" },
  { label: "06:00 PM", val: "18:00" },
];

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
    time: "10:30",
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
        const list = Array.isArray(r.data) && r.data.length > 0 ? r.data : FALLBACK_SERVICES;
        const s = list.find((x) => x.id === Number(serviceId)) || null;
        setService(s);
        if (s) loadWorkers(s.name);
      })
      .catch(() => {
        const s = FALLBACK_SERVICES.find((x) => x.id === Number(serviceId)) || null;
        setService(s);
      });
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
        setErr("Location permission was denied. Please enter your address below."),
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
          <Link className="underline font-bold" to="/services">
            Back to services directory →
          </Link>
        </div>
      </CustomerShell>
    );
  }

  const est = service.base_price * (form.is_emergency ? 1.25 : 1);

  return (
    <CustomerShell title={`${t("bookService")} · ${tService(service.name)}`}>
      <div className="mb-5">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> {t("browseServices")}
        </Link>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-5 items-start">
        {/* Left: UC Checkout Details */}
        <div className="lg:col-span-3 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-card">
          <div className="mb-6 flex items-start gap-4 border-b border-neutral-100 pb-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900">
              <CategoryIcon name={service.name} className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-extrabold text-neutral-900">
                {tService(service.name)}
              </h2>
              {service.name_hi && <p className="text-xs text-neutral-400">{service.name_hi}</p>}
              <p className="mt-1 text-xs text-neutral-500">
                Base visit fare: <strong className="text-neutral-900">{fmtINR(service.base_price)}</strong> · 90% goes directly to the artisan
              </p>
            </div>
          </div>

          {err && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
              {err}
            </div>
          )}

          <div className="space-y-6">
            {/* Step 1: Date & Quick Slot Picker */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                1. Select Date & Time Slot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={set("date")}
                  required
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                />
                <input
                  type="time"
                  value={form.time}
                  onChange={set("time")}
                  required
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.val}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, time: slot.val }))}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                      form.time === slot.val
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Address */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                2. Service Address
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={set("address")}
                minLength={5}
                maxLength={500}
                required
                placeholder="House / Flat No., Building, Street, Landmark, City"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400"
              />
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs text-neutral-600">
                <MapPin className="h-4 w-4 text-neutral-700 shrink-0" />
                <span className="flex-1 truncate">
                  {form.lat == null
                    ? "Optional: Detect GPS coordinates for nearest match"
                    : `Location pinned: ${Number(form.lat).toFixed(4)}, ${Number(form.lng).toFixed(4)}`}
                </span>
                <button
                  type="button"
                  onClick={gps}
                  className="shrink-0 rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-900 hover:bg-neutral-100 transition"
                >
                  Use GPS
                </button>
              </div>
            </div>

            {/* Step 3: Notes & Emergency */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                3. Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                maxLength={1000}
                onChange={set("notes")}
                placeholder="Describe what needs to be checked or repaired..."
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400"
              />

              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-all",
                  form.is_emergency
                    ? "border-amber-400 bg-amber-50 text-amber-950"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300",
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-neutral-900 rounded"
                  checked={form.is_emergency}
                  onChange={(e) => setForm((f) => ({ ...f, is_emergency: e.target.checked }))}
                />
                <div className="flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-neutral-900">
                    <Siren className="h-4 w-4 text-amber-600" /> {tr("Priority Urgent Visit (+25%)")}
                  </span>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Prioritizes fastest available artisan dispatch.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Artisan & Summary */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Users className="h-4 w-4 text-neutral-700" />
                {tr("Choose Professional")}
              </p>
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700">
                {workers.length} available
              </span>
            </div>

            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, worker_id: "" }))}
              className={cn(
                "mb-3 flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
                form.worker_id === ""
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-neutral-300",
              )}
            >
              <Sparkles className={cn("h-5 w-5 shrink-0 mt-0.5", form.worker_id === "" ? "text-emerald-400" : "text-neutral-700")} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold">{tr("Auto-Assign Best Match")}</p>
                <p className={cn("mt-0.5 text-[11px]", form.worker_id === "" ? "text-neutral-300" : "text-neutral-500")}>
                  Recommended: Picks highest-rated nearby artisan automatically.
                </p>
              </div>
            </button>

            <div className="max-h-60 space-y-2 overflow-y-auto pr-1 thin-scrollbar">
              {workers.map((w) => {
                const on = String(form.worker_id) === String(w.user_id);
                const initials = (w.name || "W").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <button
                    type="button"
                    key={w.user_id}
                    onClick={() => setForm((f) => ({ ...f, worker_id: w.user_id }))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                      on
                        ? "border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10"
                        : "border-neutral-200 bg-white hover:border-neutral-300",
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-xs font-bold text-neutral-900">
                        {w.name}
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      </p>
                      <p className="truncate text-[11px] text-neutral-500">
                        {w.distance_km != null ? `${w.distance_km} km · ` : ""}
                        {fmtINR(w.hourly_rate)} · {w.availability}
                      </p>
                    </div>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-neutral-800">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      {w.avg_rating || "5.0"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-card">
            <h3 className="text-sm font-bold text-neutral-900 mb-3">Payment Summary</h3>
            <div className="mb-4 space-y-2 border-b border-neutral-100 pb-4 text-sm">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Base Visit Fare</span>
                <span className="font-semibold text-neutral-900">{fmtINR(service.base_price)}</span>
              </div>
              {form.is_emergency && (
                <div className="flex items-center justify-between text-amber-700">
                  <span>Urgent Dispatch (+25%)</span>
                  <span className="font-semibold">+{fmtINR(service.base_price * 0.25)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 text-base font-bold text-neutral-900">
                <span>{t("total")}</span>
                <span className="font-display text-2xl font-extrabold text-neutral-900">{fmtINR(est)}</span>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>90% goes straight to the verified worker</span>
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
                  {tr("Confirm & Book Service")} <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </CustomerShell>
  );
}
