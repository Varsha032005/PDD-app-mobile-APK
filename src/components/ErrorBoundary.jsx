import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#e2e8f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(244, 63, 94, 0.5)",
              borderRadius: "1rem",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#f43f5e",
                marginBottom: "0.75rem",
                fontFamily: "Orbitron, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              System Error Detected
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#94a3b8",
                marginBottom: "1.5rem",
                lineHeight: "1.6",
              }}
            >
              The application encountered an unexpected error. This may be due
              to a network issue or a configuration problem.
            </p>
            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "0.5rem",
                padding: "1rem",
                marginBottom: "1.5rem",
                textAlign: "left",
                maxHeight: "150px",
                overflowY: "auto",
              }}
            >
              <code
                style={{
                  fontSize: "0.75rem",
                  color: "#f43f5e",
                  fontFamily: "Share Tech Mono, monospace",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error?.toString()}
              </code>
            </div>
            <button
              onClick={() => {
                // Clear any bad Firebase config
                try {
                  localStorage.removeItem("firebaseConfig");
                } catch (_e) {
                  /* ignore */
                }
                window.location.reload();
              }}
              style={{
                background: "linear-gradient(to right, #0891b2, #4f46e5)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.75rem 2rem",
                fontSize: "0.8rem",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "Orbitron, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Reset & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
