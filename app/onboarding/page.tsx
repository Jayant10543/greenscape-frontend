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
    <main className="gs-app" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", position: "relative" }}>

      {step > 0 && (
        <button
          onClick={handleBack}
          style={{
            position: "absolute", left: "20px", top: "20px",
            background: "none", border: "none", color: "var(--gs-text-2)",
            fontSize: "14px", cursor: "pointer"
          }}
        >
          ← Back
        </button>
      )}

      <button
        onClick={() => router.push("/")}
        style={{
          position: "absolute", right: "20px", top: "20px",
          background: "none", border: "none", color: "var(--gs-text-3)",
          fontSize: "13px", cursor: "pointer"
        }}
      >
        Skip
      </button>

      <div style={{ width: "100%", maxWidth: "440px", paddingTop: "36px" }}>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "52px", height: "52px",
            background: "linear-gradient(135deg, var(--gs-lime), var(--gs-lime-deep))",
            borderRadius: "16px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "26px", margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(184, 242, 60, 0.25)"
          }}>
            🌿
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "20px" }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                height: "6px", borderRadius: "10px",
                background: i < step ? "var(--gs-emerald)" : i === step ? "var(--gs-lime)" : "var(--gs-border-strong)",
                width: i === step ? "28px" : "8px",
                transition: "all 0.3s"
              }} />
            ))}
          </div>

          <h1 style={{
            color: "var(--gs-text-1)", fontSize: "22px", fontWeight: 700, marginBottom: "8px",
            fontFamily: "var(--font-fraunces), serif"
          }}>
            {current.title}
          </h1>
          <p style={{ color: "var(--gs-text-2)", fontSize: "14px" }}>{current.subtitle}</p>

          <div style={{ maxWidth: "200px", margin: "20px auto 0", height: "4px", background: "var(--gs-glass-strong)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "4px",
              background: "var(--gs-emerald)",
              width: `${progressPercent + (100 / steps.length)}%`,
              transition: "width 0.4s ease"
            }} />
          </div>
          <p style={{ color: "var(--gs-text-3)", fontSize: "11px", marginTop: "6px" }}>
            Step {step + 1} of {steps.length}
          </p>
        </div>

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
                  border: isSelected ? "2px solid var(--gs-lime)" : isHovered ? "1.5px solid var(--gs-border-strong)" : "1px solid var(--gs-border)",
                  borderRadius: "16px",
                  padding: "18px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: isSelected ? "var(--gs-glass-strong)" : "var(--gs-glass)",
                  backdropFilter: "blur(20px)",
                  transition: "all 0.2s",
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                  position: "relative" as const,
                }}
              >
                {isSelected && (
                  <div style={{
                    position: "absolute", top: "8px", right: "8px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "var(--gs-lime)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "#0B1410"
                  }}>
                    ✓
                  </div>
                )}
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>{opt.emoji}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--gs-text-1)" }}>{opt.label}</div>
                <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "3px" }}>{opt.sub}</div>
              </div>
            );
          })}
        </div>

        <button
          className="gs-btn-primary"
          onClick={handleNext}
          disabled={!selected || loading}
          style={{
            width: "100%", padding: "15px", fontSize: "15px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            marginBottom: "12px"
          }}
        >
          {loading ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🌿</span>
              Setting up your garden...
            </>
          ) : step < steps.length - 1 ? "Continue →" : "Get my plants! 🌿"}
        </button>

        {Object.keys(answers).length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" as const, justifyContent: "center" }}>
            {Object.values(answers).map((val: any, i) => (
              <span key={i} style={{
                fontSize: "11px", background: "var(--gs-glass-strong)", color: "var(--gs-text-1)",
                border: "1px solid var(--gs-border)",
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