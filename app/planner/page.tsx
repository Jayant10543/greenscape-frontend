"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setError("");

    try {
      const prompt = `You are an expert Indian garden landscape designer. Create a detailed garden layout plan for the following:

Plot Size: ${length} x ${width} feet (${parseInt(length) * parseInt(width)} sq ft)
Garden Type: ${gardenType}
Plant Preference: ${preference}
Budget: ${budget}
Location: India (tropical/subtropical climate)

Please provide a comprehensive garden plan in the following JSON format only, no other text:
{
  "summary": "2-3 sentence overview of the garden plan",
  "zones": [
    {
      "name": "Zone name",
      "emoji": "relevant emoji",
      "area": "area in sq ft",
      "description": "what goes here",
      "plants": ["plant1", "plant2", "plant3"]
    }
  ],
  "plantList": [
    {
      "name": "Plant name",
      "quantity": "number",
      "spacing": "spacing in feet",
      "season": "best season to plant",
      "care": "one line care tip"
    }
  ],
  "monthlyCalendar": {
    "Jan-Feb": "what to do",
    "Mar-Apr": "what to do",
    "May-Jun": "what to do",
    "Jul-Aug": "what to do",
    "Sep-Oct": "what to do",
    "Nov-Dec": "what to do"
  },
  "tips": ["tip1", "tip2", "tip3", "tip4"],
  "estimatedCost": "cost range in INR",
  "wateringSchedule": "watering frequency and amount"
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-allow-browser": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content[0].text;
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setStep(4);
    } catch (err) {
      setError("Failed to generate plan. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f4f9f0" }}>

      {/* Navbar */}
      <nav style={{ background: "#1a4d00", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/")} style={{ color: "#a8d878", fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>
          ← Back
        </button>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>🗺️ Garden Planner</span>
        <div style={{ width: "60px" }} />
      </nav>

      {/* Step 1 — Plot size */}
      {step === 1 && (
        <div style={{ padding: "24px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📐</div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a4d00", marginBottom: "8px" }}>What's your plot size?</h2>
            <p style={{ fontSize: "14px", color: "#5a8a3a" }}>Enter the length and width of your garden space</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#5a8a3a", display: "block", marginBottom: "6px", fontWeight: 600 }}>Length (feet)</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 20"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid #c6e8a0", fontSize: "16px", outline: "none", color: "#1a4d00", boxSizing: "border-box" as const }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#5a8a3a", display: "block", marginBottom: "6px", fontWeight: 600 }}>Width (feet)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 15"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid #c6e8a0", fontSize: "16px", outline: "none", color: "#1a4d00", boxSizing: "border-box" as const }}
                />
              </div>
            </div>

            {length && width && (
              <div style={{ background: "#EAF3DE", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a4d00" }}>
                  Total area: {parseInt(length) * parseInt(width)} sq ft
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!length || !width}
            style={{
              width: "100%", padding: "15px",
              background: length && width ? "#1a4d00" : "#c6e8a0",
              color: length && width ? "#fff" : "#5a8a3a",
              border: "none", borderRadius: "14px",
              fontSize: "15px", fontWeight: 600, cursor: length && width ? "pointer" : "not-allowed"
            }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 — Garden type + preference */}
      {step === 2 && (
        <div style={{ padding: "24px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🌿</div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a4d00", marginBottom: "8px" }}>Garden type</h2>
            <p style={{ fontSize: "14px", color: "#5a8a3a" }}>What kind of garden space do you have?</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {gardenTypes.map((g) => (
              <div
                key={g.label}
                onClick={() => setGardenType(g.label)}
                style={{
                  background: gardenType === g.label ? "#EAF3DE" : "#fff",
                  border: gardenType === g.label ? "2px solid #1a4d00" : "1.5px solid #c6e8a0",
                  borderRadius: "14px", padding: "16px", textAlign: "center", cursor: "pointer",
                  transition: "all 0.2s",
                  transform: gardenType === g.label ? "scale(1.02)" : "scale(1)",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{g.emoji}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00" }}>{g.label}</div>
                <div style={{ fontSize: "11px", color: "#5a8a3a", marginTop: "2px" }}>{g.sub}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1a4d00", marginBottom: "12px" }}>Plant preference</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {preferences.map((p) => (
              <div
                key={p.label}
                onClick={() => setPreference(p.label)}
                style={{
                  background: preference === p.label ? "#EAF3DE" : "#fff",
                  border: preference === p.label ? "2px solid #1a4d00" : "1.5px solid #c6e8a0",
                  borderRadius: "14px", padding: "14px", textAlign: "center", cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "6px" }}>{p.emoji}</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a4d00" }}>{p.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={!gardenType || !preference}
            style={{
              width: "100%", padding: "15px",
              background: gardenType && preference ? "#1a4d00" : "#c6e8a0",
              color: gardenType && preference ? "#fff" : "#5a8a3a",
              border: "none", borderRadius: "14px",
              fontSize: "15px", fontWeight: 600, cursor: gardenType && preference ? "pointer" : "not-allowed"
            }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 3 — Budget */}
      {step === 3 && (
        <div style={{ padding: "24px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>💰</div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a4d00", marginBottom: "8px" }}>What's your budget?</h2>
            <p style={{ fontSize: "14px", color: "#5a8a3a" }}>We'll suggest plants and materials accordingly</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
            {budgets.map((b) => (
              <div
                key={b.label}
                onClick={() => setBudget(b.label)}
                style={{
                  background: budget === b.label ? "#EAF3DE" : "#fff",
                  border: budget === b.label ? "2px solid #1a4d00" : "1.5px solid #c6e8a0",
                  borderRadius: "14px", padding: "16px",
                  display: "flex", alignItems: "center", gap: "16px",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: "28px" }}>{b.emoji}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a4d00" }}>{b.label}</div>
                  <div style={{ fontSize: "12px", color: "#5a8a3a" }}>{b.sub}</div>
                </div>
                {budget === b.label && (
                  <div style={{ marginLeft: "auto", width: "24px", height: "24px", borderRadius: "50%", background: "#1a4d00", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px" }}>✓</div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: "#EAF3DE", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", marginBottom: "8px" }}>📋 Your garden plan summary:</p>
            <p style={{ fontSize: "12px", color: "#5a8a3a", marginBottom: "4px" }}>📐 Plot: {length} x {width} ft ({parseInt(length) * parseInt(width)} sq ft)</p>
            <p style={{ fontSize: "12px", color: "#5a8a3a", marginBottom: "4px" }}>🏡 Type: {gardenType}</p>
            <p style={{ fontSize: "12px", color: "#5a8a3a" }}>🌿 Preference: {preference}</p>
          </div>

          <button
            onClick={generatePlan}
            disabled={!budget || loading}
            style={{
              width: "100%", padding: "15px",
              background: budget ? "#1a4d00" : "#c6e8a0",
              color: budget ? "#fff" : "#5a8a3a",
              border: "none", borderRadius: "14px",
              fontSize: "15px", fontWeight: 600,
              cursor: budget ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🌿</span>
                AI is designing your garden...
              </>
            ) : "Generate My Garden Plan 🌿"}
          </button>

          {error && (
            <p style={{ color: "#993C1D", fontSize: "13px", textAlign: "center", marginTop: "12px" }}>⚠️ {error}</p>
          )}
        </div>
      )}

      {/* Step 4 — Results */}
      {step === 4 && result && (
        <div style={{ padding: "20px" }}>

          {/* Header */}
          <div style={{ background: "#1a4d00", borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🌿</div>
            <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Your Garden Plan is Ready!</h2>
            <p style={{ color: "#a8d878", fontSize: "13px", lineHeight: 1.6 }}>{result.summary}</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div style={{ background: "#fff", borderRadius: "12px", border: "1.5px solid #e0f0c8", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a4d00" }}>{length}×{width} ft</div>
              <div style={{ fontSize: "11px", color: "#5a8a3a", marginTop: "2px" }}>Plot size</div>
            </div>
            <div style={{ background: "#fff", borderRadius: "12px", border: "1.5px solid #e0f0c8", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a4d00" }}>{result.estimatedCost}</div>
              <div style={{ fontSize: "11px", color: "#5a8a3a", marginTop: "2px" }}>Estimated cost</div>
            </div>
          </div>

          {/* Zones */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a4d00", marginBottom: "14px" }}>🗺️ Garden Zones</p>
            {result.zones?.map((zone: any, i: number) => (
              <div key={i} style={{ background: "#f4f9f0", borderRadius: "12px", padding: "12px", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "20px" }}>{zone.emoji}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00" }}>{zone.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", background: "#EAF3DE", color: "#2d6e00", padding: "2px 8px", borderRadius: "10px" }}>{zone.area}</span>
                </div>
                <p style={{ fontSize: "12px", color: "#5a8a3a", marginBottom: "6px" }}>{zone.description}</p>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" as const }}>
                  {zone.plants?.map((plant: string, j: number) => (
                    <span key={j} style={{ fontSize: "11px", background: "#EAF3DE", color: "#27500A", padding: "2px 8px", borderRadius: "10px" }}>{plant}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Plant list */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a4d00", marginBottom: "14px" }}>🌱 Plant List</p>
            {result.plantList?.map((plant: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f0f8e8" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", margin: 0 }}>{plant.name}</p>
                  <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0" }}>{plant.care}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#2d6e00", fontWeight: 500, margin: 0 }}>Qty: {plant.quantity}</p>
                  <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0" }}>{plant.season}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly calendar */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a4d00", marginBottom: "14px" }}>📅 Planting Calendar</p>
            {result.monthlyCalendar && Object.entries(result.monthlyCalendar).map(([month, activity]: [string, any]) => (
              <div key={month} style={{ display: "flex", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f0f8e8", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: "#1a4d00", padding: "3px 8px", borderRadius: "8px", flexShrink: 0 }}>{month}</span>
                <span style={{ fontSize: "12px", color: "#444" }}>{activity}</span>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a4d00", marginBottom: "12px" }}>💡 Expert Tips</p>
            {result.tips?.map((tip: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>🌿</span>
                <span style={{ fontSize: "13px", color: "#444", lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>

          {/* Watering */}
          <div style={{ background: "#EAF3DE", borderRadius: "14px", padding: "14px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "20px" }}>💧</span>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", margin: "0 0 4px" }}>Watering Schedule</p>
              <p style={{ fontSize: "12px", color: "#5a8a3a", margin: 0 }}>{result.wateringSchedule}</p>
            </div>
          </div>

          {/* Buttons */}
          <button
            onClick={() => { setStep(1); setResult(null); setLength(""); setWidth(""); setGardenType(""); setPreference(""); setBudget(""); }}
            style={{ width: "100%", padding: "14px", background: "#fff", color: "#1a4d00", border: "2px solid #1a4d00", borderRadius: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "10px" }}
          >
            🔄 Plan Another Garden
          </button>
          <button
            onClick={() => router.push("/")}
            style={{ width: "100%", padding: "14px", background: "#1a4d00", color: "#fff", border: "none", borderRadius: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            🌿 Browse Plants
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}