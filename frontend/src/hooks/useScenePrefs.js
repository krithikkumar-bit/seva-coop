import { useEffect, useState } from "react";

function readPrefs() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const cores = navigator.hardwareConcurrency || 4;
  const lowPower = reduced || saveData || (cores <= 4 && mobile);
  const forced = localStorage.getItem("seva-3d");
  const enabled = forced === "off" ? false : forced === "on" ? true : !reduced;
  return { reduced, mobile, lowPower, enabled };
}

export default function useScenePrefs() {
  const [prefs, setPrefs] = useState(() =>
    typeof window === "undefined"
      ? { reduced: false, mobile: false, lowPower: false, enabled: true }
      : readPrefs(),
  );

  useEffect(() => {
    const apply = () => setPrefs(readPrefs());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia("(max-width: 768px)");
    mq.addEventListener("change", apply);
    width.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    window.addEventListener("seva-3d", apply);
    return () => {
      mq.removeEventListener("change", apply);
      width.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
      window.removeEventListener("seva-3d", apply);
    };
  }, []);

  return prefs;
}
