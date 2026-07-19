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
      const res = await fetch("https://greenscape-backend-jyc2.onrender.com/api/auth/login", {
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
    <main className="gs-app" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
            Welcome back
          </h1>
          <p style={{ color: "var(--gs-text-2)", fontSize: "14px" }}>Sign in to your GreenScape account</p>

          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
            {["🌱", "🌿", "🍃"].map((e, i) => (
              <span key={i} style={{ fontSize: "16px", opacity: 0.4 }}>{e}</span>
            ))}
          </div>
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

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--gs-text-2)", display: "block", marginBottom: "6px" }}>
              Email address
            </label>
            <input
              className="gs-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="your@email.com"
              style={{ width: "100%", padding: "13px 16px", fontSize: "14px", boxSizing: "border-box" as const }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--gs-text-2)", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="gs-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your password"
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
          </div>

          {/* Login button */}
          <button
            className="gs-btn-primary"
            onClick={handleLogin}
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
                Signing in...
              </>
            ) : "Sign in 🌱"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--gs-border)" }} />
            <span style={{ fontSize: "12px", color: "var(--gs-text-3)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--gs-border)" }} />
          </div>

          {/* Sign up link */}
          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--gs-text-2)" }}>
            Don't have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              style={{ color: "var(--gs-lime)", fontWeight: 700, cursor: "pointer" }}
            >
              Sign up free
            </span>
          </p>
        </div>

        {/* Bottom branding */}
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