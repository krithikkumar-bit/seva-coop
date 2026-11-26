import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  HardHat,
  HeartHandshake,
  IndianRupee,
  Loader2,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useLang } from "../i18n";
import Brand from "../components/Brand";
import LangSelect from "../components/LangSelect";
import { cn, extractApiError, FALLBACK_SERVICES } from "../lib/cn";

const home = (role) =>
  role === "admin" ? "/admin" : role === "worker" ? "/worker" : "/dashboard";

function safeRedirectPath(from, role) {
  if (
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    !from.includes("\\")
  ) {
    return from;
  }
  return home(role);
}

export default function AuthPage({ mode = "login" }) {
  const { tr } = useLang();
  const { user } = useAuth();
  const nav = useNavigate();
  const [activeRole, setActiveRole] = useState("customer");

  if (user) return <Navigate to={home(user.role)} replace />;

  const benefits = [
    {
      icon: ShieldCheck,
      title: tr("Verified Local Professionals"),
      desc: tr("Background-checked artisans registered under verified Labour Cooperatives."),
    },
    {
      icon: IndianRupee,
      title: tr("90% Direct Worker Payout"),
      desc: tr("Every rupee supports fair worker wages without middleman commissions."),
    },
    {
      icon: HeartHandshake,
      title: tr("Welfare & Insurance Included"),
      desc: tr("10% cooperative reserve covers accident insurance and family healthcare."),
    },
  ];

  const roles = [
    { key: "customer", label: tr("Customer"), hint: tr("Book services"), icon: User },
    { key: "worker", label: tr("Service Partner"), hint: tr("Accept jobs & earn"), icon: HardHat },
    { key: "admin", label: tr("Coordinator"), hint: tr("Manage society"), icon: Shield },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAFAFA] text-neutral-900">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <Brand />
          </Link>

          <div className="flex items-center gap-3">
            <LangSelect />
            <Link to="/" className="btn-secondary-coop py-2 px-3.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{tr("Back to Home")}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Panel */}
          <div className="hidden lg:col-span-5 lg:flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-7 shadow-card">
            <div>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800">
                {tr("SevaCoop Member Portal")}
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold text-neutral-900 leading-tight">
                {tr("Welcome to SevaCoop")}
              </h2>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                {tr("Sign in or register to book trusted home services or manage your work.")}
              </p>
            </div>

            <div className="space-y-4 border-t border-neutral-100 pt-5">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 shrink-0">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">{b.title}</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7 w-full rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-glass">
            <div className="mb-6">
              <p className="text-xs font-bold text-neutral-500 mb-2.5">
                {tr("Select account type")}
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {roles.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeRole === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveRole(tab.key)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all",
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 mb-1.5", active ? "text-white" : "text-neutral-500")} />
                      <span className="text-xs sm:text-sm font-bold">{tab.label}</span>
                      <span className={cn("hidden sm:block text-[11px] mt-0.5", active ? "text-neutral-300" : "text-neutral-500")}>{tab.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeRole !== "admin" && (
              <div className="mb-6 flex rounded-lg border border-neutral-200 bg-neutral-100 p-1">
                <button
                  type="button"
                  onClick={() => nav("/login")}
                  className={cn(
                    "flex-1 rounded-md py-2 text-xs sm:text-sm font-semibold transition",
                    mode === "login"
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  )}
                >
                  {tr("Sign In")}
                </button>
                <button
                  type="button"
                  onClick={() => nav("/register")}
                  className={cn(
                    "flex-1 rounded-md py-2 text-xs sm:text-sm font-semibold transition",
                    mode === "register"
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  )}
                >
                  {tr("Create Account")}
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${activeRole}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
              >
                {mode === "login" || activeRole === "admin" ? (
                  <RoleLoginForm role={activeRole} onSwitchRole={setActiveRole} />
                ) : (
                  <RoleRegisterForm role={activeRole} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function RoleLoginForm({ role, onSwitchRole }) {
  const { t, tr } = useLang();
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const u = await login(email, password, role);
      nav(safeRedirectPath(loc.state?.from, u.role), { replace: true });
    } catch (ex) {
      setErr(extractApiError(ex, "Invalid email or password. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const roleLabel =
    role === "admin" ? tr("Coordinator") : role === "worker" ? tr("Service Partner") : tr("Customer");

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700 flex flex-col gap-2">
          <span>{err}</span>
          {onSwitchRole && err.includes("ARTISAN") && role !== "worker" && (
            <button
              type="button"
              onClick={() => onSwitchRole("worker")}
              className="self-start rounded-lg bg-white border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              {tr("Switch to Service Partner Login →")}
            </button>
          )}
          {onSwitchRole && err.includes("CUSTOMER") && role !== "customer" && (
            <button
              type="button"
              onClick={() => onSwitchRole("customer")}
              className="self-start rounded-lg bg-white border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              {tr("Switch to Customer Login →")}
            </button>
          )}
          {onSwitchRole && err.includes("FEDERATION") && role !== "admin" && (
            <button
              type="button"
              onClick={() => onSwitchRole("admin")}
              className="self-start rounded-lg bg-white border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              {tr("Switch to Coordinator Login →")}
            </button>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-neutral-700">
          {tr("Email Address")}
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-neutral-700">
          {tr("Password")}
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            placeholder={tr("Enter your password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-300 bg-white pl-3.5 pr-10 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="btn-primary-coop w-full py-3 justify-center text-sm"
      >
        {busy ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{tr("Signing in…")}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>{tr("Login as")} {roleLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </button>
    </form>
  );
}

function RoleRegisterForm({ role }) {
  const { t, tr, tService, lang } = useLang();
  const { register } = useAuth();
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    bio: "",
    id_proof_no: "",
    experience_years: 2,
    hourly_rate: 350,
    lat: 28.6139,
    lng: 77.2090,
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    api.get("/services")
      .then((r) => setServices(Array.isArray(r.data) && r.data.length > 0 ? r.data : FALLBACK_SERVICES))
      .catch(() => setServices(FALLBACK_SERVICES));
  }, []);

  const toggleSkill = (name) =>
    setSkills((s) =>
      s.includes(name) ? s.filter((x) => x !== name) : [...s, name]
    );

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (role === "worker" && skills.length === 0) {
      return setErr(tr("Please select at least one trade skill."));
    }

    setBusy(true);
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role,
        language: lang,
        ...(role === "worker"
          ? {
              address: form.address,
              bio: form.bio,
              id_proof_no: form.id_proof_no,
              skills,
              experience_years: Number(form.experience_years) || 0,
              hourly_rate: Number(form.hourly_rate) || 350,
              lat: Number(form.lat) || 28.6139,
              lng: Number(form.lng) || 77.2090,
            }
          : {}),
      };
      const u = await register(payload);
      nav(home(u.role), { replace: true });
    } catch (ex) {
      setErr(extractApiError(ex, "Registration could not be completed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700">{tr("Full Name")}</label>
          <input
            value={form.full_name}
            onChange={set("full_name")}
            placeholder="e.g. Ramesh Kumar"
            maxLength={100}
            required
            className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700">{tr("Phone Number")}</label>
          <input
            inputMode="tel"
            placeholder="e.g. 9876543210"
            value={form.phone}
            onChange={set("phone")}
            maxLength={20}
            required
            className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700">{tr("Email Address")}</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            maxLength={254}
            required
            className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700">
            {tr("Password (min 8 chars)")}
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder={tr("Create a strong password")}
              value={form.password}
              onChange={set("password")}
              required
              minLength={8}
              maxLength={72}
              className="w-full rounded-lg border border-neutral-300 bg-white pl-3.5 pr-10 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-neutral-700">
          {tr("Full Address")}
        </label>
        <input
          value={form.address}
          onChange={set("address")}
          placeholder={tr("House no, Street, Locality, City")}
          maxLength={500}
          required
          className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
        />
      </div>

      {role === "worker" && (
        <div className="space-y-3.5 border-t border-neutral-200 pt-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700">
              {tr("Select Your Skills:")}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto thin-scrollbar">
              {services.map((s) => {
                const on = skills.includes(s.name);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleSkill(s.name)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold border transition",
                      on
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300"
                    )}
                  >
                    {on && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                    {tService(s.name)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700">
                {tr("Experience (Years)")}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.experience_years}
                onChange={set("experience_years")}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700">
                {tr("Base Visit Rate (₹)")}
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={form.hourly_rate}
                onChange={set("hourly_rate")}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700">
              {tr("Government ID Proof No (Aadhaar / Voter ID)")}
            </label>
            <input
              value={form.id_proof_no}
              onChange={set("id_proof_no")}
              placeholder="e.g. COOP-ID-9921"
              maxLength={50}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="btn-primary-coop w-full py-3 justify-center mt-2"
      >
        {busy ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{tr("Creating account…")}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>{tr("Register as")} {role === "worker" ? tr("Service Partner") : tr("Customer")}</span>
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </button>
    </form>
  );
}
