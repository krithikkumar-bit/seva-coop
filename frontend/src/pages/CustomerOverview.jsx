import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Plus,
  TrendingUp,
} from "lucide-react";
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
import { Avatar } from "../components/ui";
import { FALLBACK_SERVICES, fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

export function StatCard({ icon: Icon, label, value, tone = "emerald", subtitle }) {
  const toneClasses = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    teal: "text-neutral-900 bg-neutral-100 border-neutral-200",
    gold: "text-violet-700 bg-violet-50 border-violet-200",
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-300">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            toneClasses[tone] || toneClasses.teal
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <p className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          {value}
        </p>
        <p className="mt-1 text-xs font-semibold text-neutral-600">{label}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-neutral-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function CustomerOverview() {
  const { user } = useAuth();
  const { t, tr, tService } = useLang();
  const [bookings, setBookings] = useState(null);
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [workers, setWorkers] = useState([]);
  const { setSceneData } = useSceneData();

  useEffect(() => {
    api.get("/bookings/mine").then((r) => setBookings(r.data)).catch(() => setBookings([]));
    api.get("/services").then((r) => setServices(Array.isArray(r.data) && r.data.length > 0 ? r.data : FALLBACK_SERVICES)).catch(() => {});
    api.get("/workers").then((r) => setWorkers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setSceneData({ bookings: bookings || [], services });
  }, [bookings, services, setSceneData]);

  const list = bookings || [];
  const active = list.filter((b) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(b.status)).length;
  const done = list.filter((b) => b.status === "COMPLETED").length;
  const spent = list.filter((b) => b.paid).reduce((n, b) => n + (b.final_cost || b.estimated_cost || 0), 0);

  const chartData = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return [
        { label: "Week 1", spend: 0 },
        { label: "Week 2", spend: 0 },
        { label: "Week 3", spend: 0 },
        { label: "Week 4", spend: 0 },
      ];
    }
    const sorted = [...bookings].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    const step = Math.max(1, Math.ceil(sorted.length / 4));
    const buckets = [];
    for (let i = 0; i < 4; i++) {
      const slice = sorted.slice(i * step, (i + 1) * step);
      const subSpend = slice.reduce((acc, b) => acc + (b.final_cost || b.estimated_cost || 0), 0);
      buckets.push({
        label: `Period ${i + 1}`,
        spend: subSpend,
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
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user?.full_name} className="h-14 w-14 text-lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-extrabold text-neutral-900">
                  {tr("Welcome back,")} {user?.full_name}
                </h2>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {tr("Verified Member")}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {user?.email} {user?.phone ? `· ${user.phone}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/services" className="btn-primary-coop py-2.5 px-4 text-xs sm:text-sm">
              <Plus className="h-4 w-4" />
              <span>{t("bookService")}</span>
            </Link>
            <Link to="/bookings" className="btn-secondary-coop py-2.5 px-4 text-xs sm:text-sm">
              {t("myBookings")}
            </Link>
          </div>
        </div>
      </div>

      {bookings === null ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-neutral-200 bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={ClipboardList} label={tr("Total Bookings")} value={list.length} tone="teal" />
          <StatCard icon={CalendarCheck} label={tr("Active Requests")} value={active} tone="amber" />
          <StatCard icon={CheckCircle2} label={tr("Completed Jobs")} value={done} tone="emerald" />
          <StatCard icon={IndianRupee} label={tr("Total Spent")} value={fmtINR(spent)} tone="gold" />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <TrendingUp className="h-4 w-4 text-neutral-700" />
                <span>{tr("Your Service Spending")}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Payments across your booked services
              </p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-900 self-start sm:self-auto">
              {fmtINR(spent)} Total
            </span>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f0f0f" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0f0f0f" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="label" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e5e5e5",
                    borderRadius: "10px",
                    color: "#0f0f0f",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [fmtINR(v), "Amount"]}
                />
                <Area type="monotone" dataKey="spend" stroke="#0f0f0f" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Calendar className="h-4 w-4 text-neutral-700" />
                <span>{tr("Upcoming Booking")}</span>
              </div>
              {nextBooking && <StatusBadge status={nextBooking.status} />}
            </div>

            {nextBooking ? (
              <div className="mt-4 space-y-3">
                <p className="text-base font-bold text-neutral-900">
                  {nextBooking.service_name || nextBooking.service?.name}
                </p>
                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 space-y-2 text-xs text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Scheduled</span>
                    <span className="font-semibold text-neutral-900">
                      {new Date(nextBooking.scheduled_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Booking ID</span>
                    <span className="font-mono font-bold text-neutral-900">#{nextBooking.code}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-neutral-500">Address</span>
                    <span className="text-neutral-800 truncate max-w-[180px]">{nextBooking.address}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center py-4">
                <CheckCircle2 className="h-9 w-9 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-neutral-800">{tr("No upcoming bookings")}</p>
                <p className="text-xs text-neutral-500 mt-1">Need a verified professional at home?</p>
              </div>
            )}
          </div>

          <Link to="/services" className="btn-primary-coop w-full justify-center mt-6 py-2.5 text-sm">
            <span>{tr("Book a Service")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-neutral-900">
            {tr("Quick Book Services")}
          </h3>
          <Link to="/services" className="text-xs font-semibold text-neutral-900 hover:underline">
            View All 22 →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {services.slice(0, 5).map((s) => {
            const count = workerCountFor(s.name);
            return (
              <Link key={s.id} to={`/book/${s.id}`} className="spec-card group p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <CategoryIcon name={s.name} className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">
                    {count} {count === 1 ? tr("Artisan") : tr("Artisans")}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-neutral-900">{tService(s.name)}</h4>
                <p className="text-xs text-neutral-500 mt-1">From {fmtINR(s.base_price)}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </CustomerShell>
  );
}
