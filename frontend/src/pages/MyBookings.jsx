import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Compass,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api";
import { useLang } from "../i18n";
import CustomerShell from "../components/CustomerShell";
import CategoryIcon from "../components/CategoryIcon";
import StatusBadge from "../components/StatusBadge";
import Stars from "../components/Stars";
import Modal from "../components/Modal";
import {
  Alert,
  EmptyState,
  Select,
  Skeleton,
  useToast,
} from "../components/ui";
import { extractApiError, fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

const FILTERS = [
  ["all", "ALL DISPATCHES"],
  ["active", "ACTIVE QUEUE"],
  ["completed", "COMPLETED"],
  ["closed", "CANCELLED / CLOSED"],
];
const ACTIVE = ["PENDING", "ACCEPTED", "IN_PROGRESS"];

// 3D Booking Timeline Stages supported by the backend
const TIMELINE_STEPS = [
  { key: "PENDING", label: "PENDING", sub: "Request Dispatched" },
  { key: "ACCEPTED", label: "ACCEPTED", sub: "Artisan Assigned" },
  { key: "IN_PROGRESS", label: "IN PROGRESS", sub: "Service Underway" },
  { key: "COMPLETED", label: "COMPLETED", sub: "Verified & Settled" },
];

function BookingTimeline({ status }) {
  const isCancelled = status === "CANCELLED" || status === "REJECTED";
  const stepIdx = {
    PENDING: 0,
    ACCEPTED: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3,
  }[status] ?? -1;

  if (isCancelled) {
    return (
      <div className="mt-4 flex items-center gap-2 border border-rose-500/30 bg-rose-950/40 px-3.5 py-2 font-mono text-xs text-rose-300">
        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        Booking was {status.toLowerCase()}. You may dispatch a new cooperative service request anytime.
      </div>
    );
  }

  return (
    <div className="mt-5 pt-4 border-t border-white/10 font-mono">
      <div className="relative flex items-center justify-between">
        {/* Connecting track line */}
        <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-white/10 z-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_8px_#34d399] transition-all duration-500"
            style={{ width: `${(Math.max(0, stepIdx) / 3) * 100}%` }}
          />
        </div>

        {TIMELINE_STEPS.map((step, idx) => {
          const isDone = stepIdx > idx;
          const isCurrent = stepIdx === idx;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center font-mono text-xs font-black transition-all ${
                  isDone
                    ? "border border-emerald-400 bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    : isCurrent
                    ? "border-2 border-emerald-400 bg-black text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                    : "border border-white/20 bg-stoneblack text-slate-500"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span
                className={`mt-1.5 text-[10px] font-bold tracking-wider uppercase ${
                  isCurrent ? "text-emerald-300" : isDone ? "text-white" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
              <span className="hidden sm:inline text-[9px] text-slate-500">
                {step.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { t, tr, tService } = useLang();
  const { toast } = useToast();
  const [bookings, setBookings] = useState(null);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [payMethod, setPayMethod] = useState("upi");
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  const { setSceneData, resetCamera } = useSceneData();

  const load = () =>
    api.get("/bookings/mine")
      .then((r) => setBookings(r.data))
      .catch(() => setBookings([]));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setSceneData({ bookings: bookings || [] });
  }, [bookings, setSceneData]);

  const fail = (ex, fallback) => toast(extractApiError(ex, fallback), "error");

  const openMatches = async (b) => {
    try {
      const { data } = await api.get(`/bookings/${b.id}/matches`);
      setModal({ type: "matches", booking: b, data });
    } catch (ex) {
      fail(ex, "Could not load matches");
    }
  };

  const assign = async (b, workerId) => {
    try {
      await api.post(`/bookings/${b.id}/assign`, { worker_id: workerId });
      setModal(null);
      toast("Artisan assigned successfully");
      load();
    } catch (ex) {
      fail(ex, "Assignment failed");
    }
  };

  const cancel = async (b) => {
    try {
      await api.post(`/bookings/${b.id}/cancel`);
      toast("Booking cancelled");
      load();
    } catch (ex) {
      fail(ex, "Could not cancel");
    }
  };

  const pay = async () => {
    try {
      const { data } = await api.post("/payments/pay", {
        booking_id: modal.booking.id,
        method: payMethod,
      });
      setModal({ type: "invoice", booking: modal.booking, data });
      load();
    } catch (ex) {
      fail(ex, "Payment failed");
    }
  };

  const rate = async () => {
    try {
      await api.post("/ratings", { booking_id: modal.booking.id, stars, comment });
      setModal(null);
      toast("Feedback logged into cooperative ledger");
      load();
    } catch (ex) {
      fail(ex, "Could not submit rating");
    }
  };

  const list = (bookings || []).filter((b) =>
    filter === "all"
      ? true
      : filter === "active"
      ? ACTIVE.includes(b.status)
      : filter === "completed"
      ? b.status === "COMPLETED"
      : ["CANCELLED", "REJECTED"].includes(b.status),
  );

  return (
    <CustomerShell title={t("myBookings")}>
      {/* 3D Telemetry HUD Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/50 px-3.5 py-1.5 text-xs text-emerald-300 backdrop-blur-md">
          <Compass className="h-4 w-4 text-emerald-400 animate-spin-slow" />
          <span>
            3D DISPATCH TELEMETRY ACTIVE · <span className="text-slate-400">ORBIT DRAG 360°</span>
          </span>
          <button
            type="button"
            onClick={resetCamera}
            className="ml-2 inline-flex items-center gap-1 border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase hover:border-white hover:text-white transition-colors"
            title="Reset 3D camera"
          >
            <RotateCcw className="h-3 w-3" /> RESET VIEW
          </button>
        </div>

        <span className="border border-emerald-500/40 bg-emerald-950/60 px-3 py-1 text-xs font-bold uppercase text-emerald-300">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 inline text-emerald-400" />
          {list.length} CONTRACTS IN VIEW
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 font-mono">
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={
              "border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all " +
              (filter === k
                ? "border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "border-white/15 bg-black/40 text-slate-400 hover:border-white/40 hover:text-white")
            }
          >
            {tr(label)}
          </button>
        ))}
      </div>

      {bookings === null ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 border border-white/10 bg-black/30 animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="border border-white/15 bg-black/40 p-10 text-center font-mono">
          <ClipboardList className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold uppercase text-white">No contracts found in this category</p>
          <Link
            to="/services"
            className="mt-4 inline-flex items-center gap-2 border border-emerald-400 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            <CalendarPlus className="h-4 w-4" /> DISPATCH NEW SERVICE →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((b) => (
            <motion.div
              key={b.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
            >
              <div className="border border-white/15 bg-black/60 p-5 sm:p-6 backdrop-blur-2xl transition-all hover:border-white/30">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-emerald-500/40 bg-emerald-950/40 text-emerald-400">
                      <CategoryIcon name={b.service_name} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1 font-mono">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-base font-black uppercase text-white">
                          {tService(b.service_name)}
                        </span>
                        <span className="border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          #{b.code}
                        </span>
                        {b.is_emergency && (
                          <span className="border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                            <Siren className="h-3 w-3 mr-1 inline" /> EMERGENCY
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span className="truncate">
                          {new Date(b.scheduled_at).toLocaleString()} · {b.address}
                        </span>
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                        <User className="h-3.5 w-3.5 text-emerald-400" />
                        {b.worker_name ? (
                          <span>
                            ASSIGNED ARTISAN: <strong className="text-white uppercase">{b.worker_name}</strong> ({b.worker_phone})
                          </span>
                        ) : (
                          <span className="text-amber-300">CALCULATING PROXIMITY DISPATCH MATCH…</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-1.5 font-mono">
                    <StatusBadge status={b.status} />
                    <p className="font-display text-base font-black text-emerald-400">
                      {fmtINR(b.final_cost || b.estimated_cost)}
                    </p>
                    {b.paid && (
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> SETTLED
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 md:w-36 md:flex-col font-mono text-xs">
                    {b.status === "PENDING" && !b.worker_id && (
                      <button
                        onClick={() => openMatches(b)}
                        className="w-full border border-emerald-400 bg-emerald-500/20 py-1.5 px-2 text-center font-bold uppercase text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                      >
                        {t("findWorkers")}
                      </button>
                    )}
                    {["PENDING", "ACCEPTED"].includes(b.status) && (
                      <button
                        onClick={() => cancel(b)}
                        className="w-full border border-white/20 bg-black/50 py-1.5 px-2 text-center font-bold uppercase text-slate-400 hover:border-rose-400 hover:text-rose-300 transition-colors"
                      >
                        {t("cancel")}
                      </button>
                    )}
                    {b.status === "COMPLETED" && !b.paid && (
                      <button
                        onClick={() => setModal({ type: "pay", booking: b })}
                        className="w-full border border-emerald-400 bg-emerald-500 py-1.5 px-2 text-center font-black uppercase text-black hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
                      >
                        {tr("PAY NOW →")}
                      </button>
                    )}
                    {b.status === "COMPLETED" && b.paid && !b.rated && (
                      <button
                        onClick={() => {
                          setStars(5);
                          setComment("");
                          setModal({ type: "rate", booking: b });
                        }}
                        className="w-full border border-amber-400/40 bg-amber-950/40 py-1.5 px-2 text-center font-bold uppercase text-amber-300 hover:bg-amber-950/60 transition-colors"
                      >
                        <Star className="h-3.5 w-3.5 mr-1 inline" /> {t("rate")}
                      </button>
                    )}
                  </div>
                </div>

                {/* 3D Booking Timeline Showing Progress: Pending → Accepted → In Progress → Completed */}
                <BookingTimeline status={b.status} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal 1: Matched Cooperative Workers */}
      {modal?.type === "matches" && (
        <Modal
          title="NEARBY MATCHED COOPERATIVE ARTISANS"
          description="Weighted allocation score based on verified competence, GPS distance, and cooperative rating."
          onClose={() => setModal(null)}
        >
          <div className="space-y-3 font-mono">
            {modal.data.length === 0 && (
              <div className="border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-300">
                No active verified artisans available for this trade currently.
              </div>
            )}
            {modal.data.map((w) => (
              <div
                key={w.profile_id}
                className="flex items-center justify-between gap-3 border border-white/15 bg-black/60 p-3.5 text-xs text-slate-300"
              >
                <div className="min-w-0">
                  <p className="font-bold uppercase text-white">
                    {w.name}{" "}
                    <span className="border border-emerald-500/40 bg-emerald-950/60 px-1.5 py-0.5 text-[10px] text-emerald-300">
                      {Math.round(w.score * 100)}% MATCH
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    ★ {w.avg_rating} · {w.distance_km ?? "?"} km · {fmtINR(w.hourly_rate)} · {w.jobs_done} JOBS
                  </p>
                </div>
                <button
                  onClick={() => assign(modal.booking, w.user_id)}
                  className="border border-emerald-400 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold uppercase text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                >
                  ASSIGN
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Modal 2: Pay Securely */}
      {modal?.type === "pay" && (
        <Modal
          title={`SETTLE FARE: ${fmtINR(modal.booking.final_cost || modal.booking.estimated_cost)}`}
          description="Direct cooperative distribution: 90% straight to the worker, 10% cooperative society fund."
          onClose={() => setModal(null)}
        >
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="mb-1.5 block font-bold uppercase text-slate-300">
                SELECT PAYMENT PROTOCOL
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-emerald-400"
              >
                <option value="upi" className="bg-stoneblack text-white">UPI (GPay / PhonePe / Paytm)</option>
                <option value="card" className="bg-stoneblack text-white">Debit / Credit Card</option>
                <option value="cash" className="bg-stoneblack text-white">Cash Settlement on Site</option>
              </select>
            </div>
            <button
              onClick={pay}
              className="w-full border border-emerald-400 bg-emerald-500 py-2.5 text-xs font-black uppercase text-black hover:bg-emerald-400 transition-colors"
            >
              PAY SECURELY NOW →
            </button>
          </div>
        </Modal>
      )}

      {/* Modal 3: Invoice Breakdown */}
      {modal?.type === "invoice" && (
        <Modal title={`SETTLEMENT INVOICE #${modal.data.invoice_no}`} onClose={() => setModal(null)}>
          <div className="space-y-3 border border-emerald-500/30 bg-emerald-950/40 p-4 font-mono text-xs text-slate-300">
            <div className="flex justify-between">
              <span>AMOUNT SETTLED ({modal.data.method.toUpperCase()})</span>
              <strong className="text-white text-sm">{fmtINR(modal.data.amount)}</strong>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-emerald-300">
              <span>DIRECT ARTISAN REMITTANCE (90%)</span>
              <strong>{fmtINR(modal.data.worker_payout)}</strong>
            </div>
            <div className="flex justify-between text-amber-300">
              <span>COOPERATIVE SOCIETY RESERVE (10%)</span>
              <strong>{fmtINR(modal.data.coop_fee)}</strong>
            </div>
          </div>
          <button
            onClick={() => setModal(null)}
            className="mt-4 w-full border border-white/20 bg-black/60 py-2 font-mono text-xs font-bold uppercase text-white hover:border-white transition-colors"
          >
            DISMISS INVOICE
          </button>
        </Modal>
      )}

      {/* Modal 4: Rate Cooperative Worker */}
      {modal?.type === "rate" && (
        <Modal title="RATE ARTISAN PERFORMANCE" onClose={() => setModal(null)}>
          <div className="flex justify-center py-2">
            <Stars value={stars} onChange={setStars} className="h-8 w-8 text-amber-400" />
          </div>
          <textarea
            className="mt-4 w-full border border-white/15 bg-black/60 p-3 font-mono text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-400"
            rows={3}
            maxLength={2000}
            placeholder="Feedback builds trust and higher priority allocation in the cooperative federation"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            onClick={rate}
            className="mt-4 w-full border border-emerald-400 bg-emerald-500 py-2.5 font-mono text-xs font-black uppercase text-black hover:bg-emerald-400 transition-colors"
          >
            LOG RATING TO LEDGER →
          </button>
        </Modal>
      )}
    </CustomerShell>
  );
}
