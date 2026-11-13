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
  Compass,
  FileCheck2,
  Hourglass,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  Plus,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { useLang } from "../i18n";
import DashboardShell from "../components/DashboardShell";
import CategoryIcon from "../components/CategoryIcon";
import StatusBadge from "../components/StatusBadge";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Input,
  Skeleton,
  useToast,
} from "../components/ui";
import { StatCard } from "./CustomerOverview";
import { fmtINR, extractApiError } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

export default function AdminDashboard() {
  const { t } = useLang();
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [workers, setWorkers] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [services, setServices] = useState([]);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [svc, setSvc] = useState({ name: "", name_hi: "", icon: "🛠️", base_price: 300 });
  const { setSceneData, hoveredObject, resetCamera } = useSceneData();

  const load = () => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/ai/forecast").then((r) => setForecast(r.data.forecast)).catch(() => setForecast([]));
    api.get("/admin/workers").then((r) => setWorkers(r.data)).catch(() => setWorkers([]));
    api.get("/admin/bookings").then((r) => setBookings(r.data)).catch(() => setBookings([]));
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
  };

  useEffect(load, []);

  useEffect(() => {
    setSceneData({ stats, forecast, workers: workers || [], bookings: bookings || [], services });
  }, [stats, forecast, workers, bookings, services, setSceneData]);

  const verify = async (p, status) => {
    try {
      await api.post(`/admin/workers/${p.profile_id}/verify`, { status });
      toast(status === "verified" ? `${p.name} verified & granted active clearance` : `${p.name} rejected`);
      load();
    } catch (ex) {
      toast(extractApiError(ex, "Action failed"), "error");
    }
  };

  const addService = async (e) => {
    e.preventDefault();
    try {
      await api.post("/services", svc);
      toast("Service added to cooperative catalogue");
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
    overview: "Federation Command Deck",
    workers: "Artisan Verification Matrix",
    bookings: "Cooperative Dispatch Ledger",
    services: "Trade Catalogue Control",
  }[tab];

  return (
    <DashboardShell navItems={nav} active={tab} onNavigate={setTab} title={titleOf}>
      {/* 3D Federation Telemetry Status Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 border border-amber-500/30 bg-amber-950/30 px-3.5 py-1.5 font-mono text-[11px] text-amber-300 backdrop-blur-md">
          <Compass className="h-4 w-4 text-amber-400 animate-spin" />
          <span>
            FEDERATION 3D OPERATIONS HUB · <span className="text-slate-400">SIH26089 GOVERNANCE ACTIVE</span>
          </span>
          <button
            type="button"
            onClick={resetCamera}
            className="ml-3 inline-flex items-center gap-1 border border-white/20 bg-stoneblack px-2 py-0.5 text-[10px] uppercase font-bold text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="h-3 w-3" /> RESET
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 uppercase">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>MINISTRY OF COOPERATION NODE · LIVE</span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* 5 Technical KPI Panels */}
          {stats ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard
                icon={ShieldCheck}
                label="Artisans Verified"
                value={stats.workers_verified}
                tone="emerald"
                subtitle="Active on platform"
              />
              <StatCard
                icon={Hourglass}
                label="Pending Audit"
                value={stats.workers_pending}
                tone="amber"
                subtitle="Credential queue"
              />
              <StatCard
                icon={ClipboardList}
                label="Active Dispatches"
                value={stats.bookings_active}
                tone="teal"
                subtitle="Live pipeline"
              />
              <StatCard
                icon={CheckCircle2}
                label="Completed Orders"
                value={stats.bookings_completed}
                tone="emerald"
                subtitle="Directly settled"
              />
              <StatCard
                icon={IndianRupee}
                label="Coop Gross Volume"
                value={fmtINR(stats.revenue)}
                tone="gold"
                subtitle="100% auditable"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 border border-white/10 bg-black/30 animate-pulse" />
              ))}
            </div>
          )}

          {/* AI Workload Forecasting & Verification Queue */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recharts Demand Forecasting */}
            <div className="border border-white/15 bg-black/60 p-6 backdrop-blur-2xl">
              <div className="pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-white">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span>AI 7-Day Demand Forecasting</span>
                </div>
                <p className="font-mono text-[10px] text-slate-400 uppercase mt-0.5">
                  Predictive gig labor allocation & capacity deficit
                </p>
              </div>

              {forecast === null ? (
                <div className="h-60 border border-white/10 bg-black/30 animate-pulse" />
              ) : (
                <>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={forecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis
                          dataKey="service"
                          tick={{ fill: "#64748b", fontSize: 9 }}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={45}
                        />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0d0e12",
                            borderColor: "rgba(16,185,129,0.3)",
                            color: "#f8fafc",
                            fontFamily: "monospace",
                            fontSize: "11px",
                          }}
                        />
                        <Bar dataKey="weekly_total" fill="#10b981" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>

            {/* Pending Verification Clearance Queue */}
            <div className="border border-white/15 bg-black/60 p-6 backdrop-blur-2xl">
              <div className="pb-3 border-b border-white/10 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-white">
                  <UserCheck className="h-4 w-4 text-amber-400" />
                  <span>Pending Artisan Clearance</span>
                </div>
                <span className="font-mono text-[10px] text-amber-400 border border-amber-500/30 px-2 py-0.5 bg-amber-950/40">
                  {pending.length} QUEUED
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs max-h-72 overflow-y-auto thin-scrollbar">
                {pending.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs uppercase font-bold text-white">Queue is clear</p>
                    <p className="text-[10px] uppercase mt-1">All registered artisans are audited and verified.</p>
                  </div>
                ) : (
                  pending.map((w) => (
                    <div
                      key={w.profile_id}
                      className="border border-white/15 bg-black/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-white uppercase text-xs">{w.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {w.phone} · {w.experience_years} YRS EXP · ID: {w.id_proof_no || "VERIFIED-ID"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(w.skills || []).map((sk) => (
                            <span
                              key={sk}
                              className="border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-slate-300 uppercase"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => verify(w, "verified")}
                          className="btn-tech-outline text-[10px] py-1 px-2.5"
                        >
                          APPROVE
                        </button>
                        <button
                          type="button"
                          onClick={() => verify(w, "rejected")}
                          className="border border-white/20 bg-stoneblack text-slate-400 hover:text-white px-2 py-1 text-[10px] uppercase"
                        >
                          REJECT
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

      {/* TAB 2: ARTISANS DIRECTORY */}
      {tab === "workers" && (
        <div className="border border-white/15 bg-black/60 p-6 backdrop-blur-2xl">
          <div className="pb-3 border-b border-white/10 mb-4 flex items-center justify-between font-mono">
            <h3 className="text-xs font-bold uppercase text-white">
              Federation Registered Artisans ({(workers || []).length})
            </h3>
            <span className="text-[10px] text-emerald-400">90% DIRECT REMITTANCE ACTIVE</span>
          </div>

          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5">Artisan</th>
                  <th>Contact</th>
                  <th>Skills</th>
                  <th>Rate</th>
                  <th>Rating</th>
                  <th className="text-right">Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(workers || []).map((w) => (
                  <tr key={w.profile_id} className="hover:bg-white/5">
                    <td className="py-3 font-bold text-white uppercase">{w.name}</td>
                    <td className="text-slate-400">{w.phone}</td>
                    <td className="text-slate-300">{(w.skills || []).join(", ")}</td>
                    <td className="text-emerald-400">₹{w.hourly_rate}</td>
                    <td className="text-amber-400">{w.avg_rating || "4.9"}★</td>
                    <td className="text-right">
                      <StatusBadge status={w.verification_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCH LEDGER */}
      {tab === "bookings" && (
        <div className="border border-white/15 bg-black/60 p-6 backdrop-blur-2xl">
          <div className="pb-3 border-b border-white/10 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono">
            <h3 className="text-xs font-bold uppercase text-white">
              Platform Booking Ledger ({(bookings || []).length})
            </h3>
            <div className="flex gap-1.5 text-[10px]">
              {["all", "active", "completed", "cancelled"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setBookingFilter(f)}
                  className={`border px-2.5 py-1 uppercase ${
                    bookingFilter === f
                      ? "border-emerald-400 bg-emerald-950/60 text-emerald-300 font-bold"
                      : "border-white/15 text-slate-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-slate-400 uppercase">
                  <th className="py-2.5">Code</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Amount</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 uppercase">
                      No matching bookings in ledger
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5">
                      <td className="py-3 font-bold text-emerald-400">#{b.code}</td>
                      <td className="text-white uppercase">{b.service_name || b.service?.name}</td>
                      <td className="text-slate-300">{b.customer_name || `Customer #${b.customer_id}`}</td>
                      <td className="text-slate-400 truncate max-w-[200px]">{b.address}</td>
                      <td className="text-white font-bold">{fmtINR(b.final_cost || b.estimated_cost)}</td>
                      <td className="text-right">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE CATALOGUE MANAGER */}
      {tab === "services" && (
        <div className="grid gap-6 lg:grid-cols-12 font-mono">
          <div className="lg:col-span-7 border border-white/15 bg-black/60 p-6 backdrop-blur-2xl">
            <h3 className="text-xs font-bold uppercase text-white mb-3">
              Active Trade Clusters ({services.length})
            </h3>
            <div className="space-y-2">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="border border-white/10 bg-black/40 p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center border border-white/15 text-white">
                      <CategoryIcon name={s.name} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white uppercase">{s.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{s.description}</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400">FROM ₹{s.base_price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 border border-white/15 bg-black/60 p-6 backdrop-blur-2xl text-xs">
            <h3 className="text-xs font-bold uppercase text-white mb-3">
              Add Cooperative Service
            </h3>
            <form onSubmit={addService} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-300 uppercase">Service Name</label>
                <input
                  value={svc.name}
                  onChange={(e) => setSvc({ ...svc, name: e.target.value })}
                  placeholder="e.g. Solar Panel Technician"
                  maxLength={100}
                  required
                  className="w-full border border-white/15 bg-black/80 px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-300 uppercase">Hindi Title</label>
                <input
                  value={svc.name_hi}
                  onChange={(e) => setSvc({ ...svc, name_hi: e.target.value })}
                  placeholder="e.g. सोलर पैनल"
                  maxLength={100}
                  className="w-full border border-white/15 bg-black/80 px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-300 uppercase">Baseline Rate (₹)</label>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={svc.base_price}
                  onChange={(e) => setSvc({ ...svc, base_price: Number(e.target.value) })}
                  className="w-full border border-white/15 bg-black/80 px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="btn-tech-outline w-full py-2.5 text-center justify-center font-bold mt-2"
              >
                [ REGISTER NEW SERVICE ]
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
