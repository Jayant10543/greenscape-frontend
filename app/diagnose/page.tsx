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
      const response = await fetch("https://greenscape-backend-jyc2.onrender.com/api/diagnose/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  return (
    <main style={{ minHeight: "100vh", background: "#f4f9f0" }}>

      <nav style={{ background: "#1a4d00", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/")} style={{ color: "#a8d878", fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>
          ← Back
        </button>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>🔬 AI Diagnose</span>
        <button onClick={() => router.push("/diagnose/history")} style={{ color: "#a8d878", fontSize: "13px", background: "none", border: "none", cursor: "pointer" }}>
          📜 History
        </button>
      </nav>

      <div style={{ padding: "24px 20px" }}>

        {!result && (
          <>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔬</div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a4d00", marginBottom: "8px" }}>Diagnose your plant</h2>
              <p style={{ fontSize: "14px", color: "#5a8a3a" }}>Upload a clear photo of the affected leaves or plant</p>
            </div>

            <div
              onClick={() => !compressing && fileInputRef.current?.click()}
              style={{
                background: "#fff", borderRadius: "16px", border: "2px dashed #c6e8a0",
                padding: preview ? "12px" : "40px 20px", marginBottom: "16px",
                textAlign: "center", cursor: compressing ? "default" : "pointer",
              }}
            >
              {compressing ? (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>⏳</div>
                  <p style={{ fontSize: "14px", color: "#1a4d00", fontWeight: 600 }}>Processing photo...</p>
                </>
              ) : preview ? (
                <img src={preview} alt="Plant preview" style={{ width: "100%", borderRadius: "12px", maxHeight: "300px", objectFit: "cover" as const }} />
              ) : (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>📷</div>
                  <p style={{ fontSize: "14px", color: "#1a4d00", fontWeight: 600, marginBottom: "4px" }}>Tap to upload a photo</p>
                  <p style={{ fontSize: "12px", color: "#5a8a3a" }}>JPG, PNG, or WEBP</p>
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
                onClick={() => fileInputRef.current?.click()}
                style={{ width: "100%", padding: "10px", background: "none", border: "1.5px solid #c6e8a0", borderRadius: "10px", color: "#1a4d00", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: "16px" }}
              >
                Change photo
              </button>
            )}

            <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#5a8a3a", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                Plant name (optional, helps accuracy)
              </label>
              <input
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                placeholder="e.g. Tomato, Rose, Tulsi"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid #c6e8a0", fontSize: "14px", outline: "none", color: "#1a4d00", boxSizing: "border-box" as const }}
              />
            </div>

            <button
              onClick={analyzePlant}
              disabled={!imageData || loading || compressing}
              style={{
                width: "100%", padding: "15px",
                background: imageData ? "#1a4d00" : "#c6e8a0",
                color: imageData ? "#fff" : "#5a8a3a",
                border: "none", borderRadius: "14px",
                fontSize: "15px", fontWeight: 600,
                cursor: imageData ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🔬</span>
                  Analyzing photo...
                </>
              ) : "Diagnose Plant 🔬"}
            </button>

            {loading && slowLoading && (
              <p style={{ color: "#5a8a3a", fontSize: "12px", textAlign: "center", marginTop: "10px" }}>
                🌙 Server may be waking up after inactivity — this can take up to a minute on first use.
              </p>
            )}

            {error && (
              <p style={{ color: "#993C1D", fontSize: "13px", textAlign: "center", marginTop: "12px" }}>⚠️ {error}</p>
            )}
          </>
        )}

        {result && (
          <div>
            <div style={{
              background: result.isHealthy ? "#1a4d00" : "#993C1D",
              borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "center"
            }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>{result.isHealthy ? "✅" : "⚠️"}</div>
              <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                {result.isHealthy ? "Looks Healthy!" : (result.disease || "Issue Detected")}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", lineHeight: 1.6 }}>{result.summary}</p>
            </div>

            {preview && (
              <img src={preview} alt="Analyzed plant" style={{ width: "100%", borderRadius: "16px", maxHeight: "240px", objectFit: "cover" as const, marginBottom: "16px" }} />
            )}

            <div style={{ display: "grid", gridTemplateColumns: result.severity ? "1fr 1fr 1fr" : "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ background: "#fff", borderRadius: "12px", border: "1.5px solid #e0f0c8", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a4d00" }}>{result.plantIdentified}</div>
                <div style={{ fontSize: "11px", color: "#5a8a3a", marginTop: "2px" }}>
                  {result.plantIdentificationConfidence && result.plantIdentificationConfidence !== "High"
                    ? `Plant (${result.plantIdentificationConfidence} confidence)`
                    : "Plant"}
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: "12px", border: "1.5px solid #e0f0c8", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a4d00" }}>{result.confidence}</div>
                <div style={{ fontSize: "11px", color: "#5a8a3a", marginTop: "2px" }}>Confidence</div>
              </div>
              {result.severity && (
                <div style={{ background: "#fff", borderRadius: "12px", border: "1.5px solid #e0f0c8", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a4d00" }}>{result.severity}</div>
                  <div style={{ fontSize: "11px", color: "#5a8a3a", marginTop: "2px" }}>Severity</div>
                </div>
              )}
            </div>

            {result.symptoms?.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a4d00", marginBottom: "10px" }}>🔍 Symptoms Spotted</p>
                {result.symptoms.map((s: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "13px", color: "#993C1D" }}>•</span>
                    <span style={{ fontSize: "13px", color: "#444" }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {result.cure && !result.isHealthy && (
              <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a4d00", marginBottom: "12px" }}>💊 How to Treat It</p>

                {result.cure.immediate?.length > 0 && (
                  <>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#993C1D", marginBottom: "8px" }}>Immediate steps</p>
                    {result.cure.immediate.map((step: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "16px", flexShrink: 0 }}>1️⃣</span>
                        <span style={{ fontSize: "13px", color: "#444", lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </>
                )}

                {result.cure.ongoing?.length > 0 && (
                  <>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#2d6e00", marginTop: "10px", marginBottom: "8px" }}>Ongoing care</p>
                    {result.cure.ongoing.map((step: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "16px", flexShrink: 0 }}>🌿</span>
                        <span style={{ fontSize: "13px", color: "#444", lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {result.organicTreatment && (
              <div style={{ background: "#EAF3DE", borderRadius: "14px", padding: "14px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px" }}>🍃</span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a4d00", margin: "0 0 4px" }}>Home Remedy</p>
                  <p style={{ fontSize: "12px", color: "#5a8a3a", margin: 0 }}>{result.organicTreatment}</p>
                </div>
              </div>
            )}

            {result.prevention?.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", padding: "16px", marginBottom: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a4d00", marginBottom: "12px" }}>🛡️ Prevent It Next Time</p>
                {result.prevention.map((tip: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "13px", color: "#444", lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={reset}
              style={{ width: "100%", padding: "14px", background: "#fff", color: "#1a4d00", border: "2px solid #1a4d00", borderRadius: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "10px" }}
            >
              🔄 Diagnose Another Plant
            </button>
            <button
              onClick={() => router.push("/")}
              style={{ width: "100%", padding: "14px", background: "#1a4d00", color: "#fff", border: "none", borderRadius: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
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