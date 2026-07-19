"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Diagnose() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [plantName, setPlantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const [compressing, setCompressing] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSlowLoading(false);
      return;
    }
    const timer = setTimeout(() => setSlowLoading(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  const compressImage = (file: File, maxDimension = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported"));
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setError("");
    try {
      const compressedDataUrl = await compressImage(file);
      setMediaType("image/jpeg");
      setPreview(compressedDataUrl);
      setImageData(compressedDataUrl.split(",")[1]);
    } catch (err) {
      console.error("Image compression failed:", err);
      setError("Couldn't process that image. Please try a different photo.");
    }
    setCompressing(false);
  };

  const analyzePlant = async () => {
    if (!imageData) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("https://greenscape-backend-jyc2.onrender.com/api/diagnose/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({ image: imageData, mediaType, plantName }),
      });

      const parsed = await response.json();
      if (parsed.error) throw new Error(parsed.error);
      setResult(parsed);
    } catch (err) {
      console.error("Diagnose error:", err);
      setError("Failed to analyze photo. Please try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setPreview(null);
    setImageData(null);
    setPlantName("");
    setResult(null);
    setError("");
  };

  const card = { background: "var(--gs-glass)", border: "1px solid var(--gs-border)", borderRadius: "16px", backdropFilter: "blur(20px)" };

  return (
    <main className="gs-app">

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--gs-border)" }}>
        <button onClick={() => router.push("/")} style={{ color: "var(--gs-text-2)", fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>
          ← Back
        </button>
        <span style={{ color: "var(--gs-text-1)", fontWeight: 700, fontSize: "15px" }}>🔬 AI Diagnose</span>
        <button onClick={() => router.push("/diagnose/history")} style={{ color: "var(--gs-text-2)", fontSize: "13px", background: "none", border: "none", cursor: "pointer" }}>
          📜 History
        </button>
      </nav>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 20px" }}>

        {!result && (
          <>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔬</div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "8px", fontFamily: "var(--font-fraunces), serif" }}>Diagnose your plant</h2>
              <p style={{ fontSize: "14px", color: "var(--gs-text-2)" }}>Upload a clear photo of the affected leaves or plant</p>
            </div>

            <div
              onClick={() => !compressing && fileInputRef.current?.click()}
              style={{
                background: "var(--gs-glass)", borderRadius: "16px", border: "2px dashed var(--gs-border-strong)",
                padding: preview ? "12px" : "40px 20px", marginBottom: "16px",
                textAlign: "center", cursor: compressing ? "default" : "pointer",
              }}
            >
              {compressing ? (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>⏳</div>
                  <p style={{ fontSize: "14px", color: "var(--gs-text-1)", fontWeight: 600 }}>Processing photo...</p>
                </>
              ) : preview ? (
                <img src={preview} alt="Plant preview" style={{ width: "100%", borderRadius: "12px", maxHeight: "300px", objectFit: "cover" as const }} />
              ) : (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>📷</div>
                  <p style={{ fontSize: "14px", color: "var(--gs-text-1)", fontWeight: 600, marginBottom: "4px" }}>Tap to upload a photo</p>
                  <p style={{ fontSize: "12px", color: "var(--gs-text-3)" }}>JPG, PNG, or WEBP</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {preview && (
              <button
                className="gs-btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: "100%", padding: "10px", fontSize: "13px", marginBottom: "16px" }}
              >
                Change photo
              </button>
            )}

            <div style={{ ...card, padding: "16px", marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "var(--gs-text-2)", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                Plant name (optional, helps accuracy)
              </label>
              <input
                className="gs-input"
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                placeholder="e.g. Tomato, Rose, Tulsi"
                style={{ width: "100%", padding: "12px", fontSize: "14px", boxSizing: "border-box" as const }}
              />
            </div>

            <button
              className="gs-btn-primary"
              onClick={analyzePlant}
              disabled={!imageData || loading || compressing}
              style={{ width: "100%", padding: "15px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🔬</span>
                  Analyzing photo...
                </>
              ) : "Diagnose Plant 🔬"}
            </button>

            {loading && slowLoading && (
              <p style={{ color: "var(--gs-text-2)", fontSize: "12px", textAlign: "center", marginTop: "10px" }}>
                🌙 Server may be waking up after inactivity — this can take up to a minute on first use.
              </p>
            )}

            {error && (
              <p style={{ color: "var(--gs-red)", fontSize: "13px", textAlign: "center", marginTop: "12px" }}>⚠️ {error}</p>
            )}
          </>
        )}

        {result && (
          <div>
            <div style={{
              background: result.isHealthy
                ? "linear-gradient(135deg, rgba(184,242,60,0.16), rgba(47,209,128,0.06))"
                : "linear-gradient(135deg, rgba(255,107,107,0.16), rgba(255,107,107,0.05))",
              border: `1px solid ${result.isHealthy ? "var(--gs-border-strong)" : "rgba(255,107,107,0.3)"}`,
              borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "center"
            }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>{result.isHealthy ? "✅" : "⚠️"}</div>
              <h2 style={{ color: "var(--gs-text-1)", fontSize: "18px", fontWeight: 700, marginBottom: "8px", fontFamily: "var(--font-fraunces), serif" }}>
                {result.isHealthy ? "Looks Healthy!" : (result.disease || "Issue Detected")}
              </h2>
              <p style={{ color: "var(--gs-text-2)", fontSize: "13px", lineHeight: 1.6 }}>{result.summary}</p>
            </div>

            {preview && (
              <img src={preview} alt="Analyzed plant" style={{ width: "100%", borderRadius: "16px", maxHeight: "240px", objectFit: "cover" as const, marginBottom: "16px" }} />
            )}

            <div style={{ display: "grid", gridTemplateColumns: result.severity ? "1fr 1fr 1fr" : "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ ...card, borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gs-text-1)" }}>{result.plantIdentified}</div>
                <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "2px" }}>
                  {result.plantIdentificationConfidence && result.plantIdentificationConfidence !== "High"
                    ? `Plant (${result.plantIdentificationConfidence} confidence)`
                    : "Plant"}
                </div>
              </div>
              <div style={{ ...card, borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gs-text-1)" }}>{result.confidence}</div>
                <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "2px" }}>Confidence</div>
              </div>
              {result.severity && (
                <div style={{ ...card, borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gs-text-1)" }}>{result.severity}</div>
                  <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "2px" }}>Severity</div>
                </div>
              )}
            </div>

            {result.symptoms?.length > 0 && (
              <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "10px" }}>🔍 Symptoms Spotted</p>
                {result.symptoms.map((s: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "13px", color: "var(--gs-red)" }}>•</span>
                    <span style={{ fontSize: "13px", color: "var(--gs-text-2)" }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {result.cure && !result.isHealthy && (
              <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "12px" }}>💊 How to Treat It</p>

                {result.cure.immediate?.length > 0 && (
                  <>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--gs-amber)", marginBottom: "8px" }}>Immediate steps</p>
                    {result.cure.immediate.map((step: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "16px", flexShrink: 0 }}>1️⃣</span>
                        <span style={{ fontSize: "13px", color: "var(--gs-text-2)", lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </>
                )}

                {result.cure.ongoing?.length > 0 && (
                  <>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--gs-emerald)", marginTop: "10px", marginBottom: "8px" }}>Ongoing care</p>
                    {result.cure.ongoing.map((step: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "16px", flexShrink: 0 }}>🌿</span>
                        <span style={{ fontSize: "13px", color: "var(--gs-text-2)", lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {result.organicTreatment && (
              <div style={{ background: "linear-gradient(135deg, rgba(47,209,128,0.12), rgba(47,209,128,0.04))", border: "1px solid rgba(47,209,128,0.25)", borderRadius: "14px", padding: "14px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px" }}>🍃</span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--gs-text-1)", margin: "0 0 4px" }}>Home Remedy</p>
                  <p style={{ fontSize: "12px", color: "var(--gs-text-2)", margin: 0 }}>{result.organicTreatment}</p>
                </div>
              </div>
            )}

            {result.prevention?.length > 0 && (
              <div style={{ ...card, padding: "16px", marginBottom: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "12px" }}>🛡️ Prevent It Next Time</p>
                {result.prevention.map((tip: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "13px", color: "var(--gs-text-2)", lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="gs-btn-secondary"
              onClick={reset}
              style={{ width: "100%", padding: "14px", fontSize: "14px", marginBottom: "10px" }}
            >
              🔄 Diagnose Another Plant
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