import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Compass,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  TrendingUp,
  UserCog,
  Wallet,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api from "../api";
import { useLang } from "../i18n";
import DashboardShell from "../components/DashboardShell";
import CategoryIcon from "../components/CategoryIcon";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import {
  Alert,
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
  Select,
  Skeleton,
  Textarea,
  useToast,
} from "../components/ui";
import { StatCard } from "./CustomerOverview";
import { cn, extractApiError, fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

// 3D Job Status Timeline Stages supported by backend
const JOB_TIMELINE_STEPS = [
  { key: "PENDING", label: "NEW REQ", sub: "Awaiting Action" },
  { key: "ACCEPTED", label: "CONFIRMED", sub: "Dispatched" },
  { key: "IN_PROGRESS", label: "ON-SITE", sub: "In Progress" },
  { key: "COMPLETED", label: "FULFILLED", sub: "Settled 90%" },
];

function JobTimeline({ status }) {
  const isCancelled = status === "CANCELLED" || status === "REJECTED";
  const stepIdx = {
    PENDING: 0,
    ACCEPTED: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3,
  }[status] ?? -1;

  if (isCancelled) {
    return (
      <div className="mt-3 flex items-center gap-2 border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 font-mono text-[10px] text-rose-300 uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
        Booking was {status.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-white/10 font-mono">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-4 right-4 top-2.5 h-0.5 bg-white/10 z-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${(Math.max(0, stepIdx) / 3) * 100}%` }}
          />
        </div>

        {JOB_TIMELINE_STEPS.map((step, idx) => {
          const isDone = stepIdx > idx;
          const isCurrent = stepIdx === idx;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-5 w-5 items-center justify-center text-[10px] font-bold border transition-all ${
                  isDone
                    ? "border-emerald-400 bg-emerald-500 text-black font-black"
                    : isCurrent
                    ? "border-emerald-400 bg-black text-emerald-400 ring-2 ring-emerald-500/30"
                    : "border-white/20 bg-black text-slate-500"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span
                className={`mt-1 text-[9px] font-bold uppercase tracking-wider ${
                  isCurrent ? "text-emerald-400" : isDone ? "text-white" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JobRow({ b, onAct, onComplete }) {
  return (
    <div className="border border-white/15 bg-black/60 p-5 backdrop-blur-2xl transition hover:border-white/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 shrink-0">
            <CategoryIcon name={b.service_name} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-sm font-black text-white uppercase tracking-wider">
                {b.service_name}
              </span>
              <span className="font-mono text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 bg-emerald-950/40">
                #{b.code}
              </span>
              {b.is_emergency && (
                <span className="font-mono text-[9px] text-amber-400 border border-amber-500/30 px-1.5 py-0.5 bg-amber-950/40 font-bold uppercase">
                  EMERGENCY (+25%)
                </span>
              )}
            </div>

            <p className="mt-1 font-mono text-xs text-slate-300">
              <span className="text-slate-400">DESTINATION:</span> {b.address}
            </p>
            <p className="font-mono text-[11px] text-slate-400 mt-0.5">
              CUSTOMER: <span className="text-white">{b.customer_name || `Customer #${b.customer_id}`}</span>
              {b.customer_phone && (
                <> · PHONE: <span className="text-slate-200">{b.customer_phone}</span></>
              )}
            </p>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex flex-col md:items-end gap-2 shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">PAYOUT (90%):</span>
            <span className="text-sm font-black text-emerald-400">
              {fmtINR((b.estimated_cost || 0) * 0.9)}
            </span>
            <StatusBadge status={b.status} />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {b.status === "PENDING" && (
              <>
                <button
                  type="button"
                  onClick={() => onAct(b, "accept")}
                  className="btn-tech-outline text-[11px] py-1 px-3"
                >
                  [ ACCEPT JOB ]
                </button>
                <button
                  type="button"
                  onClick={() => onAct(b, "reject")}
                  className="border border-white/20 bg-stoneblack text-slate-400 hover:text-white px-3 py-1 text-[11px] uppercase transition"
                >
                  DECLINE
                </button>
              </>
            )}

            {b.status === "ACCEPTED" && (
              <button
                type="button"
                onClick={() => onAct(b, "start")}
                className="btn-tech-outline text-[11px] py-1 px-3"
              >
                MARK EN-ROUTE / START →
              </button>
            )}

            {b.status === "IN_PROGRESS" && (
              <button
                type="button"
                onClick={() => onComplete(b)}
                className="btn-tech-outline text-[11px] py-1 px-3 border-emerald-400 bg-emerald-950/40 text-emerald-300"
              >
                COMPLETE & INVOICE →
              </button>
            )}
          </div>
        </div>
      </div>

      <JobTimeline status={b.status} />
    </div>
  );
}

export default function WorkerDashboard() {
  const { t } = useLang();
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [services, setServices] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(null);
  const [finalCost, setFinalCost] = useState("");
  const { setSceneData, hoveredObject, resetCamera } = useSceneData();

  const load = () => {
    api.get("/workers/me").then((r) => setProfile(r.data)).catch(() => {});
    api.get("/bookings/mine").then((r) => setJobs(r.data)).catch(() => setJobs([]));
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
    api.get("/payments/worker/earnings").then((r) => setEarnings(r.data)).catch(() => {});
  };

  useEffect(load, []);

  useEffect(() => {
    setSceneData({ jobs: jobs || [], services, profile, earnings });
  }, [jobs, services, profile, earnings, setSceneData]);

  const act = async (b, action, body) => {
    try {
      await api.post(`/bookings/${b.id}/${action}`, body || {});
      toast(`Job updated: ${action}`);
      load();
    } catch (ex) {
      toast(extractApiError(ex, "Action failed"), "error");
    }
  };

  const editableProfilePayload = (p) => ({
    skills: p.skills,
    experience_years: Number(p.experience_years) || 0,
    hourly_rate: Number(p.hourly_rate) || 300,
    bio: p.bio || "",
    address: p.address || "",
    availability: p.availability || "available",
  });

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/workers/me", editableProfilePayload(profile));
      toast("Artisan profile saved successfully");
      load();
    } catch (ex) {
      toast(extractApiError(ex, "Save failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const upd = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const toggleSkill = (name) =>
    setProfile((p) => ({
      ...p,
      skills: p.skills.includes(name)
        ? p.skills.filter((x) => x !== name)
        : [...p.skills, name],
    }));

  const list = jobs || [];
  const requests = list.filter((b) => b.status === "PENDING");
  const activeJobs = list.filter((b) => ["ACCEPTED", "IN_PROGRESS"].includes(b.status));

  const earningsChartData = useMemo(() => {
    if (!earnings?.items || earnings.items.length === 0) {
      return [
        { name: "P1", payout: 0 },
        { name: "P2", payout: 0 },
        { name: "P3", payout: 0 },
        { name: "P4", payout: 0 },
      ];
    }
    return earnings.items.slice(0, 6).map((item, idx) => ({
      name: `Job #${idx + 1}`,
      payout: item.payout,
      gross: item.amount,
      service: item.service,
    }));
  }, [earnings]);

  const nav = [
    { key: "overview", label: t("overview"), icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "jobs", label: t("myJobs"), icon: <ClipboardList className="h-4 w-4" /> },
    { key: "profile", label: t("profile"), icon: <UserCog className="h-4 w-4" /> },
    { key: "earnings", label: t("earnings"), icon: <Wallet className="h-4 w-4" /> },
  ];

  const titleOf = {
    overview: "Artisan 3D Field Terminal",
    jobs: "Dispatched Job Queue",
    profile: "Artisan Profile & Skills",
    earnings: "Dividend & Payout Ledger",
  }[tab];

  return (
    <DashboardShell
      navItems={nav}
      active={tab}
      onNavigate={setTab}
      title={titleOf}
      headerExtra={profile && <StatusBadge status={profile.verification_status} />}
    >
      {/* 3D Field Terminal Telemetry HUD */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-1.5 font-mono text-[11px] text-emerald-300 backdrop-blur-md">
          <Compass className="h-4 w-4 text-emerald-400 animate-spin" />
          <span>
            ARTISAN FIELD TERMINAL ACTIVE · <span className="text-slate-400">DISPATCH RADAR ONLINE</span>
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
          <span>DUTY STATUS: {profile?.availability?.toUpperCase() || "AVAILABLE"}</span>
        </div>
      </div>

      {/* Verification Alerts */}
      {profile?.verification_status === "pending" && (
        <div className="mb-6 border border-amber-500/40 bg-amber-950/30 p-4 font-mono text-xs text-amber-300">
          YOUR ARTISAN PROFILE IS CURRENTLY AWAITING VERIFICATION BY THE COOPERATIVE FEDERATION. AUTO-DISPATCH WILL ACTIVATE ONCE CLEARED.
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          {profile && (
            <div className="border border-white/15 bg-black/60 p-6 backdrop-blur-2xl">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar name={profile.name} className="h-14 w-14 border border-emerald-400 text-lg" />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-black font-bold">
                      ✓
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                        {profile.name}
                      </h2>
                      <StatusBadge status={profile.verification_status} />
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-400 uppercase">
                      RATE: ₹{profile.hourly_rate}/VISIT · {profile.experience_years} YRS EXP ·{" "}
                      {profile.skills?.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Duty Mode Selector */}
                <div className="flex flex-col sm:items-end gap-1.5 font-mono">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    DISPATCH SHIFT STATUS:
                  </span>
                  <div className="flex gap-2">
                    {["available", "busy", "offline"].map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          const prev = profile.availability;
                          upd("availability", a);
                          api.put("/workers/me", { availability: a })
                            .then(() => toast("Shift mode updated"))
                            .catch((ex) => {
                              upd("availability", prev);
                              toast(extractApiError(ex, "Update failed"), "error");
                            });
                        }}
                        className={cn(
                          "border px-3 py-1 font-mono text-[10px] uppercase font-bold transition",
                          profile.availability === a
                            ? "border-emerald-400 bg-emerald-950/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                            : "border-white/15 bg-black/40 text-slate-400 hover:border-white/40"
                        )}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Technical KPI Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={Star}
              label="Rating Index"
              value={profile ? Number(profile.avg_rating).toFixed(1) : "—"}
              tone="amber"
              subtitle="Decentralized score"
            />
            <StatCard
              icon={CheckCircle2}
              label="Jobs Completed"
              value={profile?.jobs_done ?? "—"}
              tone="emerald"
              subtitle="Verified fulfillment"
            />
            <StatCard
              icon={IndianRupee}
              label="Total Net (90%)"
              value={earnings ? fmtINR(earnings.total_earned) : "—"}
              tone="teal"
              subtitle="Direct dividend"
            />
            <StatCard
              icon={Briefcase}
              label="Open Requests"
              value={requests.length}
              tone="gold"
              subtitle="Awaiting action"
            />
          </div>

          {/* Incoming Job Orders Queue */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-emerald-400" />
                <span>Active Dispatch Radar</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 uppercase">
                {requests.length} REQUESTS · {activeJobs.length} UNDERWAY
              </span>
            </div>

            {jobs === null ? (
              <div className="h-28 border border-white/10 bg-black/30 animate-pulse" />
            ) : requests.length === 0 && activeJobs.length === 0 ? (
              <div className="border border-white/10 bg-black/40 p-8 text-center font-mono">
                <Briefcase className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-white uppercase">No Open Dispatches</p>
                <p className="text-[11px] text-slate-400 mt-1 uppercase">
                  Nearby requests will route to your terminal automatically based on geo-proximity and trade competence.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...requests, ...activeJobs].map((b) => (
                  <JobRow
                    key={b.id}
                    b={b}
                    onAct={act}
                    onComplete={(x) => {
                      setComplete(x);
                      setFinalCost(x.estimated_cost);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY JOBS */}
      {tab === "jobs" && (
        <div className="space-y-4">
          {list.length === 0 ? (
            <div className="border border-white/10 bg-black/40 p-8 text-center font-mono">
              <ClipboardList className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-white uppercase">No assigned jobs</p>
            </div>
          ) : (
            list.map((b) => (
              <JobRow
                key={b.id}
                b={b}
                onAct={act}
                onComplete={(x) => {
                  setComplete(x);
                  setFinalCost(x.estimated_cost);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* TAB 3: PROFILE MANAGEMENT */}
      {tab === "profile" && profile && (
        <div className="border border-white/15 bg-black/60 p-6 backdrop-blur-2xl max-w-2xl font-mono text-xs">
          <h3 className="font-display text-base font-black uppercase text-white tracking-wider mb-1 flex items-center gap-2">
            <UserCog className="h-4 w-4 text-emerald-400" />
            Artisan Specifications & Skills Matrix
          </h3>
          <p className="text-[11px] text-slate-400 uppercase mb-5">
            Configure hourly rates, service area coordinates, and verified skills.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase">Availability</label>
                <select
                  value={profile.availability}
                  onChange={(e) => upd("availability", e.target.value)}
                  className="w-full border border-white/15 bg-black/80 px-3 py-2 text-white"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase">Base Rate (₹/Visit)</label>
                <input
                  type="number"
                  value={profile.hourly_rate}
                  onChange={(e) => upd("hourly_rate", Number(e.target.value))}
                  className="w-full border border-white/15 bg-black/80 px-3 py-2 text-white"
                >
                </input>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase">Service Area / Base Address</label>
              <input
                value={profile.address || ""}
                maxLength={500}
                onChange={(e) => upd("address", e.target.value)}
                className="w-full border border-white/15 bg-black/80 px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase">Professional Bio</label>
              <textarea
                rows={3}
                value={profile.bio || ""}
                maxLength={1000}
                onChange={(e) => upd("bio", e.target.value)}
                className="w-full border border-white/15 bg-black/80 px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-2 border-t border-white/10 pt-3">
              <label className="text-[10px] font-bold text-slate-300 uppercase">Verified Skills Cluster</label>
              <div className="flex flex-wrap gap-1.5">
                {services.map((s) => {
                  const on = profile.skills?.includes(s.name);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleSkill(s.name)}
                      className={cn(
                        "border px-2.5 py-1 text-[10px] uppercase font-bold transition",
                        on
                          ? "border-emerald-400 bg-emerald-950/60 text-emerald-300"
                          : "border-white/15 bg-black/40 text-slate-400 hover:border-white/40"
                      )}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="btn-tech-outline w-full text-center justify-center py-2.5 mt-2"
            >
              {saving ? "SAVING..." : "COMMIT SPECIFICATIONS →"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: EARNINGS & PAYOUT HISTORY */}
      {tab === "earnings" && earnings && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={Wallet}
              label="Net Earned (90%)"
              value={fmtINR(earnings.total_earned)}
              tone="emerald"
              subtitle="Direct dividend"
            />
            <StatCard
              icon={IndianRupee}
              label="Gross Transaction Volume"
              value={fmtINR(earnings.gross)}
              tone="gold"
              subtitle="Platform total"
            />
            <StatCard
              icon={CheckCircle2}
              label="Paid Jobs Completed"
              value={earnings.paid_jobs}
              tone="teal"
              subtitle="Settled ledger"
            />
          </div>

          {/* Recharts Bar Chart */}
          <div className="border border-white/15 bg-black/60 p-6 backdrop-blur-2xl">
            <div className="pb-3 border-b border-white/10 mb-4">
              <h3 className="font-mono text-xs font-bold uppercase text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Recent 90% Direct Disbursements</span>
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="monospace" />
                  <YAxis stroke="#64748b" fontSize={10} fontStyle="monospace" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d0e12",
                      borderColor: "rgba(16,185,129,0.3)",
                      color: "#f8fafc",
                      fontFamily: "monospace",
                      fontSize: "11px",
                    }}
                    formatter={(val) => [fmtINR(val), "Artisan Dividend (90%)"]}
                  />
                  <Bar dataKey="payout" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {complete && (
        <Modal
          title="Complete Job & Issue Settlement"
          description={`${complete.service_name} #${complete.code}`}
          onClose={() => setComplete(null)}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase">
                Final Bill Amount (₹)
              </label>
              <input
                type="number"
                min={1}
                max={200000}
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
                className="w-full border border-white/20 bg-black/80 px-3 py-2 text-white"
              />
            </div>
            <button
              type="button"
              className="btn-tech-outline w-full py-2.5 text-center justify-center font-bold"
              onClick={() => {
                const cost = finalCost === "" ? complete.estimated_cost : Number(finalCost);
                act(complete, "complete", { final_cost: cost });
                setComplete(null);
              }}
            >
              FINALIZE JOB & INVOICE →
            </button>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}
