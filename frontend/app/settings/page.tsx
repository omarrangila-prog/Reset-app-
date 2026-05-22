"use client";

import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [deleted, setDeleted] = useState(false);

  const handleDeleteAccount = () => {
    window.localStorage.clear();
    setDeleted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#141413",
        color: "#EDEDEB",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: 24,
                margin: 0,
                letterSpacing: "0.12em",
              }}
            >
              Settings
            </p>
            <p style={{ fontSize: 14, color: "#7A7A80", margin: "8px 0 0 0" }}>
              Control your data and privacy in one place.
            </p>
          </div>
          <Link
            href="/"
            style={{
              color: "#EDEDEB",
              textDecoration: "underline",
              fontSize: 13,
            }}
          >
            Back home
          </Link>
        </div>

        <div
          style={{
            background: "#1A1A18",
            padding: "24px",
            borderRadius: 18,
            border: "1px solid #2C2C34",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              margin: "0 0 12px 0",
              color: "#EDEDEB",
            }}
          >
            Delete account
          </h2>
          <p style={{ color: "#B0B0B8", lineHeight: 1.7, marginBottom: 20 }}>
            This clears all local data stored by RESET in your browser. It removes your saved preferences,
            onboarding progress, streak history, and notes.
          </p>
          <button
            onClick={handleDeleteAccount}
            style={{
              width: "100%",
              padding: "16px 18px",
              background: "#D4A574",
              color: "#141413",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Delete account and all local data
          </button>
          {deleted && (
            <p style={{ marginTop: 18, color: "#18A856" }}>
              Your local account data has been cleared. Refresh the page to begin again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
