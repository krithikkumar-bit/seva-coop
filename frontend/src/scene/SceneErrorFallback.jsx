import React, { Component } from "react";

export class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="fixed inset-0 z-0 bg-white" aria-hidden="true" />;
    }
    return this.props.children;
  }
}

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6 text-neutral-900 text-center">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 max-w-md w-full shadow-card">
            <h2 className="font-display text-xl font-bold text-neutral-900 mb-3">
              Something went wrong
            </h2>
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              The page encountered an unexpected issue. Please reload to continue safely.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.assign("/");
              }}
              className="btn-primary-coop w-full py-2.5 justify-center"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
