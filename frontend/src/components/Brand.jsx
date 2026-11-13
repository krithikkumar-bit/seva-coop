import { Shield, Sparkles } from "lucide-react";
import { BRAND } from "../lib/cn";
import { useLang } from "../i18n";

export default function Brand({ dark = true, compact = false, techno = true }) {
  const { t } = useLang();

  if (techno) {
    return (
      <div className="flex min-w-0 items-center gap-2.5 select-none group">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center border border-white/30 bg-stoneblack-surface shadow-[0_0_12px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-105 group-hover:border-white">
          {/* Cyber crosshair accents */}
          <div className="absolute -top-1 -left-1 h-1.5 w-1.5 border-t border-l border-white/60" />
          <div className="absolute -top-1 -right-1 h-1.5 w-1.5 border-t border-r border-white/60" />
          <div className="absolute -bottom-1 -left-1 h-1.5 w-1.5 border-b border-l border-white/60" />
          <div className="absolute -bottom-1 -right-1 h-1.5 w-1.5 border-b border-r border-white/60" />
          <span className="font-display text-xs font-black tracking-widest text-white">SC</span>
        </div>
        <div className="min-w-0 leading-tight">
          <p className="font-display text-sm font-black tracking-[0.16em] uppercase text-white group-hover:text-emerald-300 transition-colors">
            {BRAND.name}
          </p>
          {!compact && (
            <p className="hidden font-mono text-[9px] tracking-widest text-slate-400 uppercase sm:block">
              CO-OP GIG PROTOCOL
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stoneblack-surface border border-white/20 text-white">
        <Shield className="h-5 w-5 text-emerald-400" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate font-display text-base font-bold tracking-tight text-white">{BRAND.name}</p>
        {!compact && <p className="hidden truncate font-mono text-[10px] text-slate-400 sm:block">{t("tagline")}</p>}
      </div>
    </div>
  );
}
