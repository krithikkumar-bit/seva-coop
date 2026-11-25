import { Languages } from "lucide-react";
import { useLang } from "../i18n";

export default function LangSelect() {
  const { lang, setLang, LANGUAGES } = useLang();
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs hover:border-slate-300 transition">
      <Languages className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Language"
        className="border-none bg-transparent p-0 text-xs font-medium text-slate-700 outline-none focus:ring-0 cursor-pointer"
      >
        {LANGUAGES.map((l) => (
          <option
            key={l.code}
            value={l.code}
            className="bg-white text-slate-900"
          >
            {l.native}
          </option>
        ))}
      </select>
    </div>
  );
}
