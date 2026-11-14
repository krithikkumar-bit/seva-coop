import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HardHat,
  HeartHandshake,
  IndianRupee,
  KeyRound,
  Loader2,
  Lock,
  MapPin,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  User,
  Users,
  Zap,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useLang } from "../i18n";
import Brand from "../components/Brand";
import LangSelect from "../components/LangSelect";
import CategoryIcon from "../components/CategoryIcon";
import { Alert, Button, Field, Input, Textarea } from "../components/ui";
import { cn, extractApiError } from "../lib/cn";

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
  const [activeRole, setActiveRole] = useState("customer"); // customer | worker | admin

  if (user) return <Navigate to={home(user.role)} replace />;

  const benefits = [
    {
      icon: ShieldCheck,
      title: tr("VERIFIED CO-OP ARTISANS"),
      desc: tr("Verified competence and society trade skills"),
    },
    {
      icon: IndianRupee,
      title: tr("90% DIRECT REMITTANCE"),
      desc: tr("Direct digital payment straight into verified worker bank account. Zero delays."),
    },
    {
      icon: HeartHandshake,
      title: tr("DEMOCRATIC GOVERNANCE"),
      desc: tr("Democratically pooled for accident insurance, medical claims, and child education."),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100 selection:bg-emerald-500 selection:text-black">
      <div className="relative z-10 flex min-h-screen flex-col pointer-events-none">
        {/* Top Navigation HUD */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-stoneblack/90 backdrop-blur-md pointer-events-auto">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-3">
              <Brand techno={true} />
            </Link>

            <div className="flex items-center gap-3">
              <LangSelect />
              <Link
                to="/"
                className="btn-tech-outline group text-xs py-1.5 px-3"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                <span>{tr("RETURN HOME")}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Center Portal Content */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 pointer-events-none">
          <div className="w-full max-w-6xl grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            {/* Left HUD Architecture Column */}
            <div className="hidden lg:col-span-5 lg:flex flex-col gap-6 pointer-events-auto">
              <div className="border border-white/15 bg-black/60 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 tracking-[0.2em] uppercase">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>{tr("SEVA PROTOCOL · GATEWAY NODE")}</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-black uppercase text-white leading-tight">
                  {tr("Access The Cooperative")} <span className="text-emerald-400">{tr("Network.")}</span>
                </h2>
                <p className="mt-2 font-mono text-xs text-slate-400 uppercase leading-relaxed">
                  {tr("Decentralized dispatch terminal engineered for dignified livelihood, transparent algorithms, and direct remittances.")}
                </p>

                <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
                  {benefits.map((b) => (
                    <div key={b.title} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center border border-white/15 bg-stoneblack text-emerald-400 shrink-0">
                        <b.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                          {b.title}
                        </h4>
                        <p className="font-mono text-[11px] text-slate-400 uppercase leading-tight mt-0.5">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol Specs Badge */}
              <div className="border border-white/10 bg-black/40 p-4 font-mono text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>SECURITY: SHA-256 JWT</span>
                <span className="text-emerald-400">STATUS: OPERATIONAL</span>
              </div>
            </div>

            {/* Right Form Card */}
            <div className="lg:col-span-7 w-full pointer-events-auto">
              <div className="border border-white/20 bg-stoneblack/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
                {/* 3 Role Selection Tabs */}
                <div className="mb-6">
                  <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-2">
                    {tr("SELECT PORTAL NODE:")}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "customer", label: tr("CUSTOMER"), icon: User },
                      { key: "worker", label: tr("ARTISAN"), icon: HardHat },
                      { key: "admin", label: tr("FEDERATION"), icon: Shield },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = activeRole === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveRole(tab.key)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 border p-2.5 sm:p-3 font-mono text-xs font-bold uppercase tracking-wider transition-all",
                            active
                              ? "border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                              : "border-white/15 bg-black/40 text-slate-400 hover:border-white/40 hover:text-white"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Login vs Register Toggle (Only Customer & Worker can register) */}
                {activeRole !== "admin" && (
                  <div className="mb-6 flex border border-white/15 bg-black/40 p-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => nav("/login")}
                      className={cn(
                        "flex-1 py-1.5 uppercase font-bold tracking-wider transition",
                        mode === "login"
                          ? "bg-white text-stoneblack"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {tr("[ LOGIN ]")}
                    </button>
                    <button
                      type="button"
                      onClick={() => nav("/register")}
                      className={cn(
                        "flex-1 py-1.5 uppercase font-bold tracking-wider transition",
                        mode === "register"
                          ? "bg-white text-stoneblack"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {tr("[ REGISTER ]")}
                    </button>
                  </div>
                )}

                {/* Form Component */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${mode}-${activeRole}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
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
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================================
   ROLE LOGIN FORM COMPONENT
   ========================================================================= */
function RoleLoginForm({ role, onSwitchRole }) {
  const { t, tr } = useLang();
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setErr(extractApiError(ex, "Authentication failed. Please verify credentials."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && (
        <div className="border border-rose-500/40 bg-rose-950/30 p-3 font-mono text-xs text-rose-300 flex flex-col gap-2">
          <span>{err}</span>
          {onSwitchRole && err.includes("ARTISAN") && role !== "worker" && (
            <button
              type="button"
              onClick={() => onSwitchRole("worker")}
              className="btn-tech-outline self-start text-[10px] py-1 px-2.5 mt-1"
            >
              [ SWITCH TO ARTISAN PORTAL ]
            </button>
          )}
          {onSwitchRole && err.includes("CUSTOMER") && role !== "customer" && (
            <button
              type="button"
              onClick={() => onSwitchRole("customer")}
              className="btn-tech-outline self-start text-[10px] py-1 px-2.5 mt-1"
            >
              [ SWITCH TO CUSTOMER PORTAL ]
            </button>
          )}
          {onSwitchRole && err.includes("FEDERATION") && role !== "admin" && (
            <button
              type="button"
              onClick={() => onSwitchRole("admin")}
              className="btn-tech-outline self-start text-[10px] py-1 px-2.5 mt-1"
            >
              [ SWITCH TO FEDERATION PORTAL ]
            </button>
          )}
        </div>
      )}

      <div className="space-y-1">
        <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
          {tr("Email / Identifier")}
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="your.email@sevacoop.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 font-mono text-xs text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
          {tr("Access Password")}
        </label>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 font-mono text-xs text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full btn-tech-outline py-3 text-center justify-center font-bold"
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{tr("AUTHENTICATING NODE…")}</span>
          </span>
        ) : (
          <span>{t("login")} ({role === "admin" ? tr("FEDERATION") : role === "worker" ? tr("ARTISAN") : tr("CUSTOMER")}) →</span>
        )}
      </button>
    </form>
  );
}

/* =========================================================================
   ROLE REGISTER FORM (CUSTOMER OR ARTISAN WORKER)
   ========================================================================= */
function RoleRegisterForm({ role }) {
  const { t, tr, tService, lang } = useLang();
  const { register } = useAuth();
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [skills, setSkills] = useState([]);
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
      .then((r) => setServices(r.data))
      .catch(() => {});
  }, []);

  const toggleSkill = (name) =>
    setSkills((s) =>
      s.includes(name) ? s.filter((x) => x !== name) : [...s, name]
    );

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (role === "worker" && skills.length === 0) {
      return setErr("Please select at least one primary trade skill.");
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
    <form onSubmit={submit} className="space-y-3.5">
      {err && (
        <div className="border border-rose-500/40 bg-rose-950/30 p-3 font-mono text-xs text-rose-300">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block font-mono text-[11px] font-bold uppercase text-slate-300">
            {tr("Full Name")}
          </label>
          <input
            value={form.full_name}
            onChange={set("full_name")}
            placeholder={t("name")}
            maxLength={100}
            required
            className="w-full border border-white/15 bg-black/60 px-3 py-2 font-mono text-xs text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="block font-mono text-[11px] font-bold uppercase text-slate-300">
            {tr("Contact Phone")}
          </label>
          <input
            inputMode="tel"
            placeholder={t("phone")}
            value={form.phone}
            onChange={set("phone")}
            maxLength={20}
            required
            className="w-full border border-white/15 bg-black/60 px-3 py-2 font-mono text-xs text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block font-mono text-[11px] font-bold uppercase text-slate-300">
            {tr("Email Address")}
          </label>
          <input
            type="email"
            placeholder="you@domain.com"
            value={form.email}
            onChange={set("email")}
            maxLength={254}
            required
            className="w-full border border-white/15 bg-black/60 px-3 py-2 font-mono text-xs text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="block font-mono text-[11px] font-bold uppercase text-slate-300">
            {t("password")}
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
            required
            minLength={8}
            maxLength={72}
            className="w-full border border-white/15 bg-black/60 px-3 py-2 font-mono text-xs text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block font-mono text-[11px] font-bold uppercase text-slate-300">
          {tr("Neighborhood / Service Address")}
        </label>
        <input
          value={form.address}
          onChange={set("address")}
          placeholder={t("address")}
          maxLength={500}
          required
          className="w-full border border-white/15 bg-black/60 px-3 py-2 font-mono text-xs text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
        />
      </div>

      {role === "worker" && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          <div className="space-y-1">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-300">
              {tr("Select Primary Trade Skills:")}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto thin-scrollbar">
              {services.map((s) => {
                const on = skills.includes(s.name);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleSkill(s.name)}
                    className={cn(
                      "font-mono text-[10px] px-2.5 py-1 uppercase border transition",
                      on
                        ? "border-emerald-400 bg-emerald-950/60 text-emerald-300 font-bold"
                        : "border-white/15 bg-black/40 text-slate-400 hover:border-white/40"
                    )}
                  >
                    {tService(s.name)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-mono text-[10px] font-bold uppercase text-slate-300">
                {tr("Experience (Years)")}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.experience_years}
                onChange={set("experience_years")}
                className="w-full border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono text-[10px] font-bold uppercase text-slate-300">
                {tr("Hourly Base Rate (₹)")}
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={form.hourly_rate}
                onChange={set("hourly_rate")}
                className="w-full border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-[10px] font-bold uppercase text-slate-300">
              {tr("Government ID Proof No (Aadhaar / Voter ID)")}
            </label>
            <input
              value={form.id_proof_no}
              onChange={set("id_proof_no")}
              placeholder="e.g. COOP-ID-9921"
              maxLength={50}
              required
              className="w-full border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-xs text-white placeholder:text-slate-600"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full btn-tech-outline py-2.5 text-center justify-center font-bold mt-2"
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{tr("INITIALIZING ACCOUNT…")}</span>
          </span>
        ) : (
          <span>{t("register")} ({role === "worker" ? tr("ARTISAN") : tr("CUSTOMER")}) →</span>
        )}
      </button>
    </form>
  );
}
