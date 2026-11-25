import React from "react";

/**
 * Clean ambient soft gradient background for SevaCoop.
 * Replaces heavy WebGL canvas with an instant, accessible, zero-lag backdrop.
 */
export default function Background3DWorld() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-none bg-soft-grid"
      aria-hidden="true"
    >
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-200/25 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-amber-100/30 blur-3xl" />
    </div>
  );
}
