import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  ClipboardList,
  Hourglass,
  IndianRupee,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import api from "../api";
import { useLang } from "../i18n";
import DashboardShell from "../components/DashboardShell";
import CategoryIcon from "../components/CategoryIcon";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/ui";
import { StatCard } from "./CustomerOverview";
import { fmtINR, extractApiError, FALLBACK_SERVICES } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

export default function AdminDashboard() {
  const { t, tr, tService, tServiceDesc } = useLang();
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [workers, setWorkers] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [svc, setSvc] = useState({ name: "", name_hi: "", icon: "🛠️", base_price: 300 });
  const { setSceneData } = useSceneData();

  const load = () => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/ai/forecast").then((r) => setForecast(r.data.forecast)).catch(() => setForecast([]));
    api.get("/admin/workers").then((r) => setWorkers(r.data)).catch(() => setWorkers([]));
    api.get("/admin/bookings").then((r) => setBookings(r.data)).catch(() => setBookings([]));
    api.get("/services").then((r) => setServices(Array.isArray(r.data) && r.data.length > 0 ? r.data : FALLBACK_SERVICES)).catch(() => {});
  };

  useEffect(load, []);

  useEffect(() => {
    setSceneData({ stats, forecast, workers: workers || [], bookings: bookings || [], services });
  }, [stats, forecast, workers, bookings, services, setSceneData]);

  const verify = async (p, status) => {
    try {
      await api.post(`/admin/workers/${p.profile_id}/verify`, { status });
      toast(status === "verified" ? `${p.name} verified!` : `${p.name} rejected`);
      load();
    } catch (ex) {
      toast(extractApiError(ex, "Action failed"), "error");
    }
  };

  const addService = async (e) => {
    e.preventDefault();
    try {
      await api.post("/services", svc);
      toast("Service added to catalogue!");
      setSvc({ name: "", name_hi: "", icon: "🛠️", base_price: 300 });
      load();
    } catch (ex) {
      toast(extractApiError(ex, "Could not add service"), "error");
    }
  };

  const pending = (workers || []).filter((w) => w.verification_status === "pending");

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (bookingFilter === "all") return bookings;
    if (bookingFilter === "active") return bookings.filter((b) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(b.status));
    if (bookingFilter === "completed") return bookings.filter((b) => b.status === "COMPLETED");
    if (bookingFilter === "cancelled") return bookings.filter((b) => ["CANCELLED", "REJECTED"].includes(b.status));
    return bookings;
  }, [bookings, bookingFilter]);

  const nav = [
    { key: "overview", label: t("overview"), icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "workers", label: t("workers"), icon: <Users className="h-4 w-4" /> },
    { key: "bookings", label: t("bookings"), icon: <ClipboardList className="h-4 w-4" /> },
    { key: "services", label: t("services"), icon: <Wrench className="h-4 w-4" /> },
  ];

  const titleOf = {
    overview: tr("Cooperative Overview"),
    workers: tr("Workers Directory"),
    bookings: tr("All Bookings"),
    services: tr("Manage Services"),
  }[tab];

  return (
    <DashboardShell navItems={nav} active={tab} onNavigate={setTab} title={titleOf}>
      {tab === "overview" && (
        <div className="space-y-6">
          {stats ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard icon={ShieldCheck} label={tr("Verified Artisans")} value={stats.workers_verified} tone="emerald" subtitle={tr("Active members")} />
              <StatCard icon={Hourglass} label={tr("Pending Verification")} value={stats.workers_pending} tone="amber" subtitle={tr("Awaiting review")} />
              <StatCard icon={ClipboardList} label={tr("Active Bookings")} value={stats.bookings_active} tone="teal" subtitle={tr("In progress")} />
              <StatCard icon={CheckCircle2} label={tr("Completed Jobs")} value={stats.bookings_completed} tone="emerald" subtitle={tr("Settled jobs")} />
              <StatCard icon={IndianRupee} label={tr("Total Volume")} value={fmtINR(stats.revenue)} tone="gold" subtitle={tr("90% to workers")} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl border border-neutral-200 bg-neutral-100 animate-pulse" />
              ))}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
              <div className="pb-3 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                  <TrendingUp className="h-4 w-4 text-neutral-700" />
                  <span>{tr("AI 7-Day Demand Forecast")}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {tr("Predicted weekly bookings by service category")}
                </p>
              </div>

              {forecast === null ? (
                <div className="h-56 rounded-xl border border-neutral-100 bg-neutral-50 animate-pulse" />
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="service" tick={{ fill: "#737373", fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={45} />
                      <YAxis tick={{ fill: "#737373", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderColor: "#e5e5e5",
                          borderRadius: "10px",
                          color: "#0f0f0f",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="weekly_total" fill="#0f0f0f" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
              <div className="pb-3 border-b border-neutral-100 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                  <UserCheck className="h-4 w-4 text-amber-600" />
                  <span>{tr("Pending Worker Approvals")}</span>
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                  {pending.length} {tr("pending")}
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto thin-scrollbar">
                {pending.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <CheckCircle2 className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-neutral-800">{tr("All caught up!")}</p>
                    <p className="text-xs mt-1">{tr("No pending verification requests.")}</p>
                  </div>
                ) : (
                  pending.map((w) => (
                    <div
                      key={w.profile_id}
                      className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 text-sm">{w.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {w.phone} · {w.experience_years} {tr("yrs exp")} · ID: {w.id_proof_no || tr("Pending")}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(w.skills || []).map((sk) => (
                            <span key={sk} className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-700">
                              {tService(sk)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => verify(w, "verified")} className="btn-primary-coop py-1.5 px-3 text-xs">
                          {tr("Approve")}
                        </button>
                        <button type="button" onClick={() => verify(w, "rejected")} className="btn-secondary-coop py-1.5 px-3 text-xs">
                          {tr("Reject")}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "workers" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="pb-3 border-b border-neutral-100 mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">
              {tr("Registered Cooperative Workers")} ({(workers || []).length})
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              {tr("90% Direct Payout Active")}
            </span>
          </div>

          <div className="overflow-x-auto text-xs sm:text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500">
                  <th className="py-3">{tr("Name")}</th>
                  <th>{tr("Phone")}</th>
                  <th>{tr("Skills")}</th>
                  <th>{tr("Visit Rate")}</th>
                  <th>{tr("Rating")}</th>
                  <th className="text-right">{tr("Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(workers || []).map((w) => (
                  <tr key={w.profile_id} className="hover:bg-neutral-50">
                    <td className="py-3 font-semibold text-neutral-900">{w.name}</td>
                    <td className="text-neutral-600">{w.phone}</td>
                    <td className="text-neutral-600">{(w.skills || []).map(tService).join(", ")}</td>
                    <td className="font-semibold text-neutral-900">₹{w.hourly_rate}</td>
                    <td className="font-semibold text-amber-600">{w.avg_rating || "4.9"}★</td>
                    <td className="text-right"><StatusBadge status={w.verification_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="pb-3 border-b border-neutral-100 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-sm font-bold text-neutral-900">
              {tr("All Platform Bookings")} ({(bookings || []).length})
            </h3>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {["all", "active", "completed", "cancelled"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setBookingFilter(f)}
                  className={`rounded-full px-3 py-1 font-semibold capitalize transition ${
                    bookingFilter === f
                      ? "bg-neutral-900 text-white"
                      : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {tr(f)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto text-xs sm:text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500">
                  <th className="py-3">{tr("Code")}</th>
                  <th>{tr("Service")}</th>
                  <th>{tr("Customer")}</th>
                  <th>{tr("Address")}</th>
                  <th>{tr("Amount")}</th>
                  <th className="text-right">{tr("Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-neutral-500">
                      {tr("No bookings found in this category")}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50">
                      <td className="py-3 font-mono font-bold text-neutral-900">#{b.code}</td>
                      <td className="font-semibold text-neutral-900">{tService(b.service_name || b.service?.name)}</td>
                      <td className="text-neutral-600">{b.customer_name || `${tr("Customer")} #${b.customer_id}`}</td>
                      <td className="text-neutral-500 truncate max-w-[200px]">{b.address}</td>
                      <td className="font-bold text-neutral-900">{fmtINR(b.final_cost || b.estimated_cost)}</td>
                      <td className="text-right"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "services" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">
              {tr("Active Services")} ({services.length})
            </h3>
            <div className="space-y-2.5">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-neutral-200 text-neutral-900">
                      <CategoryIcon name={s.name} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 text-sm">{tService(s.name)}</p>
                      <p className="text-xs text-neutral-500 truncate">{tServiceDesc(s.name, s.description)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 text-xs shrink-0">{tr("From")} ₹{s.base_price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">
              {tr("Add New Cooperative Service")}
            </h3>
            <form onSubmit={addService} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">{tr("Service Name")}</label>
                <input
                  value={svc.name}
                  onChange={(e) => setSvc({ ...svc, name: e.target.value })}
                  placeholder="e.g. Solar Panel Technician"
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">{tr("Hindi Name")}</label>
                <input
                  value={svc.name_hi}
                  onChange={(e) => setSvc({ ...svc, name_hi: e.target.value })}
                  placeholder="e.g. सोलर पैनल"
                  maxLength={100}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">{tr("Base Visit Rate (₹)")}</label>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={svc.base_price}
                  onChange={(e) => setSvc({ ...svc, base_price: Number(e.target.value) })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
                />
              </div>
              <button type="submit" className="btn-primary-coop w-full py-2.5 justify-center mt-2">
                {tr("Add Service to Directory")}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
