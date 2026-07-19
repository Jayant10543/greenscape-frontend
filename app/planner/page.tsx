"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GardenMap from "./GardenMap";

const gardenTypes = [
  { label: "Home Garden", emoji: "🏡", sub: "Outdoor space" },
  { label: "Terrace", emoji: "🏙️", sub: "Rooftop garden" },
  { label: "Balcony", emoji: "🌇", sub: "Small space" },
  { label: "Farmhouse", emoji: "🏘️", sub: "Large space" },
];

const preferences = [
  { label: "Vegetables & Herbs", emoji: "🥬" },
  { label: "Flowers & Ornamental", emoji: "🌸" },
  { label: "Trees & Shrubs", emoji: "🌳" },
  { label: "Mixed Garden", emoji: "🌿" },
];

const budgets = [
  { label: "Low", sub: "Under ₹5,000", emoji: "💚" },
  { label: "Medium", sub: "₹5,000 - ₹20,000", emoji: "💛" },
  { label: "High", sub: "Above ₹20,000", emoji: "❤️" },
];

export default function Planner() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [gardenType, setGardenType] = useState("");
  const [preference, setPreference] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetch(`https://greenscape-backend-jyc2.onrender.com/api/weather/${u.city || "Agra"}`)
        .then(r => r.json())
        .then(setWeather)
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      setSlowLoading(false);
      return;
    }
    const timer = setTimeout(() => setSlowLoading(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  const generatePlan = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://greenscape-backend-jyc2.onrender.com/api/planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ length, width, gardenType, preference, budget, city: user?.city, soilType: user?.soilType, weather }),
      });

      const parsed = await response.json();
      if (parsed.error) throw new Error(parsed.error);
      setResult(parsed);
      setStep(4);
    } catch (err) {
      console.error("Planner error:", err);
      setError("Failed to generate plan. Please try again.");
    }
    setLoading(false);
  };

  const card = { background: "var(--gs-glass)", border: "1px solid var(--gs-border)", borderRadius: "16px", backdropFilter: "blur(20px)" };
  const heading = { fontSize: "22px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "8px", fontFamily: "var(--font-fraunces), serif" };
  const sub = { fontSize: "14px", color: "var(--gs-text-2)" };

  const tile = (isSel: boolean) => ({
    background: isSel ? "var(--gs-glass-strong)" : "var(--gs-glass)",
    border: isSel ? "2px solid var(--gs-lime)" : "1px solid var(--gs-border)",
    borderRadius: "14px", textAlign: "center" as const, cursor: "pointer",
    transition: "all 0.2s", backdropFilter: "blur(20px)",
    transform: isSel ? "scale(1.02)" : "scale(1)",
  });

  return (
    <main className="gs-app">

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--gs-border)" }}>
        <button onClick={() => router.push("/")} style={{ color: "var(--gs-text-2)", fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>
          ← Back
        </button>
        <span style={{ color: "var(--gs-text-1)", fontWeight: 700, fontSize: "15px" }}>🗺️ Garden Planner</span>
        <div style={{ width: "60px" }} />
      </nav>

      <div style={{ maxWidth: "640px", margin: "0 auto" }}>

      {step === 1 && (
        <div style={{ padding: "24px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📐</div>
            <h2 style={heading}>What's your plot size?</h2>
            <p style={sub}>Enter the length and width of your garden space</p>
          </div>

          {user?.city && (
            <div style={{ background: "var(--gs-glass)", border: "1px solid var(--gs-border)", borderRadius: "12px", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>📍</span>
              <span style={{ fontSize: "13px", color: "var(--gs-text-2)", fontWeight: 500 }}>
                Planning for {user.city}
                {weather ? ` · ${weather.temperature}°C, ${weather.description}` : ""}
              </span>
            </div>
          )}

          <div style={{ ...card, padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--gs-text-2)", display: "block", marginBottom: "6px", fontWeight: 600 }}>Length (feet)</label>
                <input
                  className="gs-input"
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 20"
                  style={{ width: "100%", padding: "12px", fontSize: "16px", boxSizing: "border-box" as const }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--gs-text-2)", display: "block", marginBottom: "6px", fontWeight: 600 }}>Width (feet)</label>
                <input
                  className="gs-input"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 15"
                  style={{ width: "100%", padding: "12px", fontSize: "16px", boxSizing: "border-box" as const }}
                />
              </div>
            </div>

            {length && width && (
              <div style={{ background: "var(--gs-glass-strong)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--gs-lime)" }}>
                  Total area: {parseInt(length) * parseInt(width)} sq ft
                </span>
              </div>
            )}
          </div>

          <button
            className="gs-btn-primary"
            onClick={() => setStep(2)}
            disabled={!length || !width}
            style={{ width: "100%", padding: "15px", fontSize: "15px" }}
          >
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ padding: "24px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🌿</div>
            <h2 style={heading}>Garden type</h2>
            <p style={sub}>What kind of garden space do you have?</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {gardenTypes.map((g) => (
              <div key={g.label} onClick={() => setGardenType(g.label)} style={{ ...tile(gardenType === g.label), padding: "16px" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{g.emoji}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--gs-text-1)" }}>{g.label}</div>
                <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "2px" }}>{g.sub}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "12px" }}>Plant preference</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {preferences.map((p) => (
              <div key={p.label} onClick={() => setPreference(p.label)} style={{ ...tile(preference === p.label), padding: "14px" }}>
                <div style={{ fontSize: "28px", marginBottom: "6px" }}>{p.emoji}</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--gs-text-1)" }}>{p.label}</div>
              </div>
            ))}
          </div>

          <button
            className="gs-btn-primary"
            onClick={() => setStep(3)}
            disabled={!gardenType || !preference}
            style={{ width: "100%", padding: "15px", fontSize: "15px" }}
          >
            Continue →
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={{ padding: "24px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>💰</div>
            <h2 style={heading}>What's your budget?</h2>
            <p style={sub}>We'll suggest plants and materials accordingly</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
            {budgets.map((b) => (
              <div key={b.label} onClick={() => setBudget(b.label)} style={{ ...tile(budget === b.label), padding: "16px", textAlign: "left", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ fontSize: "28px" }}>{b.emoji}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--gs-text-1)" }}>{b.label}</div>
                  <div style={{ fontSize: "12px", color: "var(--gs-text-2)" }}>{b.sub}</div>
                </div>
                {budget === b.label && (
                  <div style={{ marginLeft: "auto", width: "24px", height: "24px", borderRadius: "50%", background: "var(--gs-lime)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0B1410", fontSize: "12px" }}>✓</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ background: "var(--gs-glass)", border: "1px solid var(--gs-border)", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--gs-text-1)", marginBottom: "8px" }}>📋 Your garden plan summary:</p>
            <p style={{ fontSize: "12px", color: "var(--gs-text-2)", marginBottom: "4px" }}>📐 Plot: {length} x {width} ft ({parseInt(length) * parseInt(width)} sq ft)</p>
            <p style={{ fontSize: "12px", color: "var(--gs-text-2)", marginBottom: "4px" }}>🏡 Type: {gardenType}</p>
            <p style={{ fontSize: "12px", color: "var(--gs-text-2)", marginBottom: "4px" }}>🌿 Preference: {preference}</p>
            {user?.city && <p style={{ fontSize: "12px", color: "var(--gs-text-2)", marginBottom: "4px" }}>📍 Location: {user.city}</p>}
            {weather && <p style={{ fontSize: "12px", color: "var(--gs-text-2)" }}>🌡️ Weather: {weather.temperature}°C, {weather.description}</p>}
          </div>

          <button
            className="gs-btn-primary"
            onClick={generatePlan}
            disabled={!budget || loading}
            style={{ width: "100%", padding: "15px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🌿</span>
                AI is designing your garden...
              </>
            ) : "Generate My Garden Plan 🌿"}
          </button>

          {loading && slowLoading && (
            <p style={{ color: "var(--gs-text-2)", fontSize: "12px", textAlign: "center", marginTop: "10px" }}>
              🌙 Server may be waking up after inactivity — this can take up to a minute on first use.
            </p>
          )}

          {error && (
            <p style={{ color: "var(--gs-red)", fontSize: "13px", textAlign: "center", marginTop: "12px" }}>⚠️ {error}</p>
          )}
        </div>
      )}

      {step === 4 && result && (
        <div style={{ padding: "20px" }}>

          <div style={{ background: "linear-gradient(135deg, rgba(184,242,60,0.14), rgba(47,209,128,0.06))", border: "1px solid var(--gs-border-strong)", borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🌿</div>
            <h2 style={{ color: "var(--gs-text-1)", fontSize: "18px", fontWeight: 700, marginBottom: "8px", fontFamily: "var(--font-fraunces), serif" }}>Your Garden Plan is Ready!</h2>
            <p style={{ color: "var(--gs-text-2)", fontSize: "13px", lineHeight: 1.6 }}>{result.summary}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div style={{ ...card, borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--gs-text-1)" }}>{length}×{width} ft</div>
              <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "2px" }}>Plot size</div>
            </div>
            <div style={{ ...card, borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)" }}>{result.estimatedCost}</div>
              <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "2px" }}>Estimated cost</div>
            </div>
          </div>

          <GardenMap zones={result.zones || []} length={length} width={width} />

          <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "14px" }}>🗺️ Garden Zones</p>
            {result.zones?.map((zone: any, i: number) => (
              <div key={i} style={{ background: "var(--gs-glass)", border: "1px solid var(--gs-border)", borderRadius: "12px", padding: "12px", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "20px" }}>{zone.emoji}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--gs-text-1)" }}>{zone.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", background: "rgba(184,242,60,0.12)", color: "var(--gs-lime)", padding: "2px 8px", borderRadius: "10px" }}>{zone.area}</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--gs-text-2)", marginBottom: "6px" }}>{zone.description}</p>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" as const }}>
                  {zone.plants?.map((plant: string, j: number) => (
                    <span key={j} style={{ fontSize: "11px", background: "rgba(184,242,60,0.10)", color: "var(--gs-lime)", padding: "2px 8px", borderRadius: "10px" }}>{plant}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "14px" }}>🌱 Plant List</p>
            {result.plantList?.map((plant: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--gs-border)" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--gs-text-1)", margin: 0 }}>{plant.name}</p>
                  <p style={{ fontSize: "11px", color: "var(--gs-text-3)", margin: "2px 0 0" }}>{plant.care}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "8px" }}>
                  <p style={{ fontSize: "12px", color: "var(--gs-emerald)", fontWeight: 500, margin: 0 }}>Qty: {plant.quantity}</p>
                  <p style={{ fontSize: "11px", color: "var(--gs-text-3)", margin: "2px 0 0" }}>{plant.season}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "14px" }}>📅 Planting Calendar</p>
            {result.monthlyCalendar && Object.entries(result.monthlyCalendar).map(([month, activity]: [string, any]) => (
              <div key={month} style={{ display: "flex", gap: "12px", padding: "8px 0", borderBottom: "1px solid var(--gs-border)", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#0B1410", background: "var(--gs-lime)", padding: "3px 8px", borderRadius: "8px", flexShrink: 0 }}>{month}</span>
                <span style={{ fontSize: "12px", color: "var(--gs-text-2)" }}>{activity}</span>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "12px" }}>💡 Expert Tips</p>
            {result.tips?.map((tip: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>🌿</span>
                <span style={{ fontSize: "13px", color: "var(--gs-text-2)", lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(47,209,128,0.12), rgba(47,209,128,0.04))", border: "1px solid rgba(47,209,128,0.25)", borderRadius: "14px", padding: "14px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "20px" }}>💧</span>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--gs-text-1)", margin: "0 0 4px" }}>Watering Schedule</p>
              <p style={{ fontSize: "12px", color: "var(--gs-text-2)", margin: 0 }}>{result.wateringSchedule}</p>
            </div>
          </div>

          <button
            className="gs-btn-secondary"
            onClick={() => { setStep(1); setResult(null); setLength(""); setWidth(""); setGardenType(""); setPreference(""); setBudget(""); }}
            style={{ width: "100%", padding: "14px", fontSize: "14px", marginBottom: "10px" }}
          >
            🔄 Plan Another Garden
          </button>
          <button
            className="gs-btn-primary"
            onClick={() => router.push("/")}
            style={{ width: "100%", padding: "14px", fontSize: "14px" }}
          >
            🌿 Browse Plants
          </button>
        </div>
      )}

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