import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Background3DWorld:
 * Ambient 3D Nexbot robot background rendered purely from local @splinetool/runtime
 * and local model assets (no unpinned remote CDN scripts or third-party iframes).
 */
export default function Background3DWorld({
  sceneUrl = "/models/nexbot.splinecode",
}) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [cursorActive, setCursorActive] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const safeSceneUrl = sceneUrl.startsWith("/") && !sceneUrl.startsWith("//")
    ? sceneUrl
    : "/models/nexbot.splinecode";

  useEffect(() => {
    let disposed = false;

    async function initSplineRuntime() {
      if (!canvasRef.current || loadFailed) return;

      try {
        const localMod = await import("@splinetool/runtime");
        const ApplicationClass = localMod?.Application;
        if (disposed || !canvasRef.current || !ApplicationClass) return;

        const app = new ApplicationClass(canvasRef.current, {
          htmlContentMode: "inline",
        });
        appRef.current = app;

        await app.load(safeSceneUrl);

        if (disposed) {
          try {
            app.dispose();
          } catch (_) {}
          return;
        }

        if (typeof app.setBackgroundColor === "function") {
          app.setBackgroundColor("#0d0e12");
        }

        setIsLoaded(true);
      } catch (err) {
        console.warn("Spline native canvas load failed, using static grid fallback:", err);
        if (!disposed) {
          setLoadFailed(true);
        }
      }
    }

    if (visible && !loadFailed) {
      initSplineRuntime();
    }

    return () => {
      disposed = true;
      if (appRef.current) {
        try {
          appRef.current.dispose();
        } catch (_) {}
        appRef.current = null;
      }
      setIsLoaded(false);
    };
  }, [visible, loadFailed, safeSceneUrl]);

  useEffect(() => {
    if (!isLoaded || loadFailed || !visible) return;
    let timer;
    const handlePointerMove = (e) => {
      setCursorActive(true);
      clearTimeout(timer);
      timer = setTimeout(() => setCursorActive(false), 1500);

      if (canvasRef.current && e.target !== canvasRef.current) {
        try {
          const synth = new PointerEvent("pointermove", {
            clientX: e.clientX,
            clientY: e.clientY,
            movementX: e.movementX,
            movementY: e.movementY,
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            pointerType: "mouse",
            isPrimary: true,
          });
          canvasRef.current.dispatchEvent(synth);
        } catch (_) {}
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      clearTimeout(timer);
    };
  }, [isLoaded, loadFailed, visible]);

  return (
    <div
      data-spline-passthrough=""
      className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-none bg-grid-stoneblack"
      aria-hidden="true"
    >
      {visible && !loadFailed && (
        <div
          data-spline-passthrough=""
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <canvas
            ref={canvasRef}
            data-spline-passthrough=""
            id="canvas3d"
            className="w-full h-full block pointer-events-auto"
            style={{ background: "#0d0e12" }}
          />
        </div>
      )}

      <div
        data-spline-passthrough=""
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0d0e12]/60 via-[#0d0e12]/15 to-[#0d0e12]/85 radial-vignette"
        aria-hidden="true"
      />

      <div
        data-spline-passthrough=""
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0d0e12] to-transparent"
        aria-hidden="true"
      />

      <div className="pointer-events-auto absolute bottom-4 right-4 z-30 hidden sm:flex items-center gap-2 border border-white/10 bg-stoneblack/85 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 backdrop-blur-md shadow-lg">
        <span
          className={`flex h-1.5 w-1.5 rounded-full ${
            isLoaded
              ? cursorActive
                ? "bg-cyan-400 animate-ping"
                : "bg-emerald-400 animate-pulse"
              : "bg-amber-400"
          }`}
        />
        <span className="font-semibold text-slate-200">NEXBOT 3D</span>
        <span className="text-[9px] text-emerald-400">
          [{loadFailed ? "GRID" : cursorActive ? "TRACKING" : isLoaded ? "ONLINE" : "INITIALIZING"}]
        </span>
        <div className="h-3 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="text-slate-300 hover:text-white transition flex items-center gap-1"
          title={visible ? "Hide 3D robot background" : "Show 3D robot background"}
        >
          {visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          <span>{visible ? "ON" : "OFF"}</span>
        </button>
      </div>
    </div>
  );
}
