import { BRAND } from "../lib/cn";
import { useLang } from "../i18n";

export default function Brand({ compact = false }) {
  const { t } = useLang();

  return (
    <div className="flex min-w-0 items-center gap-2.5 select-none group">
      {/* Clean SevaCoop monogram square */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-xs transition-transform group-hover:scale-105">
        <span className="font-display text-sm font-extrabold tracking-tight">SC</span>
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate font-display text-[17px] font-extrabold tracking-tight text-neutral-900">
          {BRAND.name}
        </p>
        {!compact && (
          <p className="hidden truncate text-[10px] font-medium text-neutral-500 sm:block">
            {t("tagline")}
          </p>
        )}
      </div>
    </div>
  );
}
