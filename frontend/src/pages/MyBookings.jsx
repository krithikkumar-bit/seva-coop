import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import api from "../api";
import { useLang } from "../i18n";
import CustomerShell from "../components/CustomerShell";
import CategoryIcon from "../components/CategoryIcon";
import StatusBadge from "../components/StatusBadge";
import Stars from "../components/Stars";
import Modal from "../components/Modal";
import { useToast } from "../components/ui";
import { cn, extractApiError, fmtINR } from "../lib/cn";
import { useSceneData } from "../scene/SceneStore";

const FILTERS = [
  ["all", "All Bookings"],
  ["active", "Active"],
  ["completed", "Completed"],
  ["closed", "Cancelled"],
];
const ACTIVE = ["PENDING", "ACCEPTED", "IN_PROGRESS"];

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Requested", sub: "Order Placed" },
  { key: "ACCEPTED", label: "Accepted", sub: "Artisan Assigned" },
  { key: "IN_PROGRESS", label: "In Progress", sub: "Work Underway" },
  { key: "COMPLETED", label: "Completed", sub: "Job Finished" },
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
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
        Booking was {status.toLowerCase()}. You can create a new service booking anytime.
      </div>
    );
  }

  return (
    <div className="mt-5 pt-4 border-t border-neutral-100">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-5 right-5 top-3.5 h-1 rounded-full bg-neutral-100 z-0">
          <div
            className="h-full rounded-full bg-neutral-900 transition-all duration-500"
            style={{ width: `${(Math.max(0, stepIdx) / 3) * 100}%` }}
          />
        </div>

        {TIMELINE_STEPS.map((step, idx) => {
          const isDone = stepIdx > idx;
          const isCurrent = stepIdx === idx;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
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
                className={`mt-1.5 text-[11px] font-semibold ${
                  isCurrent ? "text-neutral-900" : isDone ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                {step.label}
              </span>
              <span className="hidden sm:inline text-[10px] text-neutral-400">
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
  const [payMethod, setPayMethod] = useState("razorpay");
  const [payBusy, setPayBusy] = useState(false);
  const [mockSimulator, setMockSimulator] = useState(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const { setSceneData } = useSceneData();

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setPayBusy(true);
    try {
      if (payMethod === "cash") {
        const { data } = await api.post("/payments/pay", {
          booking_id: modal.booking.id,
          method: "cash",
        });
        setModal({ type: "invoice", booking: modal.booking, data });
        load();
        toast("Cash payment recorded!");
        return;
      }

      const { data: order } = await api.post("/payments/create-order", {
        booking_id: modal.booking.id,
      });

      if (order.is_mock) {
        setMockSimulator(order);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        fail(null, "Could not load Razorpay SDK. Please check your internet connection.");
        return;
      }

      const options = {
        key: order.key_id,
        amount: order.amount_paise,
        currency: order.currency,
        name: "SevaCoop",
        description: `Payment for ${order.service_name} (#${order.booking_code})`,
        image: "/favicon.svg",
        order_id: order.order_id,
        prefill: {
          name: order.customer_name,
          email: order.customer_email,
          contact: order.customer_phone,
        },
        theme: { color: "#0f0f0f" },
        handler: async function (response) {
          try {
            const { data } = await api.post("/payments/verify", {
              booking_id: modal.booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              method: "razorpay",
            });
            setModal({ type: "invoice", booking: modal.booking, data });
            load();
            toast("Payment verified via Razorpay!");
          } catch (ex) {
            fail(ex, "Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            toast("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        fail(null, response.error?.description || "Payment failed at Razorpay gateway");
      });
      rzp.open();
    } catch (ex) {
      fail(ex, "Payment initialization failed");
    } finally {
      setPayBusy(false);
    }
  };

  const completeMockPayment = async (channel = "upi") => {
    if (!mockSimulator) return;
    setPayBusy(true);
    try {
      const mockPayId = "pay_mock_" + Math.random().toString(36).substring(2, 9) + Date.now();
      const { data } = await api.post("/payments/verify", {
        booking_id: modal.booking.id,
        razorpay_order_id: mockSimulator.order_id,
        razorpay_payment_id: mockPayId,
        razorpay_signature: mockSimulator.mock_signature,
        method: `razorpay_${channel}`,
      });
      setMockSimulator(null);
      setModal({ type: "invoice", booking: modal.booking, data });
      load();
      toast("Payment verified successfully!");
    } catch (ex) {
      fail(ex, "Mock verification failed");
    } finally {
      setPayBusy(false);
    }
  };

  const rate = async () => {
    try {
      await api.post("/ratings", { booking_id: modal.booking.id, stars, comment });
      setModal(null);
      toast("Thank you for your review!");
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={
                "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
                (filter === k
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900")
              }
            >
              {tr(label)}
            </button>
          ))}
        </div>

        <Link to="/services" className="btn-primary-coop py-2 px-4 text-xs">
          <CalendarPlus className="h-3.5 w-3.5" />
          <span>{tr("Book New Service")}</span>
        </Link>
      </div>

      {bookings === null ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl border border-neutral-200 bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <ClipboardList className="h-9 w-9 text-neutral-400 mx-auto mb-3" />
          <p className="text-base font-bold text-neutral-900">No bookings in this view</p>
          <p className="text-xs text-neutral-500 mt-1">Book a verified cooperative professional whenever you need help.</p>
          <Link to="/services" className="btn-primary-coop mt-4 text-xs">
            <CalendarPlus className="h-4 w-4" /> Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs transition hover:border-neutral-300"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900">
                    <CategoryIcon name={b.service_name} className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-neutral-900">
                        {tService(b.service_name)}
                      </h3>
                      <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-600">
                        #{b.code}
                      </span>
                      {b.is_emergency && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                          <Siren className="h-3 w-3" /> Urgent
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
                      <span className="truncate">
                        {new Date(b.scheduled_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        · {b.address}
                      </span>
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
                      <User className="h-3.5 w-3.5 text-neutral-400" />
                      {b.worker_name ? (
                        <span>
                          Professional: <strong className="text-neutral-900">{b.worker_name}</strong> ({b.worker_phone})
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">Matching with nearby verified artisan…</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-1.5">
                  <StatusBadge status={b.status} />
                  <p className="font-display text-lg font-extrabold text-neutral-900">
                    {fmtINR(b.final_cost || b.estimated_cost)}
                  </p>
                  {b.paid && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 md:w-40 md:flex-col">
                  {b.status === "PENDING" && !b.worker_id && (
                    <button
                      onClick={() => openMatches(b)}
                      className="btn-secondary-coop w-full py-2 px-3 text-xs justify-center"
                    >
                      {t("findWorkers")}
                    </button>
                  )}
                  {["PENDING", "ACCEPTED"].includes(b.status) && (
                    <button
                      onClick={() => cancel(b)}
                      className="w-full rounded-lg border border-neutral-200 bg-white py-2 px-3 text-xs font-semibold text-neutral-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      {t("cancel")}
                    </button>
                  )}
                  {b.status === "COMPLETED" && !b.paid && (
                    <button
                      onClick={() => setModal({ type: "pay", booking: b })}
                      className="btn-primary-coop w-full py-2 px-3 text-xs justify-center"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>{tr("Pay Now")}</span>
                    </button>
                  )}
                  {b.status === "COMPLETED" && b.paid && !b.rated && (
                    <button
                      onClick={() => {
                        setStars(5);
                        setComment("");
                        setModal({ type: "rate", booking: b });
                      }}
                      className="w-full rounded-lg border border-amber-300 bg-amber-50 py-2 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition flex items-center justify-center gap-1"
                    >
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" /> Rate Service
                    </button>
                  )}
                </div>
              </div>

              <BookingTimeline status={b.status} />
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Matched Workers */}
      {modal?.type === "matches" && (
        <Modal
          title="Matched Cooperative Artisans"
          description="Ranked by verified skill, distance from you, and customer ratings."
          onClose={() => setModal(null)}
        >
          <div className="space-y-3">
            {modal.data.length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
                No active artisans available right now for this service.
              </div>
            )}
            {modal.data.map((w) => (
              <div
                key={w.profile_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-neutral-900 flex items-center gap-2">
                    {w.name}
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {Math.round(w.score * 100)}% Match
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    ★ {w.avg_rating} · {w.distance_km ?? "?"} km away · {fmtINR(w.hourly_rate)} · {w.jobs_done} jobs
                  </p>
                </div>
                <button
                  onClick={() => assign(modal.booking, w.user_id)}
                  className="btn-primary-coop py-1.5 px-3 text-xs"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Modal 2: Razorpay Payment */}
      {modal?.type === "pay" && !mockSimulator && (
        <Modal
          title={`Pay ${fmtINR(modal.booking.final_cost || modal.booking.estimated_cost)}`}
          description="90% goes straight to your artisan and 10% funds cooperative worker welfare."
          onClose={() => setModal(null)}
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-neutral-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Secured by Razorpay</span>
              </div>
              <span className="text-neutral-600 font-medium">UPI · Cards · Netbanking</span>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-neutral-700">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayMethod("razorpay")}
                  className={cn(
                    "rounded-xl border p-3.5 text-left transition",
                    payMethod === "razorpay"
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
                  )}
                >
                  <p className="text-xs font-bold">⚡ Pay Online (Razorpay)</p>
                  <p className={cn("mt-1 text-[11px]", payMethod === "razorpay" ? "text-neutral-300" : "text-neutral-500")}>
                    GPay, PhonePe, UPI QR, Cards
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod("cash")}
                  className={cn(
                    "rounded-xl border p-3.5 text-left transition",
                    payMethod === "cash"
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
                  )}
                >
                  <p className="text-xs font-bold">💵 Cash on Site</p>
                  <p className={cn("mt-1 text-[11px]", payMethod === "cash" ? "text-neutral-300" : "text-neutral-500")}>
                    Pay directly to the worker
                  </p>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Total Service Bill</span>
                <span className="font-bold text-neutral-900">{fmtINR(modal.booking.final_cost || modal.booking.estimated_cost)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Direct Artisan Payout (90%)</span>
                <span className="font-semibold">{fmtINR((modal.booking.final_cost || modal.booking.estimated_cost) * 0.9)}</span>
              </div>
              <div className="flex justify-between text-neutral-500 border-t border-neutral-200 pt-1.5">
                <span>Worker Welfare & Insurance (10%)</span>
                <span>{fmtINR((modal.booking.final_cost || modal.booking.estimated_cost) * 0.1)}</span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={payBusy}
              className="btn-primary-coop w-full justify-center py-3 text-sm"
            >
              {payBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{payMethod === "cash" ? "Confirm Cash Payment" : "Proceed to Razorpay Checkout →"}</span>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal 2b: Razorpay Sandbox Test Simulator */}
      {mockSimulator && (
        <Modal
          title="Razorpay Test Checkout"
          description="Interactive sandbox mode for college/demo testing. Add real Razorpay keys in .env to switch to live popup."
          onClose={() => setMockSimulator(null)}
        >
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="font-bold text-neutral-900 flex items-center gap-2 text-xs">
                <Sparkles className="h-4 w-4 text-neutral-700" />
                Order #{mockSimulator.order_id}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Amount: <strong className="text-neutral-900">{fmtINR(mockSimulator.amount)}</strong> · {mockSimulator.service_name}
              </p>
            </div>

            <p className="text-xs font-semibold text-neutral-700">Choose a payment option to complete:</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => completeMockPayment("upi")}
                disabled={payBusy}
                className="btn-primary-coop py-3 text-xs justify-center"
              >
                📱 Pay via UPI (GPay)
              </button>
              <button
                type="button"
                onClick={() => completeMockPayment("card")}
                disabled={payBusy}
                className="btn-secondary-coop py-3 text-xs justify-center"
              >
                💳 Pay via Card
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 3: Receipt */}
      {modal?.type === "invoice" && (
        <Modal title={`Payment Receipt #${modal.data.invoice_no}`} onClose={() => setModal(null)}>
          <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700">
            <div className="flex justify-between items-center">
              <span>Amount Paid ({modal.data.method.toUpperCase()})</span>
              <strong className="text-neutral-900 text-base">{fmtINR(modal.data.amount)}</strong>
            </div>
            {modal.data.transaction_id && (
              <div className="flex justify-between border-t border-neutral-200 pt-2">
                <span className="text-neutral-500">Transaction ID</span>
                <span className="font-mono font-semibold text-neutral-900">{modal.data.transaction_id}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-emerald-700">
              <span>Artisan Direct Payout (90%)</span>
              <strong>{fmtINR(modal.data.worker_payout)}</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Co-op Welfare Fund (10%)</span>
              <strong>{fmtINR(modal.data.coop_fee)}</strong>
            </div>
          </div>
          <button onClick={() => setModal(null)} className="btn-primary-coop mt-4 w-full justify-center py-2.5 text-xs">
            Done
          </button>
        </Modal>
      )}

      {/* Modal 4: Rate Worker */}
      {modal?.type === "rate" && (
        <Modal title="Rate Your Experience" description="Your feedback helps reward great professionals." onClose={() => setModal(null)}>
          <div className="flex justify-center py-2">
            <Stars value={stars} onChange={setStars} className="h-8 w-8 text-amber-400" />
          </div>
          <textarea
            className="mt-4 w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400"
            rows={3}
            maxLength={2000}
            placeholder="Share a quick review about punctuality, quality, and professionalism..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={rate} className="btn-primary-coop mt-4 w-full justify-center py-2.5 text-sm">
            Submit Review
          </button>
        </Modal>
      )}
    </CustomerShell>
  );
}
