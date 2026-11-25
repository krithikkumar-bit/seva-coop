import { ShieldCheck } from "lucide-react";
import { BRAND } from "../lib/cn";
import { useLang } from "../i18n";

export default function Brand({ compact = false }) {
  const { t } = useLang();

  return (
    <div className="flex min-w-0 items-center gap-2.5 select-none group">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm transition-transform group-hover:scale-105">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate font-display text-base font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
          {BRAND.name}
        </p>
        {!compact && (
          <p className="hidden truncate text-[11px] font-medium text-slate-500 sm:block">
            {t("tagline")}
          </p>
        )}
      </div>
    </div>
  );
}
