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
import { cn, extractApiError, FALLBACK_SERVICES, fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

const JOB_TIMELINE_STEPS = [
  { key: "PENDING", label: "Requested" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
];

function JobTimeline({ status }) {
  const isCancelled = status === "CANCELLED" || status === "REJECTED";
  const stepIdx = { PENDING: 0, ACCEPTED: 1, IN_PROGRESS: 2, COMPLETED: 3 }[status] ?? -1;

  if (isCancelled) {
    return (
      <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
        Job was {status.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-neutral-100">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-4 right-4 top-2.5 h-1 rounded-full bg-neutral-100 z-0">
          <div
            className="h-full rounded-full bg-neutral-900 transition-all duration-500"
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
                    ? "bg-neutral-900 text-white"
                    : isCurrent
                    ? "border-2 border-neutral-900 bg-white text-neutral-900"
                    : "border border-neutral-200 bg-neutral-50 text-neutral-400"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span
                className={`mt-1 text-[10px] font-semibold ${
                  isCurrent ? "text-neutral-900" : isDone ? "text-neutral-900" : "text-neutral-400"
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-300">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 shrink-0">
            <CategoryIcon name={b.service_name} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-sm font-bold text-neutral-900">
                {b.service_name}
              </span>
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-600">
                #{b.code}
              </span>
              {b.is_emergency && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  Urgent (+25%)
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-neutral-600">
              <strong className="text-neutral-800">Address:</strong> {b.address}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Customer: <span className="font-medium text-neutral-800">{b.customer_name || `Customer #${b.customer_id}`}</span>
              {b.customer_phone && (
                <> · Phone: <span className="font-medium text-neutral-800">{b.customer_phone}</span></>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Your Payout (90%):</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {fmtINR((b.estimated_cost || 0) * 0.9)}
            </span>
            <StatusBadge status={b.status} />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {b.status === "PENDING" && (
              <>
                <button type="button" onClick={() => onAct(b, "accept")} className="btn-primary-coop py-1.5 px-3.5 text-xs">
                  Accept Job
                </button>
                <button type="button" onClick={() => onAct(b, "reject")} className="btn-secondary-coop py-1.5 px-3 text-xs">
                  Decline
                </button>
              </>
            )}
            {b.status === "ACCEPTED" && (
              <button type="button" onClick={() => onAct(b, "start")} className="btn-primary-coop py-1.5 px-3.5 text-xs">
                Start Work →
              </button>
            )}
            {b.status === "IN_PROGRESS" && (
              <button type="button" onClick={() => onComplete(b)} className="btn-primary-coop py-1.5 px-3.5 text-xs">
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
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [earnings, setEarnings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(null);
  const [finalCost, setFinalCost] = useState("");
  const { setSceneData } = useSceneData();

  const load = () => {
    api.get("/workers/me").then((r) => setProfile(r.data)).catch(() => {});
    api.get("/bookings/mine").then((r) => setJobs(r.data)).catch(() => setJobs([]));
    api.get("/services").then((r) => setServices(Array.isArray(r.data) && r.data.length > 0 ? r.data : FALLBACK_SERVICES)).catch(() => {});
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
    overview: "Partner Dashboard",
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
          Your partner account is currently awaiting verification by the Coordinator.
        </div>
      )}

      {tab === "overview" && (
        <div className="space-y-6">
          {profile && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={profile.name} className="h-14 w-14 text-lg" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl font-extrabold text-neutral-900">
                        {profile.name}
                      </h2>
                      <StatusBadge status={profile.verification_status} />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      ₹{profile.hourly_rate}/visit · {profile.experience_years} yrs exp · {profile.skills?.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5">
                  <span className="text-xs font-semibold text-neutral-500">
                    Availability Status
                  </span>
                  <div className="inline-flex rounded-lg bg-neutral-100 p-1 border border-neutral-200">
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
                          "rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition",
                          profile.availability === a
                            ? "bg-neutral-900 text-white"
                            : "text-neutral-600 hover:text-neutral-900"
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

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Star} label="Average Rating" value={profile ? Number(profile.avg_rating).toFixed(1) : "—"} tone="amber" subtitle="Customer reviews" />
            <StatCard icon={CheckCircle2} label="Jobs Completed" value={profile?.jobs_done ?? "—"} tone="emerald" subtitle="Total finished" />
            <StatCard icon={IndianRupee} label="Net Earnings (90%)" value={earnings ? fmtINR(earnings.total_earned) : "—"} tone="teal" subtitle="Direct worker share" />
            <StatCard icon={Briefcase} label="Pending Requests" value={requests.length} tone="gold" subtitle="Needs action" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-neutral-700" />
                <span>Incoming & Active Jobs</span>
              </div>
              <span className="text-xs text-neutral-500">
                {requests.length} pending · {activeJobs.length} in progress
              </span>
            </div>

            {jobs === null ? (
              <div className="h-28 rounded-2xl border border-neutral-200 bg-neutral-100 animate-pulse" />
            ) : requests.length === 0 && activeJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
                <Briefcase className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-neutral-800">No active job requests</p>
                <p className="text-xs text-neutral-500 mt-1">Keep your status set to "Available" to receive new bookings.</p>
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

      {tab === "jobs" && (
        <div className="space-y-4">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
              <ClipboardList className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-800">No jobs yet</p>
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

      {tab === "profile" && profile && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs max-w-2xl">
          <h3 className="font-display text-lg font-bold text-neutral-900 mb-1 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-neutral-700" />
            Profile & Service Skills
          </h3>
          <p className="text-xs text-neutral-500 mb-6">
            Update your base visit fee, service locality, bio, and active skills.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Availability</label>
                <select
                  value={profile.availability}
                  onChange={(e) => upd("availability", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Base Rate (₹/Visit)</label>
                <input
                  type="number"
                  value={profile.hourly_rate}
                  onChange={(e) => upd("hourly_rate", Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Service Area / Base Address</label>
              <input
                value={profile.address || ""}
                maxLength={500}
                onChange={(e) => upd("address", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Short Bio</label>
              <textarea
                rows={3}
                value={profile.bio || ""}
                maxLength={1000}
                onChange={(e) => upd("bio", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
              />
            </div>

            <div className="space-y-2 border-t border-neutral-100 pt-4">
              <label className="text-xs font-semibold text-neutral-700">Your Trade Skills</label>
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
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300"
                      )}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" onClick={saveProfile} disabled={saving} className="btn-primary-coop w-full justify-center py-2.5 mt-2">
              {saving ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "earnings" && earnings && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Wallet} label="Net Earned (90%)" value={fmtINR(earnings.total_earned)} tone="emerald" subtitle="Your direct payout" />
            <StatCard icon={IndianRupee} label="Gross Job Value" value={fmtINR(earnings.gross)} tone="teal" subtitle="Total customer billings" />
            <StatCard icon={CheckCircle2} label="Paid Jobs" value={earnings.paid_jobs} tone="gold" subtitle="Settled invoices" />
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <div className="pb-3 border-b border-neutral-100 mb-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-neutral-700" />
                <span>Recent Payouts (90% Share)</span>
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e5e5e5",
                      borderRadius: "10px",
                      color: "#0f0f0f",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [fmtINR(val), "Your Payout (90%)"]}
                  />
                  <Bar dataKey="payout" fill="#0f0f0f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {complete && (
        <Modal
          title="Complete Job & Generate Bill"
          description={`${complete.service_name} #${complete.code}`}
          onClose={() => setComplete(null)}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Final Service Amount (₹)</label>
              <input
                type="number"
                min={1}
                max={200000}
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
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
