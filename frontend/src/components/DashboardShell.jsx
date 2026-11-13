import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, Shield, Terminal, X, Zap } from "lucide-react";
import Brand from "./Brand";
import LangSelect from "./LangSelect";
import SceneToggle from "./SceneToggle";
import { Avatar, Badge, Button } from "./ui";
import { useAuth } from "../AuthContext";
import { useLang } from "../i18n";
import { cn, BRAND } from "../lib/cn";

export default function DashboardShell({
  navItems,
  active,
  onNavigate,
  title,
  headerExtra,
  children,
}) {
  const { user, logout } = useAuth();
  const { t, tr } = useLang();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const roleTag =
    user?.role === "admin"
      ? tr("FEDERATION ADMIN")
      : user?.role === "worker"
      ? tr("ARTISAN TERMINAL")
      : tr("CUSTOMER NODE");

  const roleColor =
    user?.role === "admin"
      ? "border-amber-500/40 bg-amber-950/40 text-amber-300"
      : user?.role === "worker"
      ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
      : "border-emerald-500/40 bg-emerald-950/40 text-emerald-300";

  const sidebar = (
    <div className="flex h-full flex-col text-slate-200">
      <div className="px-5 pb-4 pt-6 border-b border-white/10">
        <Link to="/" className="block">
          <Brand techno={true} />
        </Link>
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{tr("PORTAL ACTIVE")}</span>
          <span className="text-white/20">|</span>
          <span className="text-emerald-400">SIH26089</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-4 font-mono text-xs">
        {navItems.map((item) => {
          const isCurrent = active === item.key;
          const cls = cn(
            "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200",
            isCurrent
              ? "border border-emerald-400/60 bg-emerald-950/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : "border border-transparent text-slate-400 hover:border-white/15 hover:bg-white/5 hover:text-white"
          );
          const inner = (
            <>
              <span className={isCurrent ? "text-emerald-400" : "text-slate-400"}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {isCurrent && (
                <span className="ml-auto flex h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              )}
            </>
          );
          return item.to ? (
            <Link
              key={item.key}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cls}
            >
              {inner}
            </Link>
          ) : (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onNavigate?.(item.key);
                setOpen(false);
              }}
              className={cls}
            >
              {inner}
            </button>
          );
        })}
      </nav>

      {/* User Status Card */}
      <div className="border-t border-white/10 p-4 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={user?.full_name} className="h-9 w-9 border border-white/20" />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0d0e12]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs font-bold text-white uppercase tracking-wide">
              {user?.full_name}
            </p>
            <p className="truncate font-mono text-[10px] text-slate-400">
              {user?.phone || user?.email}
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:border-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
            title={t("logout")}
            aria-label={t("logout")}
            onClick={() => {
              logout();
              nav("/");
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Sidebar for Desktop */}
      <aside className="relative z-30 hidden w-64 shrink-0 lg:block">
        <div className="sticky top-4 m-4 h-[calc(100vh-2rem)] rounded-2xl border border-white/15 bg-stoneblack/85 shadow-2xl backdrop-blur-2xl">
          {sidebar}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-white/15 bg-stoneblack shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-4 rounded-lg border border-white/15 p-1.5 text-slate-400 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main Dynamic Viewport */}
      <div className="relative z-20 flex min-w-0 flex-1 flex-col">
        {/* Sticky Top HUD Bar */}
        <header className="sticky top-4 z-30 mx-4 mt-4 flex h-14 items-center gap-3 rounded-2xl border border-white/15 bg-stoneblack/85 px-4 sm:px-6 backdrop-blur-2xl shadow-xl">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-slate-300 hover:text-white lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
            <h1 className="truncate font-display text-sm sm:text-base font-black uppercase tracking-wider text-white">
              {title}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {headerExtra}
            <SceneToggle />
            <LangSelect />
            <span
              className={cn(
                "hidden font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-lg sm:inline-flex items-center gap-1.5",
                roleColor
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
              {roleTag}
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 pb-20 sm:p-6 lg:pb-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        {/* Technical Footer Banner */}
        <footer className="mt-auto border-t border-white/5 py-4 px-4 text-center font-mono text-[10px] text-slate-400 uppercase tracking-widest sm:px-6">
          SEVACOOP PLATFORM COOPERATIVE · NCCT CERTIFIED PROTOCOL · 90% DIRECT REMITTANCE
        </footer>
      </div>
    </div>
  );
}
