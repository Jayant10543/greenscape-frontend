"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f4f9f0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center"
    }}>

      {/* Logo */}
      <div style={{
        width: "72px", height: "72px", background: "#4CAF50",
        borderRadius: "20px", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "36px", marginBottom: "24px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
      }}>
        🌿
      </div>

      {/* 404 */}
      <div style={{
        fontSize: "80px", fontWeight: 800,
        color: "#1a4d00", lineHeight: 1,
        marginBottom: "8px"
      }}>
        404
      </div>

      {/* Illustration */}
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🌵</div>

      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a4d00", marginBottom: "8px" }}>
        Page not found
      </h2>
      <p style={{ fontSize: "14px", color: "#5a8a3a", marginBottom: "32px", maxWidth: "280px", lineHeight: 1.6 }}>
        Looks like this page got lost in the jungle. Let's get you back to your garden!
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "280px" }}>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "14px", background: "#1a4d00",
            color: "#fff", border: "none", borderRadius: "14px",
            fontSize: "15px", fontWeight: 600, cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#2d6e00")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1a4d00")}
        >
          🏡 Go to home
        </button>
        <button
          onClick={() => router.back()}
          style={{
            padding: "14px", background: "#fff",
            color: "#1a4d00", border: "1.5px solid #c6e8a0",
            borderRadius: "14px", fontSize: "15px",
            fontWeight: 600, cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#EAF3DE")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >
          ← Go back
        </button>
      </div>

      {/* Branding */}
      <p style={{ fontSize: "11px", color: "#aaa", marginTop: "40px" }}>
        🌿 GreenScape AI — Smart plant companion for India
      </p>

    </main>
  );
}