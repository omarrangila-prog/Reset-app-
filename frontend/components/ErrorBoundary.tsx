"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Graceful failure boundary. If a rendering error occurs, we show a calm,
 * non-alarming fallback that still points the user to support — never a raw
 * stack trace or a blank screen, which would be jarring for a vulnerable user.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally do not log component state/props (may contain sensitive
    // recovery content). A generic marker is enough.
    if (typeof console !== "undefined") console.error("ui.render_error");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
            background: "#F5F7FC",
            color: "#1C2333",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <p style={{ fontSize: 18, fontWeight: 600 }}>Something hiccuped.</p>
          <p style={{ fontSize: 14, color: "#5A6478", maxWidth: 360, lineHeight: 1.6 }}>
            Your data is safe. Take a breath and reload — and if you need support right now, it&apos;s
            one tap away below.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 22px",
              background: "#2FBE6E",
              color: "#000",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
