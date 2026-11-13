import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ClipboardList,
  Compass,
  IndianRupee,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useLang } from "../i18n";
import CustomerShell from "../components/CustomerShell";
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
  Skeleton,
} from "../components/ui";
import { fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

export function StatCard({ icon: Icon, label, value, tone = "emerald", subtitle }) {
  const toneClasses = {
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-950/40",
    amber: "text-amber-400 border-amber-500/30 bg-amber-950/40",
    teal: "text-cyan-400 border-cyan-500/30 bg-cyan-950/40",
    gold: "text-emerald-300 border-emerald-500/30 bg-emerald-950/40",
  };

  return (
    <div className="border border-white/15 bg-black/60 p-5 backdrop-blur-2xl transition hover:border-white/40">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center border ${
            toneClasses[tone] || toneClasses.emerald
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 border border-white/10 px-2 py-0.5 bg-white/5">
          LIVE TELEMETRY
        </span>
      </div>

      <div className="mt-4">
        <p className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          {value}
        </p>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
          {label}
        </p>
        {subtitle && (
          <p className="mt-0.5 font-mono text-[10px] text-slate-400 uppercase">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CustomerOverview() {
  const { user } = useAuth();
  const { t, tr, tService } = useLang();
  const [bookings, setBookings] = useState(null);
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const { setSceneData, hoveredObject, resetCamera } = useSceneData();

  useEffect(() => {
    api.get("/bookings/mine").then((r) => setBookings(r.data)).catch(() => setBookings([]));
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
    api.get("/workers").then((r) => setWorkers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setSceneData({ bookings: bookings || [], services });
  }, [bookings, services, setSceneData]);

  const list = bookings || [];
  const active = list.filter((b) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(b.status)).length;
  const done = list.filter((b) => b.status === "COMPLETED").length;
  const spent = list.filter((b) => b.paid).reduce((n, b) => n + (b.final_cost || b.estimated_cost || 0), 0);

  // Group into time intervals for spend breakdown
  const chartData = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return [
        { label: "WK 1", spend: 0, services: 0 },
        { label: "WK 2", spend: 0, services: 0 },
        { label: "WK 3", spend: 0, services: 0 },
        { label: "WK 4", spend: 0, services: 0 },
      ];
    }
    const sorted = [...bookings].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    const step = Math.max(1, Math.ceil(sorted.length / 4));
    const buckets = [];
    for (let i = 0; i < 4; i++) {
      const slice = sorted.slice(i * step, (i + 1) * step);
      const subSpend = slice.reduce((acc, b) => acc + (b.final_cost || b.estimated_cost || 0), 0);
      buckets.push({
        label: `INT ${i + 1}`,
        spend: subSpend,
        services: slice.length,
      });
    }
    return buckets;
  }, [bookings]);

  const nextBooking = useMemo(() => {
    if (!bookings) return null;
    return list
      .filter((b) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(b.status))
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];
  }, [bookings, list]);

  const workerCountFor = (serviceName) =>
    workers.filter((w) =>
      (w.skills || []).map((x) => x.toLowerCase()).includes(serviceName.toLowerCase())
    ).length;

  return (
    <CustomerShell title={t("overview")}>
      {/* 3D Scene Interactive Controls & Status HUD */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-1.5 font-mono text-[11px] text-emerald-300 backdrop-blur-md">
          <Compass className="h-4 w-4 text-emerald-400 animate-spin" />
          <span>
            3D CUSTOMER COMMAND DECK ACTIVE · <span className="text-slate-400">ORBIT DRAG READY</span>
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
          <span>COOPERATIVE DISPATCH READY</span>
        </div>
      </div>

      {/* Customer Profile Banner */}
      <div className="mb-8 border border-white/15 bg-black/60 p-6 backdrop-blur-2xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                name={user?.full_name}
                className="h-14 w-14 border border-emerald-400 text-lg"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-black font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                  {tr("Welcome,")} {user?.full_name}
                </h2>
                <span className="font-mono text-[10px] uppercase border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-emerald-300 font-bold">
                  {tr("VERIFIED MEMBER")}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-slate-400">
                {user?.email} {user?.phone ? `· ${user.phone}` : ""} · SEVA ID #{user?.id || 104}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/services" className="btn-tech-outline group text-xs py-2 px-3">
              <Zap className="h-3.5 w-3.5 mr-1 text-emerald-400" />
              <span>{t("browseServices")}</span>
            </Link>
            <Link
              to="/bookings"
              className="border border-white/20 bg-stoneblack px-3 py-2 font-mono text-xs uppercase tracking-wider text-slate-300 hover:text-white hover:border-white transition"
            >
              {t("myBookings")}
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Technical KPI Cards */}
      {bookings === null ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 border border-white/10 bg-black/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={ClipboardList}
            label={tr("Total Bookings")}
            value={list.length}
            tone="emerald"
          />
          <StatCard
            icon={CalendarCheck}
            label={tr("Active Pipeline")}
            value={active}
            tone="amber"
          />
          <StatCard
            icon={CheckCircle2}
            label={tr("Completed Jobs")}
            value={done}
            tone="teal"
          />
          <StatCard
            icon={IndianRupee}
            label={tr("Total Remittance")}
            value={fmtINR(spent)}
            tone="gold"
          />
        </div>
      )}

      {/* Main Grid: Recharts Spend Trend & Synchronized Next Booking */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Activity & Expenditure Chart */}
        <div className="lg:col-span-3 border border-white/15 bg-black/60 p-6 backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-white">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Customer Remittance & Volume Trend</span>
              </div>
              <p className="font-mono text-[10px] text-slate-400 uppercase mt-0.5">
                Expenditure breakdown across your dispatched bookings
              </p>
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30 px-2 py-1 bg-emerald-950/40">
              {fmtINR(spent)} TOTAL VOLUME
            </span>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={10} fontStyle="monospace" />
                <YAxis stroke="#64748b" fontSize={10} fontStyle="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d0e12",
                    borderColor: "rgba(16,185,129,0.3)",
                    color: "#f8fafc",
                    fontFamily: "monospace",
                    fontSize: "11px",
                  }}
                  formatter={(v) => [fmtINR(v), "Remittance"]}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center font-mono">
            <div>
              <p className="text-[10px] uppercase text-slate-400">Total Bookings</p>
              <p className="text-sm font-bold text-white">{list.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">In Progress</p>
              <p className="text-sm font-bold text-emerald-400">{active}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">Fulfilled</p>
              <p className="text-sm font-bold text-emerald-300">{done}</p>
            </div>
          </div>
        </div>

        {/* Next Scheduled Appointment HUD */}
        <div className="lg:col-span-2 border border-white/15 bg-black/60 p-6 backdrop-blur-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-white">
                <Calendar className="h-4 w-4 text-amber-400" />
                <span>{tr("Next Scheduled Dispatch")}</span>
              </div>
              <span className="font-mono text-[9px] text-amber-400 border border-amber-500/30 px-1.5 py-0.5">
                DISPATCH QUEUE
              </span>
            </div>

            {nextBooking ? (
              <div className="mt-4 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">
                    {nextBooking.service_name || nextBooking.service?.name}
                  </span>
                  <StatusBadge status={nextBooking.status} />
                </div>
                <div className="border border-white/10 bg-white/5 p-3 space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">SCHEDULED AT:</span>
                    <span className="text-white font-bold">
                      {new Date(nextBooking.scheduled_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                  <p className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">BOOKING CODE:</span>
                    <span className="text-emerald-400 font-bold">{nextBooking.code}</span>
                  </p>
                  <p className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">DESTINATION:</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{nextBooking.address}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-6 font-mono">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-bold text-white uppercase">{tr("No Active Bookings")}</p>
              </div>
            )}
          </div>

          <Link
            to="/services"
            className="btn-tech-outline w-full text-center justify-center font-bold mt-6 py-2.5"
          >
            {tr("DISPATCH SERVICE NOW →")}
          </Link>
        </div>
      </div>

      {/* Available Cooperative Categories with Live Worker Count */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            Available Service Clusters · Verified Artisan Nodes
          </div>
          <Link to="/services" className="font-mono text-xs text-emerald-400 hover:text-white transition">
            VIEW ALL 10 →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {services.slice(0, 5).map((s) => {
            const count = workerCountFor(s.name);
            return (
              <Link
                key={s.id}
                to={`/book/${s.id}`}
                className="group border border-white/10 bg-black/40 p-4 transition hover:border-white hover:bg-stoneblack-surface"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-white/15 bg-stoneblack text-white group-hover:border-emerald-400 transition">
                    <CategoryIcon name={s.name} className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-[9px] text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 bg-emerald-950/40 font-bold">
                    {count} {count === 1 ? tr("ARTISAN") : tr("ARTISANS")}
                  </span>
                </div>
                <h4 className="font-display text-xs font-black uppercase text-white group-hover:text-emerald-300 transition">
                  {tService(s.name)}
                </h4>
                <p className="font-mono text-[10px] text-slate-400 mt-1 uppercase">
                  {tr("FROM")} ₹{s.base_price}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </CustomerShell>
  );
}
