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
