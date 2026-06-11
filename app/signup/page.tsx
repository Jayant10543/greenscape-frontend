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

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    borderRadius: "12px", border: "1.5px solid #c6e8a0",
    fontSize: "14px", outline: "none",
    background: "#fff", color: "#1a4d00",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f4f9f0", display: "flex", flexDirection: "column" }}>

      {/* Top green section */}
      <div style={{ background: "#1a4d00", padding: "48px 24px 64px", textAlign: "center" }}>
        <div style={{
          width: "64px", height: "64px", background: "#4CAF50",
          borderRadius: "20px", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "32px", margin: "0 auto 20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
        }}>
          🌿
        </div>
        <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: 700, marginBottom: "8px" }}>Create account</h1>
        <p style={{ color: "#a8d878", fontSize: "14px" }}>Join GreenScape and grow smarter 🌱</p>

        {/* Steps indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff" }}>1</div>
          <div style={{ width: "32px", height: "2px", background: "rgba(255,255,255,0.3)" }} />
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>2</div>
          <div style={{ width: "32px", height: "2px", background: "rgba(255,255,255,0.3)" }} />
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>3</div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "6px" }}>Account → Preferences → Done</p>
      </div>

      {/* Form card */}
      <div style={{ background: "#f4f9f0", borderRadius: "28px 28px 0 0", marginTop: "-24px", flex: 1, padding: "32px 24px" }}>

        {/* Error */}
        {error && (
          <div style={{
            background: "#FAECE7", border: "1px solid #F0997B",
            borderRadius: "12px", padding: "12px 16px",
            marginBottom: "20px", color: "#993C1D", fontSize: "13px",
            display: "flex", alignItems: "center", gap: "8px"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Full name */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", display: "block", marginBottom: "6px" }}>
            👤 Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            placeholder="Your full name"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "#4CAF50")}
            onBlur={e => (e.target.style.borderColor = "#c6e8a0")}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", display: "block", marginBottom: "6px" }}>
            📧 Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            placeholder="your@email.com"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "#4CAF50")}
            onBlur={e => (e.target.style.borderColor = "#c6e8a0")}
          />
        </div>

        {/* City */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", display: "block", marginBottom: "6px" }}>
            📍 Your city
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            placeholder="e.g. Agra, Delhi, Mumbai"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "#4CAF50")}
            onBlur={e => (e.target.style.borderColor = "#c6e8a0")}
          />
          <p style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
            Used for weather-based plant recommendations
          </p>
        </div>

        {/* Password */}
        <div style={{ marginBottom: "28px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", display: "block", marginBottom: "6px" }}>
            🔒 Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              placeholder="Min. 6 characters"
              style={{ ...inputStyle, paddingRight: "48px" }}
              onFocus={e => (e.target.style.borderColor = "#4CAF50")}
              onBlur={e => (e.target.style.borderColor = "#c6e8a0")}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", cursor: "pointer", fontSize: "16px",
                color: "#5a8a3a", padding: "0"
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {/* Password strength */}
          {password.length > 0 && (
            <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1, height: "4px", borderRadius: "4px", background: "#e0f0c8", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "4px",
                  width: password.length < 6 ? "33%" : password.length < 10 ? "66%" : "100%",
                  background: password.length < 6 ? "#F0997B" : password.length < 10 ? "#f0c040" : "#4CAF50",
                  transition: "all 0.3s"
                }} />
              </div>
              <span style={{ fontSize: "11px", color: password.length < 6 ? "#993C1D" : password.length < 10 ? "#BA7517" : "#2d6e00" }}>
                {password.length < 6 ? "Weak" : password.length < 10 ? "Good" : "Strong"}
              </span>
            </div>
          )}
        </div>

        {/* Signup button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: "100%", padding: "15px",
            background: loading ? "#5a8a3a" : "#1a4d00",
            color: "#fff", border: "none", borderRadius: "14px",
            fontSize: "15px", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "16px",
            transition: "background 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#2d6e00" }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#1a4d00" }}
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
          <div style={{ flex: 1, height: "1px", background: "#d4edcc" }} />
          <span style={{ fontSize: "12px", color: "#888" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#d4edcc" }} />
        </div>

        {/* Login link */}
        <p style={{ textAlign: "center", fontSize: "14px", color: "#5a8a3a" }}>
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            style={{ color: "#1a4d00", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
          >
            Sign in
          </span>
        </p>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#aaa", marginTop: "32px" }}>
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