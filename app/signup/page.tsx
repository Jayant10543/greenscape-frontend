"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !city) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://greenscape-backend-jyc2.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, city }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/onboarding");
    } catch (err) {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const inputProps = {
    className: "gs-input",
    style: { width: "100%", padding: "13px 16px", fontSize: "14px", boxSizing: "border-box" as const },
  };

  const labelStyle = { fontSize: "13px", fontWeight: 600, color: "var(--gs-text-2)", display: "block", marginBottom: "6px" };

  return (
    <main className="gs-app" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "64px", height: "64px",
            background: "linear-gradient(135deg, var(--gs-lime), var(--gs-lime-deep))",
            borderRadius: "20px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "32px", margin: "0 auto 20px",
            boxShadow: "0 8px 24px rgba(184, 242, 60, 0.25)"
          }}>
            🌿
          </div>
          <h1 style={{
            color: "var(--gs-text-1)", fontSize: "26px", fontWeight: 700,
            marginBottom: "8px", fontFamily: "var(--font-fraunces), serif"
          }}>
            Create account
          </h1>
          <p style={{ color: "var(--gs-text-2)", fontSize: "14px" }}>Join GreenScape and grow smarter 🌱</p>

          {/* Steps indicator */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gs-lime)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#0B1410" }}>1</div>
            <div style={{ width: "32px", height: "2px", background: "var(--gs-border-strong)" }} />
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gs-glass)", border: "1px solid var(--gs-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--gs-text-3)" }}>2</div>
            <div style={{ width: "32px", height: "2px", background: "var(--gs-border-strong)" }} />
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gs-glass)", border: "1px solid var(--gs-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--gs-text-3)" }}>3</div>
          </div>
          <p style={{ color: "var(--gs-text-3)", fontSize: "11px", marginTop: "6px" }}>Account → Preferences → Done</p>
        </div>

        {/* Form card */}
        <div className="gs-glass-card" style={{ padding: "28px 24px" }}>

          {error && (
            <div style={{
              background: "rgba(255, 107, 107, 0.10)",
              border: "1px solid rgba(255, 107, 107, 0.30)",
              borderRadius: "var(--gs-radius-sm)", padding: "12px 16px",
              marginBottom: "20px", color: "var(--gs-red)", fontSize: "13px",
              display: "flex", alignItems: "center", gap: "8px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Full name */}
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>👤 Full name</label>
            <input
              {...inputProps}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              placeholder="Your full name"
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>📧 Email address</label>
            <input
              {...inputProps}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              placeholder="your@email.com"
            />
          </div>

          {/* City */}
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>📍 Your city</label>
            <input
              {...inputProps}
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              placeholder="e.g. Agra, Delhi, Mumbai"
            />
            <p style={{ fontSize: "11px", color: "var(--gs-text-3)", marginTop: "4px" }}>
              Used for weather-based plant recommendations
            </p>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>🔒 Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="gs-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                placeholder="Min. 6 characters"
                style={{ width: "100%", padding: "13px 48px 13px 16px", fontSize: "14px", boxSizing: "border-box" as const }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "14px", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", fontSize: "16px",
                  color: "var(--gs-text-2)", padding: "0"
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Password strength */}
            {password.length > 0 && (
              <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ flex: 1, height: "4px", borderRadius: "4px", background: "var(--gs-glass-strong)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "4px",
                    width: password.length < 6 ? "33%" : password.length < 10 ? "66%" : "100%",
                    background: password.length < 6 ? "var(--gs-red)" : password.length < 10 ? "var(--gs-amber)" : "var(--gs-lime)",
                    transition: "all 0.3s"
                  }} />
                </div>
                <span style={{ fontSize: "11px", color: password.length < 6 ? "var(--gs-red)" : password.length < 10 ? "var(--gs-amber)" : "var(--gs-lime)" }}>
                  {password.length < 6 ? "Weak" : password.length < 10 ? "Good" : "Strong"}
                </span>
              </div>
            )}
          </div>

          {/* Signup button */}
          <button
            className="gs-btn-primary"
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: "100%", padding: "15px", fontSize: "15px",
              marginBottom: "16px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🌿</span>
                Creating account...
              </>
            ) : "Create account 🌱"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--gs-border)" }} />
            <span style={{ fontSize: "12px", color: "var(--gs-text-3)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--gs-border)" }} />
          </div>

          {/* Login link */}
          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--gs-text-2)" }}>
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              style={{ color: "var(--gs-lime)", fontWeight: 700, cursor: "pointer" }}
            >
              Sign in
            </span>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "var(--gs-text-3)", marginTop: "24px" }}>
          🌿 GreenScape AI — Smart plant companion for India
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}