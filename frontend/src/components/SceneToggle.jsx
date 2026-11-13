import { Box, Square } from "lucide-react";
import useScenePrefs from "../hooks/useScenePrefs";

export default function SceneToggle({ dark = false }) {
  const prefs = useScenePrefs();
  const on = prefs.enabled;
  const toggle = () => {
    localStorage.setItem("seva-3d", on ? "off" : "on");
    window.dispatchEvent(new Event("seva-3d"));
  };
  return (
    <button
      type="button"
      onClick={toggle}
      title={on ? "Disable 3D backdrop" : "Enable 3D backdrop"}
      aria-pressed={on}
      className={
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition " +
        (dark
          ? "border-white/15 bg-white/10 text-amber-100 hover:bg-white/15"
          : "border-white/70 bg-white/60 text-emerald-900 hover:bg-white")
      }
    >
      {on ? <Box className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{on ? "3D" : "2D"}</span>
    </button>
  );
}
