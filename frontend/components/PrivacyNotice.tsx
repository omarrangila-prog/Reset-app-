import { useState } from "react";

interface PrivacyNoticeProps {
  showOnboarding?: boolean;
}

export function PrivacyNotice({ showOnboarding = false }: PrivacyNoticeProps) {
  const [isExpanded, setIsExpanded] = useState(showOnboarding);

  const T = {
    bg: "#080809",
    bgSurface: "#151518",
    text: "#EDEDEB",
    textSub: "#7A7A80",
    textMuted: "#3A3A40",
    border: "#1E1E24",
    recovery: "#18A856",
  };

  return (
    <div
      style={{
        background: T.bgSurface,
        borderRadius: 14,
        padding: "20px",
        border: `1px solid ${T.border}`,
        marginBottom: showOnboarding ? 20 : 0,
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: T.text,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: T.textMuted,
          }}
        >
          Your Privacy
        </span>
        <span style={{ color: T.textMuted }}>{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: T.text,
              lineHeight: 1.7,
              marginBottom: 16,
            }}
          >
            <p style={{ margin: "0 0 12px 0" }}>
              <strong>Is my data stored?</strong>
              <br />
              Yes, encrypted and securely. Only you can access it.
            </p>
            <p style={{ margin: "0 0 12px 0" }}>
              <strong>Are AI conversations logged?</strong>
              <br />
              Yes, to improve your experience. You can delete any conversation anytime.
            </p>
            <p style={{ margin: "0 0 12px 0" }}>
              <strong>Does anyone train on my data?</strong>
              <br />
              No. We do not use your data to train AI models.
            </p>
            <p style={{ margin: "0 0 12px 0" }}>
              <strong>Is data shared with third parties?</strong>
              <br />
              Never. Your data stays yours.
            </p>
            <p style={{ margin: "0 0 0 0" }}>
              <strong>Can I clear my data?</strong>
              <br />
              Yes. Go to Settings → Clear local data to remove saved RESET progress and history from your browser.
            </p>
          </div>

          <div
            style={{
              padding: "12px",
              background: `rgba(24, 168, 86, 0.06)`,
              borderRadius: 8,
              border: `1px solid ${T.recovery}33`,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: T.textSub,
              lineHeight: 1.6,
            }}
          >
            Your conversations stay private. We do not sell, share, or use your data to train AI. You can delete
            your account and all data at any time from Settings.
          </div>
        </div>
      )}
    </div>
  );
}
