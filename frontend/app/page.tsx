"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppStore } from "../lib/store";
import { api } from "../lib/api";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { userId, setUserId, setUser, user } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [pulse, setPulse] = useState(false);

  // Initialize or load user
  useEffect(() => {
    async function init() {
      try {
        if (userId) {
          const userData = await api.getUser(userId);
          setUser(userData);
        } else {
          const newUser = await api.createUser({});
          setUserId(newUser.id);
          setUser(newUser);
        }
      } catch (e) {
        // If API unavailable, work in demo mode
        console.warn("API unavailable, running in demo mode");
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, []);

  const handleUrge = async () => {
    setLoading(true);
    setPulse(true);

    try {
      // Log the urge
      if (userId) {
        await api.createLog({
          userId,
          type: "URGE",
          intensity: 8,
        });
      }
    } catch (e) {
      // Continue even if logging fails
    }

    // Navigate to coach with urge mode
    router.push("/coach?mode=URGE&urgency=8");
  };

  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? "Morning."
      : hour >= 12 && hour < 17
      ? "Afternoon."
      : hour >= 17 && hour < 22
      ? "Evening."
      : "Late night.";

  const isHighRisk = hour >= 22 || hour < 5;

  if (initializing) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "32px",
            letterSpacing: "0.15em",
            color: "#F2F2F0",
          }}
        >
          RESET
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      {/* Background radial */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(29,185,84,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "20px",
            letterSpacing: "0.1em",
            color: "#F2F2F0",
          }}
        >
          RESET
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {user && (
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "#8A8A8E",
              }}
            >
              <span style={{ color: "#1DB954", fontWeight: 600 }}>
                {user.streak}
              </span>{" "}
              {user.streak === 1 ? "day" : "days"}
            </div>
          )}
          <Link
            href="/dashboard"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "#8A8A8E",
              letterSpacing: "0.05em",
              transition: "color 0.2s",
            }}
          >
            Dashboard →
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          textAlign: "center",
          maxWidth: "480px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            color: "#8A8A8E",
            marginBottom: "8px",
            letterSpacing: "0.03em",
          }}
        >
          {greeting}
          {isHighRisk && (
            <span style={{ color: "#F5A623", marginLeft: "8px" }}>
              High-risk window.
            </span>
          )}
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(52px, 10vw, 80px)",
            lineHeight: 0.92,
            letterSpacing: "0.02em",
            color: "#F2F2F0",
            marginBottom: "48px",
          }}
        >
          YOU ARE{" "}
          <span style={{ color: "#1DB954" }}>
            {user?.streak ? `${user.streak}D` : "HERE"}
          </span>
        </motion.h1>

        {/* The main button */}
        <motion.button
          onClick={handleUrge}
          disabled={loading}
          whileTap={{ scale: 0.96 }}
          animate={
            pulse
              ? { scale: [1, 1.03, 1], boxShadow: ["0 0 0px rgba(255,51,51,0)", "0 0 60px rgba(255,51,51,0.5)", "0 0 0px rgba(255,51,51,0)"] }
              : {}
          }
          style={{
            width: "100%",
            padding: "24px",
            background: "#FF3333",
            border: "none",
            borderRadius: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: "32px",
            letterSpacing: "0.05em",
            color: "#F2F2F0",
            boxShadow: "0 0 40px rgba(255,51,51,0.3)",
            transition: "box-shadow 0.3s ease",
            marginBottom: "16px",
          }}
        >
          {loading ? "CONNECTING..." : "I FEEL AN URGE"}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "#4A4A4E",
            marginBottom: "48px",
          }}
        >
          Immediate AI intervention. No judgment.
        </motion.p>

        {/* Secondary options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: "flex", gap: "12px", justifyContent: "center" }}
        >
          <button
            onClick={() => router.push("/coach?mode=VULNERABILITY&urgency=4")}
            style={{
              background: "transparent",
              border: "1px solid #2A2A2E",
              borderRadius: "8px",
              padding: "12px 20px",
              color: "#8A8A8E",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            I feel vulnerable
          </button>
          <button
            onClick={() => router.push("/coach?mode=RECOVERY&urgency=2")}
            style={{
              background: "transparent",
              border: "1px solid #2A2A2E",
              borderRadius: "8px",
              padding: "12px 20px",
              color: "#8A8A8E",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Check in
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          padding: "20px 32px",
          borderTop: "1px solid #1A1A1E",
        }}
      >
        {[
          { label: "Urges resisted", value: user?.totalUrges || 0 },
          { label: "Day streak", value: user?.streak || 0 },
          { label: "Discipline", value: `${user?.disciplineScore || 0}/100` },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "20px",
                color: "#F2F2F0",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                color: "#4A4A4E",
                letterSpacing: "0.05em",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
