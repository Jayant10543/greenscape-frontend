"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = "https://greenscape-backend-jyc2.onrender.com/api/plants";

export default function PlantDetail() {
  const { name } = useParams();
  const router = useRouter();
  const [plant, setPlant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const plantId = (Array.isArray(name) ? name[0] : name) as string;
    fetch(`${API_URL}/id/${plantId}`)
      .then((res) => res.json())
      .then((data) => {
        setPlant(data);
        setLoading(false);
        const token = localStorage.getItem("token");
        if (token) {
          fetch("https://greenscape-backend-jyc2.onrender.com/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(r => r.json())
            .then(user => {
              if (user.savedPlants?.includes(data._id)) {
                setSaved(true);
              }
            });
        }
      })
      .catch(() => setLoading(false));
  }, [name]);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://greenscape-backend-jyc2.onrender.com/api/auth/save-plant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plantId: plant._id }),
      });
      const data = await res.json();
      const isSaved = (data.savedPlants || []).includes(plant._id);
      setSaved(isSaved);

      // Update localStorage
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        u.savedPlants = data.savedPlants || [];
        localStorage.setItem("user", JSON.stringify(u));
      }

      showToast(isSaved ? "❤️ Plant saved to your profile!" : "💔 Removed from saved plants");
    } catch (err) {
      showToast("Could not save plant, try again");
    }
    setSaveLoading(false);
  };

  if (loading) return (
    <main className="min-h-screen" style={{ background: "#f4f9f0" }}>
      <nav style={{ background: "#1a4d00" }} className="px-6 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} style={{ color: "#a8d878", fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>← Back</button>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>Plant Details</span>
        <div style={{ width: "60px" }} />
      </nav>
      {/* Skeleton */}
      <div style={{ height: "240px", background: "linear-gradient(90deg, #e8f5e0 25%, #d4edcc 50%, #e8f5e0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "12px", padding: "10px", height: "70px" }} />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", height: "80px", marginBottom: "12px" }} />
        ))}
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </main>
  );

  if (!plant || plant.error) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f4f9f0" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🌵</div>
      <p style={{ color: "#1a4d00", fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Plant not found</p>
      <p style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>This plant may have been removed</p>
      <button onClick={() => router.back()} style={{ background: "#1a4d00", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}>Go Back</button>
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: "#f4f9f0" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
          background: "#1a4d00", color: "#fff", padding: "12px 24px", borderRadius: "12px",
          fontSize: "13px", fontWeight: 500, zIndex: 1000,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          {toast}
        </div>
      )}

      {/* Navbar */}
      <nav style={{ background: "#1a4d00" }} className="px-6 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} style={{ color: "#a8d878", fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>
          ← Back
        </button>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>Plant Details</span>
        <button
          onClick={handleSave}
          disabled={saveLoading}
          style={{
            background: saved ? "#7ed957" : "rgba(255,255,255,0.1)",
            border: saved ? "none" : "1px solid rgba(255,255,255,0.3)",
            borderRadius: "20px", padding: "6px 14px",
            color: saved ? "#1a4d00" : "#fff",
            fontSize: "12px", cursor: "pointer", fontWeight: 600,
            transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: "4px",
          }}
        >
          {saveLoading ? "..." : saved ? "❤️ Saved" : "🤍 Save"}
        </button>
      </nav>

      {/* Hero image */}
      <div style={{ height: "240px", overflow: "hidden", position: "relative" }}>
        {plant.image ? (
          <img src={plant.image} alt={plant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#2d6e00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "80px" }}>🌿</div>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", background: "linear-gradient(transparent, rgba(0,0,0,0.65))" }}>
          <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: 700 }}>{plant.name}</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", fontStyle: "italic" }}>{plant.latin}</p>
          <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" as const }}>
            <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 500, background: plant.difficulty === "easy" ? "#d4f0a0" : "#faeeda", color: plant.difficulty === "easy" ? "#2d6e00" : "#633806" }}>{plant.difficulty}</span>
            <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.2)", color: "#fff" }}>{plant.category}</span>
            {plant.climate && <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.2)", color: "#fff" }}>🌡 {plant.climate}</span>}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px" }}>
          {[
            { icon: "☀️", val: plant.sunlight || "Full sun", label: "Sunlight" },
            { icon: "💧", val: plant.water || "Medium", label: "Water" },
            { icon: "📏", val: plant.height || "Varies", label: "Height" },
            { icon: "🌱", val: plant.growTime || "Moderate", label: "Grow time" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #e0f0c8", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#1a4d00" }}>{s.val}</div>
              <div style={{ fontSize: "10px", color: "#888" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {plant.description && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e0f0c8", padding: "14px", marginBottom: "12px" }}>
            <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.7 }}>{plant.description}</p>
          </div>
        )}

        {/* Plant info */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e0f0c8", padding: "14px", marginBottom: "12px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", marginBottom: "10px" }}>📋 Plant info</p>
          {[
            { label: "Soil type", val: plant.soil },
            { label: "Best season", val: plant.season },
            { label: "Indian states", val: plant.states },
          ].filter(r => r.val).map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f8e8", fontSize: "12px" }}>
              <span style={{ color: "#888" }}>{row.label}</span>
              <span style={{ color: "#1a4d00", fontWeight: 500 }}>{row.val}</span>
            </div>
          ))}
          {plant.uses && plant.uses.length > 0 && (
            <div style={{ paddingTop: "8px", fontSize: "12px" }}>
              <span style={{ color: "#888" }}>Uses</span>
              <div style={{ marginTop: "6px" }}>
                {plant.uses.map((u: string) => (
                  <span key={u} style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "10px", background: "#EAF3DE", color: "#27500A", marginRight: "4px", display: "inline-block", marginBottom: "4px" }}>{u}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Care guide */}
        {plant.care && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e0f0c8", padding: "14px", marginBottom: "12px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", marginBottom: "10px" }}>🌿 Care guide</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {Object.entries(plant.care).map(([key, val]: [string, any]) => (
                <div key={key} style={{ background: "#f4f9f0", borderRadius: "10px", padding: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "3px", textTransform: "capitalize" as const }}>{key}</div>
                  <div style={{ fontSize: "12px", color: "#1a4d00", fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diseases */}
        {plant.diseases && plant.diseases.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e0f0c8", padding: "14px", marginBottom: "16px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", marginBottom: "10px" }}>⚠️ Common diseases</p>
            {plant.diseases.map((d: any) => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f8e8", fontSize: "12px" }}>
                <span style={{ color: "#444" }}>{d.name}</span>
                <span style={{ color: d.risk === "high" ? "#993C1D" : d.risk === "medium" ? "#BA7517" : "#3B6D11", fontWeight: 500 }}>
                  {d.risk === "high" ? "High risk" : d.risk === "medium" ? "Moderate risk" : "Low risk"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Diagnose button */}
        <button
          onClick={() => showToast("🚧 AI Diagnose coming in Phase 3!")}
          style={{
            width: "100%", padding: "14px",
            background: "#1a4d00", color: "#fff",
            border: "none", borderRadius: "14px",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#2d6e00")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1a4d00")}
        >
          🔬 Diagnose this plant
        </button>

      </div>
    </main>
  );
}