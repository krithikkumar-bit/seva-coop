/* Premium UI kit mirroring shadcn components with adaptive glassmorphism */
import { useState, createContext, useContext } from "react";
import { cn } from "../lib/cn";

const BTN = {
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-500/40 shrink-0 [&_svg]:shrink-0",
  variant: {
    default:
      "bg-gradient-to-r from-emerald-700 to-teal-800 text-amber-50 shadow-[0_10px_24px_rgba(15,118,110,0.35)] hover:from-emerald-600 hover:to-teal-700 hover:shadow-[0_12px_28px_rgba(15,118,110,0.45)]",
    destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
    outline:
      "border border-white/30 bg-white/20 text-current shadow-xs backdrop-blur-md hover:bg-white/40 hover:border-white/50",
    secondary: "bg-emerald-950/40 border border-emerald-500/20 text-emerald-100 shadow-xs hover:bg-emerald-900/50",
    ghost: "hover:bg-white/15 text-current",
    link: "text-emerald-400 underline-offset-4 hover:underline",
  },
  size: { default: "h-9 px-4 py-2", sm: "h-8 gap-1.5 px-3 text-xs", lg: "h-11 px-6 text-base", icon: "h-9 w-9" },
};

export function Button({ variant = "default", size = "default", className, as: Tag = "button", type, ...props }) {
  return <Tag type={Tag === "button" ? type || "button" : undefined} className={cn(BTN.base, BTN.variant[variant], BTN.size[size], className)} {...props} />;
}

export function Badge({ variant = "default", className, ...props }) {
  const v = {
    default: "border-emerald-500/40 bg-emerald-950/50 text-emerald-300",
    secondary: "border-white/20 bg-stoneblack-surface text-slate-200",
    outline: "border-white/15 bg-black/40 text-slate-300",
  }[variant];
  return <span className={cn("inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-semibold", v, className)} {...props} />;
}

const FIELD = "w-full min-w-0 rounded-xl border border-white/15 bg-stoneblack/90 text-white px-3.5 py-1.5 text-sm shadow-xs outline-none transition placeholder:text-slate-500 focus-visible:border-white focus-visible:ring-[2px] focus-visible:ring-white/20 disabled:opacity-50 aria-[invalid=true]:border-destructive";
export function Input({ className, ...props }) { return <input className={cn(FIELD, "h-10", className)} {...props} />; }
export function Textarea({ className, ...props }) { return <textarea className={cn(FIELD, "min-h-20 py-2.5", className)} {...props} />; }
export function Select({ className, children, ...props }) { return <select className={cn(FIELD, "h-10 pr-8", className)} {...props}>{children}</select>; }
export function Label({ className, ...props }) { return <label className={cn("block text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-none", className)} {...props} />; }

export function Field({ label, error, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function Card({ className, ...props }) { return <div className={cn("glass-panel rounded-3xl", className)} {...props} />; }
export function CardHeader({ className, ...props }) { return <div className={cn("flex gap-1.5 px-6 pt-6", !(className || "").includes("flex-row") && "flex-col", className)} {...props} />; }
export function CardTitle({ className, ...props }) { return <h3 className={cn("text-base font-semibold leading-tight tracking-tight", className)} {...props} />; }
export function CardDescription({ className, ...props }) { return <p className={cn("text-xs text-muted-foreground", className)} {...props} />; }
export function CardContent({ className, ...props }) { return <div className={cn("p-6", className)} {...props} />; }

export function Skeleton({ className }) { return <div className={cn("animate-pulse rounded-2xl bg-white/20", className)} />; }

export function Avatar({ name = "?", className }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-bold text-amber-50 shadow-md", className)}>{initials}</span>
  );
}

export function Alert({ tone = "info", className, children }) {
  const t = {
    info: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  }[tone];
  return <div className={cn("rounded-2xl border px-4 py-3 text-sm backdrop-blur-md shadow-xs", t, className)}>{children}</div>;
}

export function Tabs({ value, onChange, items, className }) {
  return (
    <div className={cn("inline-flex h-10 w-full items-center rounded-full bg-slate-100 p-1 border border-slate-200/80 backdrop-blur-md", className)}>
      {items.map(([k, label]) => (
        <button key={k} type="button" onClick={() => onChange(k)}
          className={cn("flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition-all", value === k ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900")}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="glass-panel rounded-3xl border-dashed border-slate-300 p-10 text-center">
      {Icon && <Icon className="mx-auto h-9 w-9 text-emerald-600/60" />}
      <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
      {children && <div className="mt-1 text-xs text-slate-500">{children}</div>}
    </div>
  );
}

/* ----------------------------- toast ----------------------------- */
const ToastCtx = createContext({ toast: () => {} });
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = (message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, message, tone }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3500);
  };
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {items.map((i) => (
          <div key={i.id} className={cn("pointer-events-auto rounded-full border px-5 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2",
            i.tone === "error" ? "border-rose-300 bg-rose-50 text-rose-800" : "border-emerald-300 bg-emerald-50 text-emerald-900")}>
            {i.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
