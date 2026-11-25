import { Languages } from "lucide-react";
import { useLang } from "../i18n";

export default function LangSelect() {
  const { lang, setLang, LANGUAGES } = useLang();
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 hover:border-neutral-300 transition">
      <Languages className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Language"
        className="border-none bg-transparent p-0 text-xs font-medium text-neutral-800 outline-none focus:ring-0 cursor-pointer"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-white text-neutral-900">
            {l.native}
          </option>
        ))}
      </select>
    </div>
  );
}
