import { useState, createContext, useContext } from "react";
import { cn } from "../lib/cn";

const BTN = {
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-500/30 shrink-0 [&_svg]:shrink-0",
  variant: {
    default:
      "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800",
    destructive: "bg-rose-600 text-white shadow-xs hover:bg-rose-700",
    outline:
      "border border-slate-300 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900",
    secondary: "bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100",
    ghost: "hover:bg-slate-100 text-slate-700",
    link: "text-emerald-600 underline-offset-4 hover:underline",
  },
  size: { default: "h-10 px-4 py-2", sm: "h-8 gap-1.5 px-3 text-xs", lg: "h-11 px-6 text-base", icon: "h-9 w-9" },
};

export function Button({ variant = "default", size = "default", className, as: Tag = "button", type, ...props }) {
  return <Tag type={Tag === "button" ? type || "button" : undefined} className={cn(BTN.base, BTN.variant[variant], BTN.size[size], className)} {...props} />;
}

export function Badge({ variant = "default", className, ...props }) {
  const v = {
    default: "border-emerald-200 bg-emerald-50 text-emerald-700",
    secondary: "border-slate-200 bg-slate-100 text-slate-700",
    outline: "border-slate-200 bg-white text-slate-700",
  }[variant];
  return <span className={cn("inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", v, className)} {...props} />;
}

const FIELD = "w-full min-w-0 rounded-xl border border-slate-300 bg-white text-slate-900 px-3.5 py-2 text-sm shadow-xs outline-none transition placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-[3px] focus-visible:ring-emerald-500/15 disabled:opacity-50 aria-[invalid=true]:border-rose-500";
export function Input({ className, ...props }) { return <input className={cn(FIELD, "h-10", className)} {...props} />; }
export function Textarea({ className, ...props }) { return <textarea className={cn(FIELD, "min-h-20 py-2.5", className)} {...props} />; }
export function Select({ className, children, ...props }) { return <select className={cn(FIELD, "h-10 pr-8", className)} {...props}>{children}</select>; }
export function Label({ className, ...props }) { return <label className={cn("block text-xs font-semibold text-slate-700 leading-none", className)} {...props} />; }

export function Field({ label, error, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function Card({ className, ...props }) { return <div className={cn("rounded-2xl border border-slate-200 bg-white shadow-card", className)} {...props} />; }
export function CardHeader({ className, ...props }) { return <div className={cn("flex gap-1.5 px-6 pt-6", !(className || "").includes("flex-row") && "flex-col", className)} {...props} />; }
export function CardTitle({ className, ...props }) { return <h3 className={cn("text-base font-bold text-slate-900 leading-tight tracking-tight", className)} {...props} />; }
export function CardDescription({ className, ...props }) { return <p className={cn("text-xs text-slate-500", className)} {...props} />; }
export function CardContent({ className, ...props }) { return <div className={cn("p-6", className)} {...props} />; }

export function Skeleton({ className }) { return <div className={cn("animate-pulse rounded-2xl bg-slate-200/70", className)} />; }

export function Avatar({ name = "?", className }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-sm", className)}>{initials}</span>
  );
}

export function Alert({ tone = "info", className, children }) {
  const t = {
    info: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  }[tone];
  return <div className={cn("rounded-xl border px-4 py-3 text-sm shadow-xs", t, className)}>{children}</div>;
}

export function Tabs({ value, onChange, items, className }) {
  return (
    <div className={cn("inline-flex h-10 w-full items-center rounded-xl bg-slate-100 p-1 border border-slate-200", className)}>
      {items.map(([k, label]) => (
        <button key={k} type="button" onClick={() => onChange(k)}
          className={cn("flex-1 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all", value === k ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900")}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
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
          <div key={i.id} className={cn("pointer-events-auto rounded-full border px-5 py-2.5 text-xs font-semibold shadow-lg backdrop-blur-xl",
            i.tone === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-white text-emerald-800")}>
            {i.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
