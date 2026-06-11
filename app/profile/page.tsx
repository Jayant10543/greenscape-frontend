"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [savedPlants, setSavedPlants] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [city, setCity] = useState("");
  const [gardenType, setGardenType] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    fetch("https://greenscape-backend-jyc2.onrender.com/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(async (data) => {
        setUser(data);
        setCity(data.city || "");
        setGardenType(data.gardenType || "");

        if (data.savedPlants && data.savedPlants.length > 0) {
          const plantPromises = data.savedPlants.map((id: string) =>
            fetch(`https://greenscape-backend-jyc2.onrender.com/api/plants/id/${id}`).then(r => r.json())
          );
          const plants = await Promise.all(plantPromises);
          setSavedPlants(plants.filter(p => !p.error));
        }
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("https://greenscape-backend-jyc2.onrender.com/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        city,
        gardenType,
        soilType: user?.soilType,
        maintenance: user?.maintenance
      }),
    });
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    setEditing(false);
    setLoading(false);
    showToast("✅ Preferences saved!");
  };

  const handleUnsavePlant = async (e: React.MouseEvent, plantId: string) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("https://greenscape-backend-jyc2.onrender.com/api/auth/save-plant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plantId }),
    });

    if (res.ok) {
      setSavedPlants(prev => prev.filter(p => p._id !== plantId));
      const updatedUser = { ...user, savedPlants: user.savedPlants.filter((id: string) => id !== plantId) };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      showToast("💔 Plant removed from saved");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f9f0", color: "#1a4d00" }}>
      Loading...
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#f4f9f0" }}>

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

      {/* Header */}
      <div style={{ background: "#1a4d00", padding: "40px 24px 56px", textAlign: "center", position: "relative" }}>
        <button
          onClick={() => router.push("/")}
          style={{ position: "absolute", left: "20px", top: "20px", background: "none", border: "none", color: "#a8d878", fontSize: "14px", cursor: "pointer" }}
        >
          ← Back
        </button>

        {/* Avatar */}
        <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 12px" }}>
          <div style={{
            position: "absolute", inset: "-4px", borderRadius: "50%",
            background: "linear-gradient(135deg, #7ed957, #4CAF50, #2d6e00)",
            zIndex: 0, filter: "blur(6px)", opacity: 0.7
          }} />
          <div style={{
            position: "relative", zIndex: 1,
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, #4CAF50 0%, #1a4d00 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "30px", fontWeight: 700, color: "#fff",
            border: "3px solid rgba(255,255,255,0.3)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: 700 }}>{user.name}</h1>
        <p style={{ color: "#a8d878", fontSize: "13px" }}>{user.email}</p>
      </div>

      <div style={{ background: "#f4f9f0", borderRadius: "28px 28px 0 0", marginTop: "-24px", padding: "24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "14px", border: "1.5px solid #e0f0c8", padding: "14px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#1a4d00" }}>{user.savedPlants?.length || 0}</div>
            <div style={{ fontSize: "12px", color: "#5a8a3a", marginTop: "4px" }}>Saved plants</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "14px", border: "1.5px solid #e0f0c8", padding: "14px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#1a4d00" }}>{user.city || "Agra"}</div>
            <div style={{ fontSize: "12px", color: "#5a8a3a", marginTop: "4px" }}>Your city</div>
          </div>
        </div>

        {/* Saved plants */}
        {savedPlants.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a4d00", marginBottom: "12px" }}>
              🌿 My saved plants ({savedPlants.length})
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {savedPlants.map((plant) => (
                <div
                  key={plant._id}
                  onClick={() => router.push(`/plant/${plant._id}`)}
                  style={{
                    background: "#fff", borderRadius: "14px",
                    border: "1.5px solid #e0f0c8", overflow: "hidden",
                    cursor: "pointer", position: "relative",
                    minWidth: 0,
                  }}
                >
                  {/* Remove button */}
                  <button
                    onClick={(e) => handleUnsavePlant(e, plant._id)}
                    style={{
                      position: "absolute", top: "6px", right: "6px", zIndex: 10,
                      width: "24px", height: "24px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.95)", border: "none",
                      cursor: "pointer", fontSize: "12px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                    }}
                  >
                    ❤️
                  </button>

                  <div style={{ height: "80px", overflow: "hidden" }}>
                    {plant.image ? (
                      <img
                        src={plant.image}
                        alt={plant.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#2d6e00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🌿</div>
                    )}
                  </div>
                  <div style={{ padding: "8px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#1a4d00", margin: 0 }}>{plant.name}</p>
                    <p style={{ fontSize: "10px", color: "#888", fontStyle: "italic", margin: "2px 0 0" }}>{plant.latin}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty saved plants */}
        {savedPlants.length === 0 && (
          <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "28px", textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🌱</div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a4d00", marginBottom: "4px" }}>No saved plants yet</p>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}>Tap the ❤️ on any plant to save it here</p>
            <button
              onClick={() => router.push("/")}
              style={{ background: "#1a4d00", color: "#fff", border: "none", borderRadius: "10px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Browse plants
            </button>
          </div>
        )}

        {/* Preferences */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a4d00" }}>My preferences</p>
            <button
              onClick={() => setEditing(!editing)}
              style={{ background: "#EAF3DE", color: "#1a4d00", border: "none", borderRadius: "20px", padding: "4px 14px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}
            >
              {editing ? "Cancel" : "✏️ Edit"}
            </button>
          </div>

          {editing ? (
            <div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "#5a8a3a", display: "block", marginBottom: "4px" }}>City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #c6e8a0", fontSize: "13px", outline: "none", color: "#1a4d00", boxSizing: "border-box" as const }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", color: "#5a8a3a", display: "block", marginBottom: "4px" }}>Garden type</label>
                <input
                  value={gardenType}
                  onChange={(e) => setGardenType(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #c6e8a0", fontSize: "13px", outline: "none", color: "#1a4d00", boxSizing: "border-box" as const }}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{ width: "100%", padding: "12px", background: "#1a4d00", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          ) : (
            <div>
              {[
                { label: "City", val: user.city },
                { label: "Garden type", val: user.gardenType },
                { label: "Soil type", val: user.soilType },
                { label: "Maintenance", val: user.maintenance },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f8e8", fontSize: "13px" }}>
                  <span style={{ color: "#888" }}>{row.label}</span>
                  <span style={{ color: "#1a4d00", fontWeight: 500 }}>{row.val || "Not set"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account info */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "16px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a4d00", marginBottom: "10px" }}>Account info</p>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f8e8", fontSize: "13px" }}>
            <span style={{ color: "#888" }}>Member since</span>
            <span style={{ color: "#1a4d00", fontWeight: 500 }}>
              {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px" }}>
            <span style={{ color: "#888" }}>Email</span>
            <span style={{ color: "#1a4d00", fontWeight: 500 }}>{user.email}</span>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            width: "100%", padding: "14px",
            background: "#FAECE7", color: "#993C1D",
            border: "1.5px solid #F0997B", borderRadius: "14px",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f5d5cc")}
          onMouseLeave={e => (e.currentTarget.style.background = "#FAECE7")}
        >
          🚪 Logout
        </button>

      </div>
    </main>
  );
}