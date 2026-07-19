"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DiagnoseHistory() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view your diagnosis history.");
      setLoading(false);
      return;
    }

    fetch("https://greenscape-backend-jyc2.onrender.com/api/diagnose/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setHistory(data);
      })
      .catch((err) => {
        console.error("History fetch error:", err);
        setError("Failed to load history.");
      })
      .finally(() => setLoading(false));
  }, []);

  const deleteEntry = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDeletingId(id);
    try {
      await fetch(`https://greenscape-backend-jyc2.onrender.com/api/diagnose/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((h) => h._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
    setDeletingId(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
      " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const card = { background: "var(--gs-glass)", border: "1px solid var(--gs-border)", borderRadius: "16px", backdropFilter: "blur(20px)" };

  return (
    <main className="gs-app">

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--gs-border)" }}>
        <button onClick={() => router.push("/diagnose")} style={{ color: "var(--gs-text-2)", fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>
          ← Back
        </button>
        <span style={{ color: "var(--gs-text-1)", fontWeight: 700, fontSize: "15px" }}>📜 Diagnosis History</span>
        <div style={{ width: "60px" }} />
      </nav>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--gs-text-2)" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
            Loading history...
          </div>
        )}

        {!loading && error && (
          <div style={{ ...card, padding: "30px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔒</div>
            <p style={{ color: "var(--gs-text-2)", fontSize: "14px", marginBottom: "16px" }}>{error}</p>
            <button
              className="gs-btn-primary"
              onClick={() => router.push("/login")}
              style={{ padding: "10px 20px", fontSize: "13px" }}
            >
              Log In
            </button>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div style={{ ...card, padding: "30px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>🌱</div>
            <p style={{ color: "var(--gs-text-2)", fontSize: "14px", marginBottom: "16px" }}>No diagnoses yet. Try scanning a plant!</p>
            <button
              className="gs-btn-primary"
              onClick={() => router.push("/diagnose")}
              style={{ padding: "10px 20px", fontSize: "13px" }}
            >
              Diagnose a Plant
            </button>
          </div>
        )}

        {!loading && !error && history.length > 0 && !selected && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {history.map((h) => (
              <div
                key={h._id}
                onClick={() => setSelected(h)}
                style={{ ...card, borderRadius: "14px", overflow: "hidden", cursor: "pointer" }}
              >
                <img
                  src={`data:${h.mediaType};base64,${h.image}`}
                  alt={h.plantIdentified}
                  style={{ width: "100%", height: "120px", objectFit: "cover" as const }}
                />
                <div style={{ padding: "10px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                    {h.plantIdentified}
                  </div>
                  <div style={{ fontSize: "11px", color: h.isHealthy ? "var(--gs-emerald)" : "var(--gs-red)", fontWeight: 600 }}>
                    {h.isHealthy ? "✅ Healthy" : `⚠️ ${h.disease}`}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--gs-text-3)", marginTop: "4px" }}>{formatDate(h.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: "none", border: "none", color: "var(--gs-lime)", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: "14px", padding: 0 }}
            >
              ← All history
            </button>

            <div style={{
              background: selected.isHealthy
                ? "linear-gradient(135deg, rgba(184,242,60,0.16), rgba(47,209,128,0.06))"
                : "linear-gradient(135deg, rgba(255,107,107,0.16), rgba(255,107,107,0.05))",
              border: `1px solid ${selected.isHealthy ? "var(--gs-border-strong)" : "rgba(255,107,107,0.3)"}`,
              borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "center"
            }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>{selected.isHealthy ? "✅" : "⚠️"}</div>
              <h2 style={{ color: "var(--gs-text-1)", fontSize: "18px", fontWeight: 700, marginBottom: "8px", fontFamily: "var(--font-fraunces), serif" }}>
                {selected.isHealthy ? "Looks Healthy!" : (selected.disease || "Issue Detected")}
              </h2>
              <p style={{ color: "var(--gs-text-2)", fontSize: "13px", lineHeight: 1.6 }}>{selected.summary}</p>
            </div>

            <img
              src={`data:${selected.mediaType};base64,${selected.image}`}
              alt={selected.plantIdentified}
              style={{ width: "100%", borderRadius: "16px", maxHeight: "240px", objectFit: "cover" as const, marginBottom: "16px" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: selected.severity ? "1fr 1fr 1fr" : "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ ...card, borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gs-text-1)" }}>{selected.plantIdentified}</div>
                <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "2px" }}>Plant</div>
              </div>
              <div style={{ ...card, borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gs-text-1)" }}>{selected.confidence}</div>
                <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "2px" }}>Confidence</div>
              </div>
              {selected.severity && (
                <div style={{ ...card, borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gs-text-1)" }}>{selected.severity}</div>
                  <div style={{ fontSize: "11px", color: "var(--gs-text-2)", marginTop: "2px" }}>Severity</div>
                </div>
              )}
            </div>

            {selected.symptoms?.length > 0 && (
              <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "10px" }}>🔍 Symptoms Spotted</p>
                {selected.symptoms.map((s: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "13px", color: "var(--gs-red)" }}>•</span>
                    <span style={{ fontSize: "13px", color: "var(--gs-text-2)" }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {selected.cure && !selected.isHealthy && (
              <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gs-text-1)", marginBottom: "12px" }}>💊 How to Treat It</p>
                {selected.cure.immediate?.map((step: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>1️⃣</span>
                    <span style={{ fontSize: "13px", color: "var(--gs-text-2)", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
                {selected.cure.ongoing?.map((step: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>🌿</span>
                    <span style={{ fontSize: "13px", color: "var(--gs-text-2)", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: "12px", color: "var(--gs-text-3)", textAlign: "center", marginBottom: "16px" }}>
              Diagnosed on {formatDate(selected.createdAt)}
            </div>

            <button
              onClick={() => deleteEntry(selected._id)}
              disabled={deletingId === selected._id}
              style={{ width: "100%", padding: "12px", background: "rgba(255,107,107,0.08)", color: "var(--gs-red)", border: "1.5px solid rgba(255,107,107,0.35)", borderRadius: "14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              {deletingId === selected._id ? "Deleting..." : "🗑️ Delete This Entry"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}