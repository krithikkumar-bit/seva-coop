import React, { Component, Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import { useSceneData } from "./SceneStore";
import useScenePrefs from "../hooks/useScenePrefs";
import {
  SERVICE_OBJECT_MAP,
  LANDMARK_MAP,
  ROUTE_CAMERA_MAP,
  matchService,
} from "./sceneMap";
import CategoryIcon from "../components/CategoryIcon";
import { fmtINR } from "../lib/cn";
import { ArrowRight, BadgeCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FallbackSky } from "./SceneErrorFallback";

export default function SplineWorld() {
  const splineRef = useRef(null);
  const splineAppRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const prefs = useScenePrefs();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [currentRouteKey, setCurrentRouteKey] = useState("landing");

  const {
    hoveredObject,
    setHoveredObject,
    selectedServiceId,
    setSelectedServiceId,
    cameraSector,
    marketplaceSector,
    setSplineApp,
  } = useSceneData();

  // Helper to determine route key
  const getRouteKey = useCallback((pathname) => {
    if (pathname === "/") return "landing";
    if (pathname === "/services") return "services";
    if (pathname.startsWith("/book/")) return "book";
    if (pathname === "/login" || pathname === "/register") return "auth";
    if (pathname === "/dashboard" || pathname === "/bookings") return "customer";
    if (pathname.startsWith("/worker")) return "worker";
    if (pathname.startsWith("/admin")) return "admin";
    return "landing";
  }, []);

  // Update route camera & focus in the Spline world
  const applyRouteCamera = useCallback((routeKey, targetServiceKey = null) => {
    const app = splineAppRef.current;
    if (!app) return;

    try {
      // If targeting a specific service (e.g. /book/:id or hover on /services)
      if (targetServiceKey && SERVICE_OBJECT_MAP[targetServiceKey]) {
        const s = SERVICE_OBJECT_MAP[targetServiceKey];
        const glow = app.findObjectByName(s.glowObject);
        if (glow) {
          glow.visible = true;
          if (glow.scale) {
            glow.scale.x = 1.15;
            glow.scale.y = 1.15;
            glow.scale.z = 1.15;
          }
        }
        return;
      }

      // Reset hover glows visibility if resetting
      if (routeKey === "landing" || routeKey === "services") {
        Object.values(SERVICE_OBJECT_MAP).forEach((s) => {
          const g = app.findObjectByName(s.glowObject);
          if (g && g.scale) {
            g.scale.x = 1.0;
            g.scale.y = 1.0;
            g.scale.z = 1.0;
          }
        });
      }

      // Trigger landmark or camera adjustments
      const cfg = ROUTE_CAMERA_MAP[routeKey];
      if (cfg) {
        if (routeKey === "auth") {
          const hub = app.findObjectByName("Hub Entrance And Tower") || app.findObjectByName("SevaCoop_Central_Hub");
          if (hub) app.emitEvent?.("lookAt", hub.name);
        } else if (routeKey === "services") {
          const gw = app.findObjectByName("Gateway Glow Light") || app.findObjectByName("SevaCoop_Shared_Gateway");
          if (gw) app.emitEvent?.("lookAt", gw.name);
        }
      }
    } catch (e) {
      console.warn("Spline camera update error:", e);
    }
  }, []);

  // Spline onLoad handler: receives the Spline Application instance
  const handleLoad = useCallback((splineApp) => {
    try {
      splineAppRef.current = splineApp;
      setIsLoaded(true);

      // Expose to SceneStore so other pages (like Home scroll trigger) can animate camera
      if (setSplineApp) setSplineApp(splineApp);

      // 1. Audit & log all scene objects on first load
      const allObjects = splineApp.getAllObjects ? splineApp.getAllObjects() : [];
      console.log(`[SevaCoop 3D World] Loaded successfully with ${allObjects.length} objects.`);
      console.log(
        "[SevaCoop 3D World] Key objects present:",
        allObjects
          .filter(
            (o) =>
              o.name &&
              (o.name.includes("HoverGlow") ||
                o.name.includes("Hub") ||
                o.name.includes("Gateway") ||
                o.name.includes("Camera"))
          )
          .map((o) => o.name)
      );

      // 2. Add Spline native event listeners (mouseHover and mouseDown)
      splineApp.addEventListener("mouseHover", (e) => {
        if (!e?.target?.name) return;
        const name = e.target.name;

        // Check if matches a service
        const svc = matchService(name);
        if (svc) {
          setHoveredObject({
            id: svc.id,
            key: svc.key,
            name: svc.name,
            name_hi: svc.name_hi,
            icon: svc.icon,
            base_price: svc.basePrice,
            description: `Verified cooperative ${svc.name} service with guaranteed transparent pricing.`,
            type: "service",
            rawTarget: name,
          });
          return;
        }

        // Check if matches a landmark
        if (name.includes("Gateway") || name.includes("portal")) {
          setHoveredObject(LANDMARK_MAP.gateway);
        } else if (name.includes("Hub") || name.includes("Tower")) {
          setHoveredObject(LANDMARK_MAP.hub);
        } else if (name.includes("Bike")) {
          setHoveredObject(LANDMARK_MAP.bikeHub);
        }
      });

      splineApp.addEventListener("mouseDown", (e) => {
        if (!e?.target?.name) return;
        const name = e.target.name;

        const svc = matchService(name);
        if (svc) {
          setSelectedServiceId(svc.id);
          setHoveredObject({
            id: svc.id,
            key: svc.key,
            name: svc.name,
            icon: svc.icon,
            base_price: svc.basePrice,
            type: "service",
          });
          return;
        }

        if (name.includes("Gateway")) {
          navigate("/services");
        } else if (name.includes("Hub") || name.includes("Tower")) {
          setHoveredObject(LANDMARK_MAP.hub);
        }
      });

      // Apply initial camera position for current route
      applyRouteCamera(getRouteKey(location.pathname));
    } catch (err) {
      console.warn("Spline onLoad init error:", err);
    }
  }, [applyRouteCamera, getRouteKey, location.pathname, navigate, setHoveredObject, setSelectedServiceId, setSplineApp]);

  // Route change effect: adjust focus without unmounting the Spline world
  useEffect(() => {
    const routeKey = getRouteKey(location.pathname);
    setCurrentRouteKey(routeKey);

    // Check if on a /book/:serviceId route
    if (location.pathname.startsWith("/book/")) {
      const parts = location.pathname.split("/");
      const id = parseInt(parts[2], 10);
      const svc = matchService(id);
      if (svc) {
        applyRouteCamera("book", svc.key);
        return;
      }
    }

    applyRouteCamera(routeKey);
  }, [location.pathname, getRouteKey, applyRouteCamera]);

  // Sector focus from marketplace or home HUD
  useEffect(() => {
    if (!marketplaceSector || marketplaceSector === "all") return;
    applyRouteCamera("services", marketplaceSector);
  }, [marketplaceSector, applyRouteCamera]);

  // Tab visibility management: pause rendering when tab is hidden to save power
  useEffect(() => {
    const handleVisibilityChange = () => {
      const app = splineAppRef.current;
      if (!app) return;
      try {
        if (document.hidden) {
          if (app.stop) app.stop();
        } else {
          if (app.play) app.play();
        }
      } catch {
        // ignore
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // If user disabled 3D in prefs, or scene failed to load, render nothing
  if (!prefs.enabled || loadError) {
    return null;
  }

  // Determine blur / dimmed level for the current route
  const isDashboard = currentRouteKey === "customer" || currentRouteKey === "worker" || currentRouteKey === "admin";
  const isAuth = currentRouteKey === "auth";

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-auto"
      aria-hidden="true"
    >
      {/* Persistent Spline 3D Scene Runtime */}
      <div
        className={`w-full h-full transition-all duration-700 ease-out ${
          isDashboard ? "brightness-[0.92] blur-[1px] scale-[1.01]" : isAuth ? "brightness-[0.96]" : "brightness-100"
        }`}
      >
        <Spline
          ref={splineRef}
          scene="/scene.splinecode"
          onLoad={handleLoad}
          onError={(err) => {
            console.warn("Spline runtime load error:", err);
            setLoadError(true);
          }}
          className="w-full h-full block"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Stoneblack Ambient Veil & Subtle Vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stoneblack/40 via-transparent to-stoneblack/70 radial-vignette"
        aria-hidden="true"
      />

      {/* Graceful 3D Environment Loader */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-grid-stoneblack"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
              </div>
              <p className="font-mono text-xs font-semibold tracking-wider text-white uppercase">
                Initializing SevaCoop 3D Core…
              </p>
              <p className="font-mono text-[10px] text-slate-400">
                Loading cooperative nodes & dispatch grid
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating 3D Inspector Card (when user clicks/hovers any service or landmark in 3D) */}
      <AnimatePresence>
        {hoveredObject && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute bottom-6 right-6 z-30 max-w-sm w-full pointer-events-auto rounded-3xl border border-white/80 bg-white/92 p-5 shadow-2xl shadow-emerald-950/15 backdrop-blur-xl sm:bottom-10 sm:right-10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl shadow-inner border border-emerald-200">
                  {hoveredObject.icon ? (
                    hoveredObject.icon
                  ) : (
                    <CategoryIcon name={hoveredObject.name} className="h-6 w-6 text-emerald-800" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      3D Selected
                    </span>
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {hoveredObject.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHoveredObject(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              {hoveredObject.description || "Verified cooperative service with member-protected fair pricing."}
            </p>

            {hoveredObject.base_price != null && (
              <div className="mt-3.5 flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-2">
                <span className="text-xs font-semibold text-emerald-950">Base Price</span>
                <span className="font-mono text-sm font-extrabold text-emerald-800">
                  {fmtINR(hoveredObject.base_price)}
                </span>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              {hoveredObject.type === "service" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (hoveredObject.id) navigate(`/book/${hoveredObject.id}`);
                      else navigate("/services");
                      setHoveredObject(null);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-amber-50 shadow-md shadow-emerald-950/20 hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Book Now <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/services");
                      setHoveredObject(null);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    All Services
                  </button>
                </>
              ) : hoveredObject.action ? (
                <button
                  type="button"
                  onClick={() => {
                    navigate(hoveredObject.action);
                    setHoveredObject(null);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-amber-50 shadow-md shadow-emerald-950/20 hover:bg-emerald-700 transition cursor-pointer"
                >
                  Enter District <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setHoveredObject(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
