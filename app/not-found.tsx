"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="gs-app" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center"
    }}>

      {/* Logo */}
      <div style={{
        width: "72px", height: "72px",
        background: "linear-gradient(135deg, var(--gs-lime), var(--gs-lime-deep))",
        borderRadius: "20px", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "36px", marginBottom: "24px",
        boxShadow: "0 8px 24px rgba(184, 242, 60, 0.25)"
      }}>
        🌿
      </div>

      {/* 404 */}
      <div style={{
        fontSize: "80px", fontWeight: 800,
        color: "var(--gs-text-1)", lineHeight: 1,
        marginBottom: "8px", fontFamily: "var(--font-fraunces), serif"
      }}>
        404
      </div>

      {/* Illustration */}
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🌵</div>

      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "8px" }}>
        Page not found
      </h2>
      <p style={{ fontSize: "14px", color: "var(--gs-text-2)", marginBottom: "32px", maxWidth: "280px", lineHeight: 1.6 }}>
        Looks like this page got lost in the jungle. Let's get you back to your garden!
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "280px" }}>
        <button
          className="gs-btn-primary"
          onClick={() => router.push("/")}
          style={{ padding: "14px", fontSize: "15px" }}
        >
          🏡 Go to home
        </button>
        <button
          className="gs-btn-secondary"
          onClick={() => router.back()}
          style={{ padding: "14px", fontSize: "15px" }}
        >
          ← Go back
        </button>
      </div>

      {/* Branding */}
      <p style={{ fontSize: "11px", color: "var(--gs-text-3)", marginTop: "40px" }}>
        🌿 GreenScape AI — Smart plant companion for India
      </p>

    </main>
  );
}