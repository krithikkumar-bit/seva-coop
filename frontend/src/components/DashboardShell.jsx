import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import Brand from "./Brand";
import LangSelect from "./LangSelect";
import { Avatar } from "./ui";
import { useAuth } from "../AuthContext";
import { useLang } from "../i18n";
import { cn } from "../lib/cn";

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
      ? tr("Co-op Coordinator")
      : user?.role === "worker"
      ? tr("Service Partner")
      : tr("Customer");

  const roleColor =
    user?.role === "admin"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : user?.role === "worker"
      ? "border-violet-200 bg-violet-50 text-violet-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  const sidebar = (
    <div className="flex h-full flex-col text-neutral-700">
      <div className="px-5 pb-4 pt-5 border-b border-neutral-100">
        <Link to="/" className="block">
          <Brand />
        </Link>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>{roleTag}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
        {navItems.map((item) => {
          const isCurrent = active === item.key;
          const cls = cn(
            "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
            isCurrent
              ? "bg-neutral-900 text-white font-semibold shadow-xs"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          );
          const inner = (
            <>
              <span className={isCurrent ? "text-white" : "text-neutral-400"}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
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

        <div className="pt-4 mt-4 border-t border-neutral-100">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
          >
            <Home className="h-4 w-4 text-neutral-400" />
            <span>{tr("Public Home")}</span>
          </Link>
        </div>
      </nav>

      <div className="border-t border-neutral-100 p-4 bg-neutral-50 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <Avatar name={user?.full_name} className="h-9 w-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {user?.full_name}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {user?.phone || user?.email}
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
            title={t("logout")}
            aria-label={t("logout")}
            onClick={() => {
              logout();
              nav("/");
            }}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen bg-[#FAFAFA] text-neutral-900">
      {/* Desktop Sidebar */}
      <aside className="relative z-30 hidden w-64 shrink-0 lg:block">
        <div className="sticky top-4 m-4 h-[calc(100vh-2rem)] rounded-2xl border border-neutral-200 bg-white shadow-card">
          {sidebar}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-neutral-200 bg-white shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-4 rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-20 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-4 z-30 mx-4 mt-4 flex h-14 items-center gap-3 rounded-2xl border border-neutral-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <h1 className="truncate font-display text-base sm:text-lg font-bold text-neutral-900">
            {title}
          </h1>

          <div className="ml-auto flex items-center gap-2.5">
            {headerExtra}
            <LangSelect />
            <span
              className={cn(
                "hidden text-xs font-semibold px-3 py-1 border rounded-full sm:inline-flex items-center gap-1.5",
                roleColor
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {roleTag}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 pb-16 sm:p-6 lg:pb-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        <footer className="mt-auto border-t border-neutral-200 bg-white py-4 px-4 text-center text-xs text-neutral-500 sm:px-6">
          SevaCoop Cooperative Platform · Verified Doorstep Services · 90% Direct Worker Payout
        </footer>
      </div>
    </div>
  );
}
