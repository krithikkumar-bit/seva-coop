import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  LayoutDashboard,
  Star,
  TrendingUp,
  UserCog,
  Wallet,
} from "lucide-react";
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
import { Avatar, useToast } from "../components/ui";
import { StatCard } from "./CustomerOverview";
import { cn, extractApiError, fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

const JOB_TIMELINE_STEPS = [
  { key: "PENDING", label: "Requested" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
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
      <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
        Job was {status.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-4 right-4 top-2.5 h-1 rounded-full bg-slate-100 z-0">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(Math.max(0, stepIdx) / 3) * 100}%` }}
          />
        </div>

        {JOB_TIMELINE_STEPS.map((step, idx) => {
          const isDone = stepIdx > idx;
          const isCurrent = stepIdx === idx;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "border-2 border-emerald-600 bg-white text-emerald-700"
                    : "border border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span
                className={`mt-1 text-[10px] font-semibold ${
                  isCurrent ? "text-emerald-700" : isDone ? "text-slate-900" : "text-slate-400"
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 shrink-0">
            <CategoryIcon name={b.service_name} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-sm font-bold text-slate-900">
                {b.service_name}
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                #{b.code}
              </span>
              {b.is_emergency && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  Emergency (+25%)
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-600">
              <strong className="text-slate-700">Address:</strong> {b.address}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-medium text-slate-800">{b.customer_name || `Customer #${b.customer_id}`}</span>
              {b.customer_phone && (
                <> · Phone: <span className="font-medium text-slate-800">{b.customer_phone}</span></>
              )}
            </p>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex flex-col md:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Your Payout (90%):</span>
            <span className="text-sm font-extrabold text-emerald-700">
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
                  className="btn-primary-coop py-1.5 px-3.5 text-xs"
                >
                  Accept Job
                </button>
                <button
                  type="button"
                  onClick={() => onAct(b, "reject")}
                  className="btn-secondary-coop py-1.5 px-3 text-xs"
                >
                  Decline
                </button>
              </>
            )}

            {b.status === "ACCEPTED" && (
              <button
                type="button"
                onClick={() => onAct(b, "start")}
                className="btn-primary-coop py-1.5 px-3.5 text-xs"
              >
                Start Work →
              </button>
            )}

            {b.status === "IN_PROGRESS" && (
              <button
                type="button"
                onClick={() => onComplete(b)}
                className="btn-primary-coop py-1.5 px-3.5 text-xs"
              >
                Complete & Enter Bill →
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
  const { setSceneData } = useSceneData();

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
      toast("Profile saved successfully!");
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
        { name: "Job 1", payout: 0 },
        { name: "Job 2", payout: 0 },
        { name: "Job 3", payout: 0 },
        { name: "Job 4", payout: 0 },
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
    overview: "Worker Dashboard",
    jobs: "My Jobs",
    profile: "My Profile & Skills",
    earnings: "Earnings & Payouts",
  }[tab];

  return (
    <DashboardShell
      navItems={nav}
      active={tab}
      onNavigate={setTab}
      title={titleOf}
      headerExtra={profile && <StatusBadge status={profile.verification_status} />}
    >
      {profile?.verification_status === "pending" && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
          Your account is currently awaiting cooperative verification. Once verified by the Coordinator, you will appear in customer search and receive auto-matched jobs.
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          {profile && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={profile.name} className="h-14 w-14 text-lg" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl font-extrabold text-slate-900">
                        {profile.name}
                      </h2>
                      <StatusBadge status={profile.verification_status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      ₹{profile.hourly_rate}/visit · {profile.experience_years} yrs exp · {profile.skills?.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Duty Switcher */}
                <div className="flex flex-col sm:items-end gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">
                    Your Availability Status
                  </span>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    {["available", "busy", "offline"].map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          const prev = profile.availability;
                          upd("availability", a);
                          api.put("/workers/me", { availability: a })
                            .then(() => toast("Status updated"))
                            .catch((ex) => {
                              upd("availability", prev);
                              toast(extractApiError(ex, "Update failed"), "error");
                            });
                        }}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition",
                          profile.availability === a
                            ? "bg-white text-emerald-700 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
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

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={Star}
              label="Average Rating"
              value={profile ? Number(profile.avg_rating).toFixed(1) : "—"}
              tone="amber"
              subtitle="Customer reviews"
            />
            <StatCard
              icon={CheckCircle2}
              label="Jobs Completed"
              value={profile?.jobs_done ?? "—"}
              tone="emerald"
              subtitle="Total finished"
            />
            <StatCard
              icon={IndianRupee}
              label="Net Earnings (90%)"
              value={earnings ? fmtINR(earnings.total_earned) : "—"}
              tone="teal"
              subtitle="Direct worker share"
            />
            <StatCard
              icon={Briefcase}
              label="Pending Requests"
              value={requests.length}
              tone="gold"
              subtitle="Needs your action"
            />
          </div>

          {/* Incoming Queue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-emerald-600" />
                <span>Incoming & Active Jobs</span>
              </div>
              <span className="text-xs text-slate-500">
                {requests.length} pending · {activeJobs.length} in progress
              </span>
            </div>

            {jobs === null ? (
              <div className="h-28 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
            ) : requests.length === 0 && activeJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Briefcase className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No active job requests</p>
                <p className="text-xs text-slate-500 mt-1">
                  Keep your status set to "Available" to receive new nearby bookings.
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

      {/* TAB 2: ALL JOBS */}
      {tab === "jobs" && (
        <div className="space-y-4">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No jobs yet</p>
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

      {/* TAB 3: PROFILE */}
      {tab === "profile" && profile && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs max-w-2xl">
          <h3 className="font-display text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-emerald-600" />
            Profile & Service Skills
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Update your base visit fee, service locality, bio, and active skills.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Availability</label>
                <select
                  value={profile.availability}
                  onChange={(e) => upd("availability", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Base Rate (₹/Visit)</label>
                <input
                  type="number"
                  value={profile.hourly_rate}
                  onChange={(e) => upd("hourly_rate", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Service Area / Base Address</label>
              <input
                value={profile.address || ""}
                maxLength={500}
                onChange={(e) => upd("address", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Short Bio</label>
              <textarea
                rows={3}
                value={profile.bio || ""}
                maxLength={1000}
                onChange={(e) => upd("bio", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900"
              />
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-semibold text-slate-700">Your Trade Skills</label>
              <div className="flex flex-wrap gap-1.5">
                {services.map((s) => {
                  const on = profile.skills?.includes(s.name);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleSkill(s.name)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                        on
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
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
              className="btn-primary-coop w-full justify-center py-2.5 mt-2"
            >
              {saving ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: EARNINGS */}
      {tab === "earnings" && earnings && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={Wallet}
              label="Net Earned (90%)"
              value={fmtINR(earnings.total_earned)}
              tone="emerald"
              subtitle="Your direct payout"
            />
            <StatCard
              icon={IndianRupee}
              label="Gross Job Value"
              value={fmtINR(earnings.gross)}
              tone="gold"
              subtitle="Total customer billings"
            />
            <StatCard
              icon={CheckCircle2}
              label="Paid Jobs"
              value={earnings.paid_jobs}
              tone="teal"
              subtitle="Settled invoices"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Recent Payouts (90% Share)</span>
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      color: "#0f172a",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1)",
                    }}
                    formatter={(val) => [fmtINR(val), "Your Payout (90%)"]}
                  />
                  <Bar dataKey="payout" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {complete && (
        <Modal
          title="Complete Job & Generate Bill"
          description={`${complete.service_name} #${complete.code}`}
          onClose={() => setComplete(null)}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Final Service Amount (₹)
              </label>
              <input
                type="number"
                min={1}
                max={200000}
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              />
            </div>
            <button
              type="button"
              className="btn-primary-coop w-full py-2.5 justify-center"
              onClick={() => {
                const cost = finalCost === "" ? complete.estimated_cost : Number(finalCost);
                act(complete, "complete", { final_cost: cost });
                setComplete(null);
              }}
            >
              Finish Job & Request Payment →
            </button>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}
