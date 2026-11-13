import { Languages } from "lucide-react";
import { useLang } from "../i18n";

export default function LangSelect({ dark = true }) {
  const { lang, setLang, LANGUAGES } = useLang();
  return (
    <div
      className={
        "flex items-center gap-1.5 border px-2.5 py-1.5 font-mono transition " +
        (dark
          ? "border-white/15 bg-black/60 text-slate-200 hover:border-white/40"
          : "rounded-md bg-card text-slate-800")
      }
    >
      <Languages className={"h-3.5 w-3.5 shrink-0 " + (dark ? "text-emerald-400" : "text-muted-foreground")} />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Language"
        className={
          "bg-transparent text-xs font-medium outline-none cursor-pointer " +
          (dark ? "text-slate-100" : "")
        }
      >
        {LANGUAGES.map((l) => (
          <option
            key={l.code}
            value={l.code}
            className={dark ? "bg-[#0d0e12] text-white" : "bg-white text-slate-900"}
          >
            {l.native}
          </option>
        ))}
      </select>
    </div>
  );
}
