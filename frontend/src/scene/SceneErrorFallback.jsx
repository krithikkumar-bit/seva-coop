import React, { Component } from "react";

export class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    console.warn("Spline 3D World runtime fallback activated:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="fixed inset-0 z-0 bg-grid-stoneblack"
          aria-hidden="true"
        />
      );
    }
    return this.props.children;
  }
}

export function FallbackSky() {
  return (
    <div
      className="fixed inset-0 z-0 bg-grid-stoneblack"
      aria-hidden="true"
    />
  );
}

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(err, info) {
    console.error("App boundary caught error:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stoneblack p-6 text-white text-center">
          <div className="border border-white/20 bg-black/80 p-8 max-w-md w-full shadow-2xl backdrop-blur-md">
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-400 mb-2">
              [ SEVA PROTOCOL · RECOVERY NODE ]
            </p>
            <h2 className="font-display text-xl font-bold uppercase tracking-tight text-white mb-4">
              Session Reconnected
            </h2>
            <p className="font-mono text-xs text-slate-400 mb-6 leading-relaxed">
              The application encountered a transient interface issue and safely recovered.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.assign("/");
              }}
              className="btn-tech-outline w-full py-2.5 font-bold text-xs uppercase"
            >
              Reload Interface
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
