"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    title: "What are you looking for?",
    subtitle: "We'll personalise your plant recommendations",
    key: "gardenType",
    options: [
      { label: "Home garden", sub: "Outdoor space", emoji: "🏡" },
      { label: "Indoor plants", sub: "Inside home", emoji: "🪴" },
      { label: "Farmhouse", sub: "Large space", emoji: "🏘" },
      { label: "Balcony", sub: "Small space", emoji: "🌇" },
    ],
  },
  {
    title: "What's your soil type?",
    subtitle: "This helps us pick the right plants for you",
    key: "soilType",
    options: [
      { label: "Sandy soil", sub: "Dry & loose", emoji: "🏜" },
      { label: "Loamy soil", sub: "Best for plants", emoji: "🌱" },
      { label: "Clay soil", sub: "Heavy & moist", emoji: "🧱" },
      { label: "Don't know", sub: "We'll figure it out", emoji: "🤷" },
    ],
  },
  {
    title: "How much time can you give?",
    subtitle: "We'll match plants to your lifestyle",
    key: "maintenance",
    options: [
      { label: "Low maintenance", sub: "Minimal effort", emoji: "😌" },
      { label: "Medium", sub: "Some effort", emoji: "🙂" },
      { label: "Love gardening", sub: "Daily care", emoji: "🧑‍🌾" },
      { label: "Just learning", sub: "Complete beginner", emoji: "📚" },
    ],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredOption, setHoveredOption] = useState("");

  const current = steps[step];

  const handleNext = async () => {
    if (!selected) return;
    const newAnswers = { ...answers, [current.key]: selected };
    setAnswers(newAnswers);
    setSelected("");

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://greenscape-backend-jyc2.onrender.com/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newAnswers),
        });
        const data = await res.json();
        // Update localStorage with preferences
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          const updated = { ...u, ...data };
          localStorage.setItem("user", JSON.stringify(updated));
        }
        router.push("/");
      } catch (err) {
        router.push("/");
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setSelected(answers[steps[step - 1].key] || "");
    }
  };

  const progressPercent = ((step) / steps.length) * 100;

  return (
    <main style={{ minHeight: "100vh", background: "#f4f9f0", display: "flex", flexDirection: "column" }}>

      {/* Top section */}
      <div style={{ background: "#1a4d00", padding: "40px 24px 56px", textAlign: "center", position: "relative" }}>

        {/* Back button */}
        {step > 0 && (
          <button
            onClick={handleBack}
            style={{
              position: "absolute", left: "20px", top: "20px",
              background: "none", border: "none", color: "#a8d878",
              fontSize: "14px", cursor: "pointer"
            }}
          >
            ← Back
          </button>
        )}

        {/* Skip button */}
        <button
          onClick={() => router.push("/")}
          style={{
            position: "absolute", right: "20px", top: "20px",
            background: "none", border: "none", color: "rgba(255,255,255,0.4)",
            fontSize: "13px", cursor: "pointer"
          }}
        >
          Skip
        </button>

        {/* Logo */}
        <div style={{
          width: "52px", height: "52px", background: "#4CAF50",
          borderRadius: "16px", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "26px", margin: "0 auto 16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
        }}>
          🌿
        </div>

        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "20px" }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: "6px", borderRadius: "10px",
              background: i < step ? "#7ed957" : i === step ? "#fff" : "rgba(255,255,255,0.2)",
              width: i === step ? "28px" : "8px",
              transition: "all 0.3s"
            }} />
          ))}
        </div>

        <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
          {current.title}
        </h1>
        <p style={{ color: "#a8d878", fontSize: "14px" }}>{current.subtitle}</p>

        {/* Progress bar */}
        <div style={{ maxWidth: "200px", margin: "20px auto 0", height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "4px",
            background: "#7ed957",
            width: `${progressPercent + (100 / steps.length)}%`,
            transition: "width 0.4s ease"
          }} />
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "6px" }}>
          Step {step + 1} of {steps.length}
        </p>
      </div>

      {/* Options */}
      <div style={{ background: "#f4f9f0", borderRadius: "28px 28px 0 0", marginTop: "-24px", flex: 1, padding: "28px 24px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          {current.options.map((opt) => {
            const isSelected = selected === opt.label;
            const isHovered = hoveredOption === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => setSelected(opt.label)}
                onMouseEnter={() => setHoveredOption(opt.label)}
                onMouseLeave={() => setHoveredOption("")}
                style={{
                  border: isSelected ? "2px solid #1a4d00" : isHovered ? "1.5px solid #4CAF50" : "1.5px solid #c6e8a0",
                  borderRadius: "16px",
                  padding: "18px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: isSelected ? "#EAF3DE" : "#fff",
                  transition: "all 0.2s",
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                  boxShadow: isSelected ? "0 4px 16px rgba(26,77,0,0.12)" : "0 2px 6px rgba(0,0,0,0.04)",
                  position: "relative" as const,
                }}
              >
                {/* Checkmark */}
                {isSelected && (
                  <div style={{
                    position: "absolute", top: "8px", right: "8px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#1a4d00", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "#fff"
                  }}>
                    ✓
                  </div>
                )}
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>{opt.emoji}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00" }}>{opt.label}</div>
                <div style={{ fontSize: "11px", color: "#5a8a3a", marginTop: "3px" }}>{opt.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleNext}
          disabled={!selected || loading}
          style={{
            width: "100%", padding: "15px",
            background: selected ? "#1a4d00" : "#c6e8a0",
            color: selected ? "#fff" : "#5a8a3a",
            border: "none", borderRadius: "14px",
            fontSize: "15px", fontWeight: 600,
            cursor: selected ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            marginBottom: "12px"
          }}
          onMouseEnter={e => { if (selected && !loading) e.currentTarget.style.background = "#2d6e00" }}
          onMouseLeave={e => { if (selected && !loading) e.currentTarget.style.background = selected ? "#1a4d00" : "#c6e8a0" }}
        >
          {loading ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🌿</span>
              Setting up your garden...
            </>
          ) : step < steps.length - 1 ? "Continue →" : "Get my plants! 🌿"}
        </button>

        {/* What you've selected so far */}
        {Object.keys(answers).length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" as const, justifyContent: "center" }}>
            {Object.values(answers).map((val: any, i) => (
              <span key={i} style={{
                fontSize: "11px", background: "#EAF3DE", color: "#1a4d00",
                padding: "3px 10px", borderRadius: "20px", fontWeight: 500
              }}>
                ✓ {val}
              </span>
            ))}
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