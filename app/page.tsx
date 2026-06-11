"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api/plants";
const WEATHER_URL = "http://localhost:5000/api/weather";
const categories = ["All", "Herb", "Flower", "Tree", "Indoor", "Fruit"];

export default function Home() {
  const [plants, setPlants] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [user, setUser] = useState<any>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [savedPlants, setSavedPlants] = useState<string[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const router = useRouter();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Auth + saved plants sync
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setSavedPlants(u.savedPlants || []);
    }

    // Re-sync savedPlants every time page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const latest = localStorage.getItem("user");
        if (latest) {
          const u = JSON.parse(latest);
          setSavedPlants(u.savedPlants || []);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Fetch plants
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setPlants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching plants:", err);
        setLoading(false);
      });
  }, []);

  // Fetch weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `http://localhost:5000/api/weather/coords?lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setWeather(data);
        },
        () => {
          const city = user?.city || "Agra";
          fetch(`${WEATHER_URL}/${city}`)
            .then((res) => res.json())
            .then((data) => setWeather(data));
        }
      );
    } else {
      const city = user?.city || "Agra";
      fetch(`${WEATHER_URL}/${city}`)
        .then((res) => res.json())
        .then((data) => setWeather(data));
    }
  }, [user]);

  // Reset visible count on filter change
  useEffect(() => {
    setVisibleCount(12);
  }, [search, active]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSavePlant = async (e: React.MouseEvent, plantId: string) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;

    const alreadySaved = savedPlants.includes(plantId);

    try {
      const res = await fetch("http://localhost:5000/api/auth/save-plant", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plantId }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.savedPlants || [];
        setSavedPlants(updated);

        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          u.savedPlants = updated;
          localStorage.setItem("user", JSON.stringify(u));
        }

        showToast(alreadySaved ? "💔 Removed from saved plants" : "❤️ Plant saved to your profile!");
      } else {
        const err = await res.json();
        console.error("Save error:", err);
        showToast("Could not save plant, try again");
      }
    } catch (err) {
      console.error("Save plant error:", err);
      showToast("Could not save plant, try again");
    }
  };

  const getWeatherRecommendation = () => {
    if (!weather) return null;
    const temp = weather.temperature;
    const condition = weather.condition;
    if (condition === "Rain" || condition === "Drizzle") {
      return { text: "Great day to plant! Avoid watering today.", emoji: "🌧" };
    } else if (condition === "Thunderstorm") {
      return { text: "Stay indoors. Protect your plants from storm.", emoji: "⛈" };
    } else if (temp > 40) {
      return { text: "Too hot! Water plants early morning only.", emoji: "🔥" };
    } else if (temp > 35) {
      return { text: "Hot day. Best to plant drought-tolerant varieties.", emoji: "☀️" };
    } else if (temp > 25) {
      return { text: "Good weather for most Indian plants.", emoji: "🌤" };
    } else {
      return { text: "Perfect planting weather today!", emoji: "🌱" };
    }
  };

  const getWeatherFilter = (plant: any) => {
    if (!weather) return true;
    const temp = weather.temperature;
    const condition = weather.condition;
    if (temp > 40) {
      return plant.tags.some((t: string) =>
        t.toLowerCase().includes("drought") ||
        t.toLowerCase().includes("low water") ||
        t.toLowerCase().includes("full sun")
      );
    } else if (condition === "Rain" || condition === "Drizzle") {
      return plant.tags.some((t: string) =>
        t.toLowerCase().includes("high water") ||
        t.toLowerCase().includes("tropical") ||
        t.toLowerCase().includes("partial")
      );
    }
    return true;
  };

  const recommendation = getWeatherRecommendation();

  const filtered = plants.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = active === "All" || p.category === active.toLowerCase();
    const matchWeather = getWeatherFilter(p);

    const matchOnboarding = (() => {
      if (!user?.gardenType) return true;
      if (user.gardenType === "Indoor plants") return p.category === "indoor";
      if (user.gardenType === "Balcony") {
        return p.tags.some((t: string) =>
          t.toLowerCase().includes("low water") ||
          t.toLowerCase().includes("indoor") ||
          t.toLowerCase().includes("partial")
        );
      }
      if (user.maintenance === "Low maintenance") return p.difficulty === "easy";
      return true;
    })();

    return matchSearch && matchCat && matchWeather && matchOnboarding;
  });

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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "#4CAF50" }}>
            🌿
          </div>
          <div>
            <div className="font-semibold text-white text-sm">GreenScape AI</div>
            <div className="text-xs" style={{ color: "#a8d878" }}>
              {user ? `Hi, ${user.name.split(" ")[0]}!` : "Smart plant companion"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            onClick={() => showToast("🚧 AI Diagnose coming in Phase 3!")}
            className="text-sm px-4 py-1.5 rounded-full cursor-pointer"
            style={{ color: "#c8e8a0", transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            🔬 Diagnose
          </span>
          <span
            onClick={() => showToast("🚧 Garden Planner coming in Phase 4!")}
            className="text-sm px-4 py-1.5 rounded-full cursor-pointer"
            style={{ color: "#c8e8a0", transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            🗺️ Planner
          </span>
          <button
            onClick={() => router.push("/profile")}
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", cursor: "pointer" }}
          >
            {user?.name?.split(" ")[0]} 👤
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "#1a4d00", paddingBottom: "48px", paddingTop: "40px" }} className="px-6 text-center">
        <div className="inline-block text-xs px-4 py-1.5 rounded-full border mb-5" style={{ background: "#2d6e00", color: "#a8d878", borderColor: "#4CAF50" }}>
          🇮🇳 Optimized for Indian climate
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
          Grow smarter with{" "}
          <span style={{ color: "#7ed957" }}>AI-powered</span>{" "}
          plant intelligence
        </h1>
        <p className="text-sm mb-8" style={{ color: "#a8d878" }}>
          Weather-aware recommendations for your soil, region & lifestyle
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-16 mb-6">
          <div>
            <div className="text-2xl font-bold" style={{ color: "#7ed957" }}>{plants.length > 0 ? `${plants.length}+` : "500+"}</div>
            <div className="text-xs mt-1" style={{ color: "#a8d878" }}>Indian plants</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: "#7ed957" }}>28</div>
            <div className="text-xs mt-1" style={{ color: "#a8d878" }}>Climate zones</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: "#7ed957" }}>AI</div>
            <div className="text-xs mt-1" style={{ color: "#a8d878" }}>Disease detection</div>
          </div>
        </div>

        {/* Weather card */}
        {weather && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "10px 20px", marginBottom: "12px", flexWrap: "wrap" as const, justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt="weather" style={{ width: "32px", height: "32px" }} />
              <div>
                <div style={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}>{weather.temperature}°C</div>
                <div style={{ color: "#a8d878", fontSize: "11px" }}>{weather.description}</div>
              </div>
            </div>
            <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.2)" }}></div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>{weather.city}</div>
              <div style={{ color: "#a8d878", fontSize: "11px" }}>Humidity: {weather.humidity}%</div>
            </div>
            <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.2)" }}></div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#7ed957", fontSize: "12px", fontWeight: 500 }}>Wind: {weather.windSpeed} m/s</div>
              <div style={{ color: "#a8d878", fontSize: "11px" }}>Feels like {weather.feelsLike}°C</div>
            </div>
          </div>
        )}

        {/* Weather recommendation */}
        {recommendation && (
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "8px 16px", marginBottom: "20px" }}>
            <span style={{ fontSize: "13px", color: "#fff" }}>
              {recommendation.emoji} {recommendation.text}
            </span>
          </div>
        )}

        {/* Search bar */}
        <div style={{ maxWidth: "520px", margin: "0 auto", background: "#fff", borderRadius: "16px", padding: "8px", display: "flex", gap: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(search.trim())}
            placeholder="Search plant, city, or soil type..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#1a4d00", padding: "8px 12px", background: "transparent" }}
          />
          <button
            onClick={() => setSearch(search.trim())}
            style={{ background: "#1a4d00", color: "#fff", border: "none", borderRadius: "10px", padding: "8px 20px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
          >
            Find plants
          </button>
        </div>
      </section>

      {/* Curve */}
      <div style={{ background: "#1a4d00" }}>
        <div style={{ background: "#f4f9f0", borderRadius: "24px 24px 0 0", height: "28px" }}></div>
      </div>

      {/* User preferences bar */}
      {user?.gardenType && (
        <div style={{ padding: "10px 20px 0", display: "flex", gap: "8px", flexWrap: "wrap" as const }}>
          {user.gardenType && <span style={{ fontSize: "12px", background: "#EAF3DE", color: "#1a4d00", padding: "4px 12px", borderRadius: "20px" }}>🏡 {user.gardenType}</span>}
          {user.soilType && <span style={{ fontSize: "12px", background: "#EAF3DE", color: "#1a4d00", padding: "4px 12px", borderRadius: "20px" }}>🌱 {user.soilType}</span>}
          {user.maintenance && <span style={{ fontSize: "12px", background: "#EAF3DE", color: "#1a4d00", padding: "4px 12px", borderRadius: "20px" }}>⏱ {user.maintenance}</span>}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", padding: "12px 20px 8px", flexWrap: "wrap" as const }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            style={{
              fontSize: "12px", padding: "6px 16px", borderRadius: "20px",
              border: "1.5px solid", fontWeight: 500, cursor: "pointer",
              background: active === cat ? "#1a4d00" : "#fff",
              color: active === cat ? "#fff" : "#2d6e00",
              borderColor: active === cat ? "#1a4d00" : "#c6e8a0",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 20px 12px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a4d00" }}>
          {weather && weather.temperature > 40
            ? "Best plants for hot weather"
            : weather?.condition === "Rain"
            ? "Best plants for rainy weather"
            : "Recommended for your region"}
        </span>
        <span style={{ fontSize: "12px", background: "#e0f5c0", color: "#2d6e00", padding: "3px 12px", borderRadius: "20px", fontWeight: 500 }}>
          {loading ? "Loading..." : `${filtered.length} plants`}
        </span>
      </div>

      {/* Skeleton loading */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "0 20px 24px" }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #e0f0c8", overflow: "hidden" }}>
              <div style={{ height: "160px", background: "linear-gradient(90deg, #e8f5e0 25%, #d4edcc 50%, #e8f5e0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              <div style={{ padding: "12px" }}>
                <div style={{ height: "14px", background: "#e8f5e0", borderRadius: "8px", marginBottom: "8px", width: "70%" }} />
                <div style={{ height: "11px", background: "#f0f8e8", borderRadius: "8px", marginBottom: "12px", width: "50%" }} />
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                  <div style={{ height: "20px", width: "50px", background: "#e8f5e0", borderRadius: "10px" }} />
                  <div style={{ height: "20px", width: "60px", background: "#e8f5e0", borderRadius: "10px" }} />
                </div>
                <div style={{ height: "1px", background: "#f0f8e8", marginBottom: "8px" }} />
                <div style={{ height: "11px", background: "#e8f5e0", borderRadius: "8px", width: "40%" }} />
              </div>
            </div>
          ))}
          <style>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🌵</div>
          <p style={{ fontSize: "18px", fontWeight: 700, color: "#1a4d00", marginBottom: "8px" }}>No plants found</p>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>
            Try a different search term or category
          </p>
          <button
            onClick={() => { setSearch(""); setActive("All"); }}
            style={{ background: "#1a4d00", color: "#fff", border: "none", borderRadius: "12px", padding: "10px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Plant grid */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "0 20px 24px" }}>
          {filtered.slice(0, visibleCount).map((plant) => (
            <div
              key={plant._id}
              onMouseEnter={() => setHoveredCard(plant._id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: "#fff",
                borderRadius: "16px",
                border: hoveredCard === plant._id ? "1.5px solid #4CAF50" : "1.5px solid #e0f0c8",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                transition: "box-shadow 0.22s, transform 0.22s, border-color 0.22s",
                transform: hoveredCard === plant._id ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: hoveredCard === plant._id ? "0 12px 32px rgba(26,77,0,0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* ❤️ Heart button */}
              <button
                onClick={(e) => handleSavePlant(e, plant._id)}
                style={{
                  position: "absolute", top: "8px", left: "8px", zIndex: 20,
                  width: "30px", height: "30px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.95)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.25)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                {savedPlants.includes(plant._id) ? "❤️" : "🤍"}
              </button>

              {/* Image */}
              <div
                onClick={() => plant._id && router.push(`/plant/${plant._id}`)}
                style={{ height: "160px", overflow: "hidden", position: "relative" }}
              >
                {plant.image ? (
                  <img
                    src={plant.image}
                    alt={plant.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#2d6e00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
                    🌿
                  </div>
                )}
                <span style={{
                  position: "absolute", top: "8px", right: "8px", fontSize: "11px",
                  padding: "3px 10px", borderRadius: "20px", fontWeight: 500,
                  background: plant.difficulty === "easy" ? "#d4f0a0" : "#faeeda",
                  color: plant.difficulty === "easy" ? "#2d6e00" : "#633806"
                }}>
                  {plant.difficulty}
                </span>
              </div>

              {/* Card body */}
              <div
                onClick={() => plant._id && router.push(`/plant/${plant._id}`)}
                style={{ padding: "12px" }}
              >
                <p style={{ fontWeight: 600, fontSize: "14px", color: "#1a4d00", marginBottom: "2px" }}>{plant.name}</p>
                <p style={{ fontSize: "11px", color: "#888", fontStyle: "italic", marginBottom: "8px" }}>{plant.latin}</p>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" as const, marginBottom: "10px" }}>
                  {plant.tags.map((tag: string) => (
                    <span key={tag} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: "#EAF3DE", color: "#27500A" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #f0f8e8" }}>
                  <span style={{ fontSize: "11px", color: "#5a8a3a" }}>🌡 {plant.climate}</span>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "16px", fontWeight: "bold" }}>+</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {!loading && filtered.length > visibleCount && (
        <div style={{ textAlign: "center", padding: "0 20px 24px" }}>
          <button
            onClick={() => setVisibleCount(visibleCount + 12)}
            style={{ background: "#fff", color: "#1a4d00", border: "2px solid #1a4d00", borderRadius: "12px", padding: "12px 32px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            Load more plants ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "0 20px 32px" }}>
        <div
          onClick={() => showToast("🚧 AI Diagnose coming in Phase 3!")}
          style={{ background: "#1a4d00", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🔬</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Diagnose a plant</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>Upload photo, get cure</div>
          </div>
        </div>
        <div
          onClick={() => showToast("🚧 Garden Planner coming in Phase 4!")}
          style={{ background: "#2d7a4a", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🗺️</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Plan my garden</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>AI layout designer</div>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => {
            const el = document.getElementById("main-scroll");
            if (el) el.scrollTo({ top: 0, behavior: "smooth" });
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{
            position: "fixed", bottom: "24px", right: "20px", zIndex: 100,
            width: "44px", height: "44px", borderRadius: "50%",
            background: "#1a4d00", color: "#fff", border: "none",
            fontSize: "20px", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          ↑
        </button>
      )}

    </main>
  );
}