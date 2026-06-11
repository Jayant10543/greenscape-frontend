"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err) {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f4f9f0", display: "flex", flexDirection: "column" }}>

      {/* Top green section */}
      <div style={{ background: "#1a4d00", padding: "56px 24px 72px", textAlign: "center" }}>
        {/* Logo */}
        <div style={{
          width: "64px", height: "64px", background: "#4CAF50",
          borderRadius: "20px", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "32px", margin: "0 auto 20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
        }}>
          🌿
        </div>
        <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: 700, marginBottom: "8px" }}>Welcome back!</h1>
        <p style={{ color: "#a8d878", fontSize: "14px" }}>Sign in to your GreenScape account</p>

        {/* Decorative dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
          {["🌱", "🌿", "🍃"].map((e, i) => (
            <span key={i} style={{ fontSize: "16px", opacity: 0.5 }}>{e}</span>
          ))}
        </div>
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

        {/* Email */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", display: "block", marginBottom: "6px" }}>
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="your@email.com"
            style={{
              width: "100%", padding: "13px 16px",
              borderRadius: "12px", border: "1.5px solid #c6e8a0",
              fontSize: "14px", outline: "none",
              background: "#fff", color: "#1a4d00",
              boxSizing: "border-box" as const,
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#4CAF50")}
            onBlur={e => (e.target.style.borderColor = "#c6e8a0")}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "28px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", display: "block", marginBottom: "6px" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter your password"
              style={{
                width: "100%", padding: "13px 48px 13px 16px",
                borderRadius: "12px", border: "1.5px solid #c6e8a0",
                fontSize: "14px", outline: "none",
                background: "#fff", color: "#1a4d00",
                boxSizing: "border-box" as const,
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#4CAF50")}
              onBlur={e => (e.target.style.borderColor = "#c6e8a0")}
            />
            {/* Show/hide password */}
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
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "15px",
            background: loading ? "#5a8a3a" : "#1a4d00",
            color: "#fff", border: "none", borderRadius: "14px",
            fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
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
              Signing in...
            </>
          ) : "Sign in 🌱"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", background: "#d4edcc" }} />
          <span style={{ fontSize: "12px", color: "#888" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#d4edcc" }} />
        </div>

        {/* Sign up link */}
        <p style={{ textAlign: "center", fontSize: "14px", color: "#5a8a3a" }}>
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/signup")}
            style={{ color: "#1a4d00", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
          >
            Sign up free
          </span>
        </p>

        {/* Bottom branding */}
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