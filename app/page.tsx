"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Sprout, Microscope, Map, User, Search, Heart,
  Thermometer, Droplets, Wind, Flame, CloudRain, CloudLightning,
  Sun, Cloud, ArrowUp, Plus, Home as HomeIcon, Clock, MapPin,
} from "lucide-react";
import { getCityInfo, isPlantSuitableForZone, ZONE_TIPS } from "./utils/locationUtils";

const API_URL = "https://greenscape-backend-jyc2.onrender.com/api/plants";
const WEATHER_URL = "https://greenscape-backend-jyc2.onrender.com/api/weather";
const categories = ["All", "Herb", "Flower", "Tree", "Indoor", "Fruit"];

export default function Home() {
  const [plants, setPlants] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [user, setUser] = useState<any>(null);
  const [cityInfo, setCityInfo] = useState<any>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [savedPlants, setSavedPlants] = useState<string[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const router = useRouter();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (!token) { router.push("/login"); return; }
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setSavedPlants(u.savedPlants || []);
      if (u.city) setCityInfo(getCityInfo(u.city));
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const latest = localStorage.getItem("user");
        if (latest) { const u = JSON.parse(latest); setSavedPlants(u.savedPlants || []); }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => { setPlants(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://greenscape-backend-jyc2.onrender.com/api/weather/coords?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setWeather(data);
        },
        () => {
          const city = user?.city || "Agra";
          fetch(`${WEATHER_URL}/${city}`).then((r) => r.json()).then(setWeather);
        }
      );
    } else {
      const city = user?.city || "Agra";
      fetch(`${WEATHER_URL}/${city}`).then((r) => r.json()).then(setWeather);
    }
  }, [user]);

  useEffect(() => { setVisibleCount(12); }, [search, active]);

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
      const res = await fetch("https://greenscape-backend-jyc2.onrender.com/api/auth/save-plant", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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
        showToast(alreadySaved ? "Removed from saved plants" : "Plant saved!");
      }
    } catch { showToast("Could not save plant"); }
  };

  const getWeatherRecommendation = () => {
    if (!weather) return null;
    const temp = weather.temperature;
    const condition = weather.condition;
    if (condition === "Rain" || condition === "Drizzle") return { text: "Great day to plant! Avoid watering today.", Icon: CloudRain };
    if (condition === "Thunderstorm") return { text: "Stay indoors. Protect your plants from storm.", Icon: CloudRain };
    if (temp > 40) return { text: "Too hot! Water plants early morning only.", Icon: Flame };
    if (temp > 35) return { text: "Hot day. Best to plant drought-tolerant varieties.", Icon: Sun };
    if (temp > 25) return { text: "Good weather for most Indian plants.", Icon: Cloud };
    return { text: "Perfect planting weather today!", Icon: Sprout };
  };

  const getLocationWeatherFilter = (plant: any) => {
    if (cityInfo?.zone) {
      if (!isPlantSuitableForZone(plant, cityInfo.zone)) return false;
    }
    if (weather) {
      const temp = weather.temperature;
      const condition = weather.condition;
      if (temp > 42) {
        return plant.tags?.some((t: string) =>
          t.toLowerCase().includes("drought") || t.toLowerCase().includes("low water") || t.toLowerCase().includes("full sun")
        );
      }
      if (condition === "Rain" || condition === "Drizzle") {
        return !plant.tags?.some((t: string) => t.toLowerCase().includes("drought"));
      }
    }
    return true;
  };

  const recommendation = getWeatherRecommendation();

  const filtered = plants.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = active === "All" || p.category === active.toLowerCase();
    const matchLocation = getLocationWeatherFilter(p);
    const matchOnboarding = (() => {
      if (!user?.gardenType) return true;
      if (user.gardenType === "Indoor plants") return p.category === "indoor";
      if (user.gardenType === "Balcony") return p.tags?.some((t: string) => t.toLowerCase().includes("low water") || t.toLowerCase().includes("indoor") || t.toLowerCase().includes("partial"));
      if (user.maintenance === "Low maintenance") return p.difficulty === "easy";
      return true;
    })();
    return matchSearch && matchCat && matchLocation && matchOnboarding;
  });

  return (
    <main className="gs-app">

      {toast && (
        <div style={{
          position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(20,33,15,0.92)", backdropFilter: "blur(16px)",
          border: "1px solid var(--gs-border-strong)", color: "var(--gs-text-1)",
          padding: "13px 22px", borderRadius: "var(--gs-radius-sm)",
          fontSize: "13px", fontWeight: 500, zIndex: 1000,
          boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        }}>{toast}</div>
      )}

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "linear-gradient(135deg, var(--gs-lime), var(--gs-emerald))",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Sprout size={17} color="#0B1410" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "-0.01em" }}>GreenScape</div>
            <div style={{ fontSize: "10px", color: "var(--gs-text-3)" }}>
              {user ? `Hi, ${user.name?.split(" ")[0]}` : "Smart plant companion"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={() => router.push("/diagnose")} style={{ fontSize: "12px", color: "var(--gs-text-2)", background: "var(--gs-glass)", border: "1px solid var(--gs-border)", borderRadius: "var(--gs-radius-pill)", padding: "7px 14px", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}>
            Diagnose
          </button>
          <button onClick={() => router.push("/planner")} style={{ fontSize: "12px", color: "var(--gs-text-2)", background: "var(--gs-glass)", border: "1px solid var(--gs-border)", borderRadius: "var(--gs-radius-pill)", padding: "7px 14px", cursor: "pointer", fontFamily: "Manrope, sans-serif" }}>
            Planner
          </button>
          <button onClick={() => router.push("/profile")} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--gs-glass)", border: "1px solid var(--gs-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--gs-text-1)" }}>
            <User size={15} />
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "10px 20px 56px", display: "grid", gap: "28px" }}>

        {/* Hero */}
        <div className="hero-grid" style={{ display: "grid", gap: "32px", alignItems: "center" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "var(--gs-glass)", border: "1px solid var(--gs-border)",
              borderRadius: "var(--gs-radius-pill)", padding: "6px 14px",
              fontSize: "12px", color: "var(--gs-text-2)", marginBottom: "16px",
              backdropFilter: "blur(20px)",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gs-lime)", flexShrink: 0 }} />
              Optimized for Indian climate
            </div>
            <h1 style={{ fontSize: "clamp(26px, 5vw, 48px)", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "14px" }}>
              Grow smarter with{" "}
              <span style={{ background: "linear-gradient(90deg, var(--gs-lime), var(--gs-emerald))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                AI plant
              </span>{" "}
              intelligence
            </h1>
            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--gs-text-2)", maxWidth: "440px", marginBottom: "20px" }}>
              Weather-aware recommendations matched to your soil, region, and lifestyle.
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plant, city, or soil type"
                className="gs-input"
                style={{ flex: 1, padding: "11px 14px", fontSize: "13px" }}
              />
              <button onClick={() => setSearch(search.trim())} className="gs-btn-primary" style={{ padding: "11px 18px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Search size={14} /> Find
              </button>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
              <div><div style={{ fontSize: "17px", fontWeight: 800 }}>{plants.length > 0 ? `${plants.length}+` : "50+"}</div><div style={{ fontSize: "11px", color: "var(--gs-text-3)" }}>Indian plants</div></div>
              <div><div style={{ fontSize: "17px", fontWeight: 800 }}>28</div><div style={{ fontSize: "11px", color: "var(--gs-text-3)" }}>Climate zones</div></div>
              <div><div style={{ fontSize: "17px", fontWeight: 800 }}>AI</div><div style={{ fontSize: "11px", color: "var(--gs-text-3)" }}>Disease detection</div></div>
            </div>
          </div>

          {weather && (
            <div className="gs-glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>{weather.city}</div>
                <div style={{ fontSize: "11px", color: "var(--gs-text-3)" }}>Live</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.02em" }}>{weather.temperature}</span>
                <span style={{ fontSize: "17px", color: "var(--gs-text-2)", fontWeight: 600 }}>°C</span>
                {weather.icon && <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt="" style={{ width: "26px", height: "26px", marginLeft: "auto" }} />}
              </div>
              <div style={{ fontSize: "12px", color: "var(--gs-text-2)", marginBottom: "14px" }}>{weather.description} · Feels like {weather.feelsLike}°C</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--gs-border)", borderRadius: "var(--gs-radius-md)", padding: "10px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <Droplets size={13} color="var(--gs-text-3)" />
                  <div><div style={{ fontSize: "12px", fontWeight: 700 }}>{weather.humidity}%</div><div style={{ fontSize: "9px", color: "var(--gs-text-3)" }}>Humidity</div></div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--gs-border)", borderRadius: "var(--gs-radius-md)", padding: "10px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <Wind size={13} color="var(--gs-text-3)" />
                  <div><div style={{ fontSize: "12px", fontWeight: 700 }}>{weather.windSpeed}m/s</div><div style={{ fontSize: "9px", color: "var(--gs-text-3)" }}>Wind</div></div>
                </div>
              </div>
              {recommendation && (
                <div style={{ background: "linear-gradient(135deg, rgba(255,180,84,0.12), rgba(255,180,84,0.04))", border: "1px solid rgba(255,180,84,0.25)", borderRadius: "var(--gs-radius-md)", padding: "11px 13px", display: "flex", gap: "9px", alignItems: "flex-start" }}>
                  <recommendation.Icon size={14} color="var(--gs-amber)" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "11.5px", lineHeight: 1.5, color: "var(--gs-text-1)", margin: 0 }}>{recommendation.text}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User preferences */}
        {user?.gardenType && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {user.gardenType && <span style={{ fontSize: "11px", background: "var(--gs-glass)", border: "1px solid var(--gs-border)", color: "var(--gs-text-2)", padding: "5px 12px", borderRadius: "var(--gs-radius-pill)", display: "flex", alignItems: "center", gap: "5px" }}><HomeIcon size={11} /> {user.gardenType}</span>}
            {user.soilType && <span style={{ fontSize: "11px", background: "var(--gs-glass)", border: "1px solid var(--gs-border)", color: "var(--gs-text-2)", padding: "5px 12px", borderRadius: "var(--gs-radius-pill)", display: "flex", alignItems: "center", gap: "5px" }}><Sprout size={11} /> {user.soilType}</span>}
            {user.maintenance && <span style={{ fontSize: "11px", background: "var(--gs-glass)", border: "1px solid var(--gs-border)", color: "var(--gs-text-2)", padding: "5px 12px", borderRadius: "var(--gs-radius-pill)", display: "flex", alignItems: "center", gap: "5px" }}><Clock size={11} /> {user.maintenance}</span>}
          </div>
        )}

        {/* Location banner */}
        {cityInfo && (
          <div style={{ background: "var(--gs-glass)", border: "1px solid var(--gs-border)", borderRadius: "var(--gs-radius-md)", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <MapPin size={14} color="var(--gs-lime)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "2px" }}>Showing plants for {cityInfo.label} — {cityInfo.state}</div>
              <div style={{ fontSize: "11px", color: "var(--gs-text-2)" }}>{ZONE_TIPS[cityInfo.zone as keyof typeof ZONE_TIPS]}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActive(cat)} style={{ fontSize: "12px", padding: "7px 16px", borderRadius: "var(--gs-radius-pill)", border: "1px solid", fontWeight: 500, cursor: "pointer", background: active === cat ? "var(--gs-lime)" : "var(--gs-glass)", color: active === cat ? "#0B1410" : "var(--gs-text-2)", borderColor: active === cat ? "var(--gs-lime)" : "var(--gs-border)", fontFamily: "Manrope, sans-serif", transition: "all 0.15s" }}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700 }}>
              {cityInfo ? `Best plants for ${cityInfo.label}` : weather && weather.temperature > 40 ? "Best plants for hot weather" : "Recommended for your region"}
            </span>
            <span style={{ fontSize: "11px", background: "var(--gs-glass)", border: "1px solid var(--gs-border)", color: "var(--gs-text-2)", padding: "4px 12px", borderRadius: "var(--gs-radius-pill)", fontWeight: 500 }}>
              {loading ? "Loading..." : `${filtered.length} plants`}
            </span>
          </div>

          {/* Skeleton */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="gs-glass-card" style={{ overflow: "hidden" }}>
                  <div style={{ height: "130px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s infinite" }} />
                  <div style={{ padding: "12px" }}>
                    <div style={{ height: "11px", background: "var(--gs-glass)", borderRadius: "6px", marginBottom: "8px", width: "70%" }} />
                    <div style={{ height: "9px", background: "var(--gs-glass)", borderRadius: "6px", width: "50%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="gs-glass-card" style={{ textAlign: "center", padding: "48px 20px" }}>
              <Sprout size={40} color="var(--gs-text-3)" style={{ marginBottom: "14px" }} />
              <p style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>No plants found</p>
              <p style={{ fontSize: "12px", color: "var(--gs-text-3)", marginBottom: "18px" }}>Try a different search or category</p>
              <button onClick={() => { setSearch(""); setActive("All"); }} className="gs-btn-primary" style={{ padding: "10px 24px", fontSize: "13px" }}>Clear filters</button>
            </div>
          )}

          {/* Plant grid */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
              {filtered.slice(0, visibleCount).map((plant) => (
                <div key={plant._id} className="gs-glass-card" onMouseEnter={() => setHoveredCard(plant._id)} onMouseLeave={() => setHoveredCard(null)}
                  style={{ overflow: "hidden", cursor: "pointer", position: "relative", transition: "transform 0.2s, border-color 0.2s", transform: hoveredCard === plant._id ? "translateY(-4px)" : "translateY(0)", borderColor: hoveredCard === plant._id ? "var(--gs-lime)" : "var(--gs-border)" }}>

                  <button onClick={(e) => handleSavePlant(e, plant._id)}
                    style={{ position: "absolute", top: "8px", left: "8px", zIndex: 20, width: "28px", height: "28px", borderRadius: "50%", background: "rgba(11,20,16,0.7)", backdropFilter: "blur(8px)", border: "1px solid var(--gs-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Heart size={13} fill={savedPlants.includes(plant._id) ? "var(--gs-red)" : "none"} color={savedPlants.includes(plant._id) ? "var(--gs-red)" : "var(--gs-text-2)"} />
                  </button>

                  <div onClick={() => plant._id && router.push(`/plant/${plant._id}`)} style={{ height: "140px", overflow: "hidden", position: "relative" }}>
                    {plant.image ? (
                      <img src={plant.image} alt={plant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer-when-downgrade" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "rgba(184,242,60,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Sprout size={28} color="var(--gs-lime)" />
                      </div>
                    )}
                    <span style={{ position: "absolute", top: "7px", right: "7px", fontSize: "10px", padding: "2px 8px", borderRadius: "var(--gs-radius-pill)", fontWeight: 600, background: plant.difficulty === "easy" ? "rgba(184,242,60,0.85)" : "rgba(255,180,84,0.85)", color: "#0B1410" }}>
                      {plant.difficulty}
                    </span>
                  </div>

                  <div onClick={() => plant._id && router.push(`/plant/${plant._id}`)} style={{ padding: "11px" }}>
                    <p style={{ fontWeight: 700, fontSize: "12.5px", marginBottom: "2px" }}>{plant.name}</p>
                    <p style={{ fontSize: "10px", color: "var(--gs-text-3)", fontStyle: "italic", marginBottom: "7px" }}>{plant.latin}</p>
                    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {plant.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "var(--gs-radius-pill)", background: "rgba(184,242,60,0.10)", color: "var(--gs-lime)" }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--gs-border)" }}>
                      <span style={{ fontSize: "10px", color: "var(--gs-text-3)", display: "flex", alignItems: "center", gap: "3px" }}>
                        <Thermometer size={10} /> {plant.climate}
                      </span>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--gs-lime)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Plus size={12} color="#0B1410" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length > visibleCount && (
            <div style={{ textAlign: "center", paddingTop: "20px" }}>
              <button onClick={() => setVisibleCount(visibleCount + 12)} className="gs-btn-secondary" style={{ padding: "10px 26px", fontSize: "13px" }}>
                Load more ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div onClick={() => router.push("/diagnose")} className="gs-glass-card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(184,242,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Microscope size={18} color="var(--gs-lime)" />
            </div>
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700 }}>Diagnose</div>
              <div style={{ fontSize: "10px", color: "var(--gs-text-3)" }}>Upload a photo</div>
            </div>
          </div>
          <div onClick={() => router.push("/planner")} className="gs-glass-card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(47,209,128,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Map size={18} color="var(--gs-emerald)" />
            </div>
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700 }}>Garden Planner</div>
              <div style={{ fontSize: "10px", color: "var(--gs-text-3)" }}>AI layout</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .hero-grid { grid-template-columns: 1.1fr 0.9fr; }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
      `}</style>

      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ position: "fixed", bottom: "24px", right: "20px", zIndex: 100, width: "42px", height: "42px", borderRadius: "50%", background: "var(--gs-lime)", color: "#0B1410", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(184,242,60,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowUp size={17} strokeWidth={2.5} />
        </button>
      )}
    </main>
  );
}