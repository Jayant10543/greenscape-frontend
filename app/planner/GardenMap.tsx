"use client";

/**
 * GardenMap — draws a proportional top-down map of the garden plan.
 *
 * Two rendering modes, chosen automatically:
 *
 *  1. GRID mode (preferred): if every zone has a valid `layout` {col,row,w,h}
 *     on a 12x12 grid (returned by the AI planner), we draw each zone at its
 *     real position — pathways as strips, lawn as a big block, etc. This looks
 *     like a designed layout.
 *
 *  2. PACK mode (fallback): if any zone is missing/has invalid layout data
 *     (e.g. an older saved plan generated before this feature), we fall back to
 *     the original area-proportional row packing. Nothing breaks.
 *
 * Either way this reads the same `zones` array the text "Garden Zones" card uses.
 */

type ZoneLayout = { col: number; row: number; w: number; h: number };

type Zone = {
  name: string;
  emoji?: string;
  area?: string; // e.g. "40 sq ft"
  description?: string;
  plants?: string[];
  layout?: ZoneLayout;
};

const GRID = 12; // the plot is a 12x12 grid, matching the backend prompt

// Soft fills that read against the light-green page, cycled per zone.
const ZONE_FILLS = [
  { bg: "#dcefc4", border: "#9cc96b" }, // light leaf
  { bg: "#cfe8f5", border: "#7fbcd8" }, // water/path blue
  { bg: "#f6e6c4", border: "#d8b877" }, // soil/sand
  { bg: "#e7dcf5", border: "#b79cd8" }, // ornamental
  { bg: "#f5d6d6", border: "#d89c9c" }, // accent
  { bg: "#d6f0e2", border: "#7fcea8" }, // herbs
];

// Pull the first number out of "40 sq ft" -> 40. Returns null if unusable.
function parseArea(area?: string): number | null {
  if (!area) return null;
  const match = area.replace(/,/g, "").match(/\d+(\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return isNaN(n) || n <= 0 ? null : n;
}

// A layout is valid only if it's fully inside the 12x12 grid with positive size.
function isValidLayout(l?: ZoneLayout): l is ZoneLayout {
  if (!l) return false;
  const { col, row, w, h } = l;
  if ([col, row, w, h].some((v) => typeof v !== "number" || isNaN(v))) return false;
  if (w <= 0 || h <= 0) return false;
  if (col < 0 || row < 0) return false;
  if (col + w > GRID || row + h > GRID) return false;
  return true;
}

export default function GardenMap({
  zones,
  length,
  width,
}: {
  zones: Zone[];
  length: string;
  width: string;
}) {
  if (!zones || zones.length === 0) return null;

  const lengthNum = parseInt(length) || 0;
  const widthNum = parseInt(width) || 0;

  // Canvas keeps the plot's real aspect ratio so a wide plot draws wide.
  const CANVAS_W = 300;
  const aspect = lengthNum && widthNum ? widthNum / lengthNum : 0.66;
  const CANVAS_H = Math.max(160, Math.min(360, Math.round(CANVAS_W * aspect)));

  // Use grid mode only if EVERY zone has a valid layout. One bad zone -> pack.
  const useGrid = zones.every((z) => isValidLayout(z.layout));

  const shell = (inner: React.ReactNode, note?: string) => (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1.5px solid #e0f0c8",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a4d00", marginBottom: "4px" }}>
        🗺️ Garden Layout Map
      </p>
      <p style={{ fontSize: "11px", color: "#888", marginBottom: "14px" }}>
        Top-down view · {lengthNum || "?"} × {widthNum || "?"} ft
        {useGrid ? " · designed layout" : " · box size reflects each zone's area"}
      </p>
      {inner}
      {/* Legend — ties each colored box back to its zone name. */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "14px",
          justifyContent: "center",
        }}
      >
        {zones.map((zone, idx) => {
          const fill = ZONE_FILLS[idx % ZONE_FILLS.length];
          return (
            <div
              key={idx}
              style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#444" }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: fill.bg,
                  border: `1.5px solid ${fill.border}`,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {zone.emoji} {zone.name}
            </div>
          );
        })}
      </div>
      {note && (
        <p style={{ fontSize: "10px", color: "#b0894a", textAlign: "center", marginTop: "10px" }}>
          {note}
        </p>
      )}
    </div>
  );

  // A single zone box, shared by both modes.
  const zoneBox = (zone: Zone, idx: number, style: React.CSSProperties) => {
    const fill = ZONE_FILLS[idx % ZONE_FILLS.length];
    return (
      <div
        key={idx}
        title={zone.name}
        style={{
          background: fill.bg,
          border: `1.5px solid ${fill.border}`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          textAlign: "center",
          overflow: "hidden",
          ...style,
        }}
      >
        <span style={{ fontSize: "18px", lineHeight: 1 }}>{zone.emoji || "🌱"}</span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#27500A",
            marginTop: "3px",
            lineHeight: 1.2,
            wordBreak: "break-word",
          }}
        >
          {zone.name}
        </span>
        {zone.area && <span style={{ fontSize: "9px", color: "#5a8a3a" }}>{zone.area}</span>}
      </div>
    );
  };

  // ---- GRID MODE: absolute-positioned boxes on a 12x12 grid ----
  if (useGrid) {
    const cellW = CANVAS_W / GRID;
    const cellH = CANVAS_H / GRID;
    return shell(
      <div
        style={{
          position: "relative",
          width: CANVAS_W + "px",
          maxWidth: "100%",
          height: CANVAS_H + "px",
          margin: "0 auto",
          border: "2px dashed #1a4d00",
          borderRadius: "10px",
          overflow: "hidden",
          background: "#f4f9f0",
        }}
      >
        {zones.map((zone, idx) => {
          const l = zone.layout as ZoneLayout;
          return zoneBox(zone, idx, {
            position: "absolute",
            left: l.col * cellW + "px",
            top: l.row * cellH + "px",
            width: l.w * cellW + "px",
            height: l.h * cellH + "px",
          });
        })}
      </div>
    );
  }

  // ---- PACK MODE (fallback): area-proportional row packing ----
  const parsedAreas = zones.map((z) => parseArea(z.area));
  const anyMissing = parsedAreas.some((a) => a === null);
  const areas = anyMissing ? zones.map(() => 1) : (parsedAreas as number[]);
  const totalArea = areas.reduce((sum, a) => sum + a, 0);

  type Placed = { zone: Zone; areaShare: number; idx: number };
  const rows: Placed[][] = [];
  let currentRow: Placed[] = [];
  let currentRowShare = 0;
  const targetRowShare = 1 / Math.max(1, Math.round(Math.sqrt(zones.length)));

  zones.forEach((zone, idx) => {
    const areaShare = areas[idx] / totalArea;
    currentRow.push({ zone, areaShare, idx });
    currentRowShare += areaShare;
    if (currentRowShare >= targetRowShare && idx !== zones.length - 1) {
      rows.push(currentRow);
      currentRow = [];
      currentRowShare = 0;
    }
  });
  if (currentRow.length) rows.push(currentRow);
  const rowHeight = CANVAS_H / rows.length;

  return shell(
    <div
      style={{
        width: CANVAS_W + "px",
        maxWidth: "100%",
        height: CANVAS_H + "px",
        margin: "0 auto",
        border: "2px dashed #1a4d00",
        borderRadius: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#f4f9f0",
      }}
    >
      {rows.map((row, r) => {
        const rowShareTotal = row.reduce((s, p) => s + p.areaShare, 0);
        return (
          <div key={r} style={{ display: "flex", height: rowHeight + "px", width: "100%" }}>
            {row.map((placed) =>
              zoneBox(placed.zone, placed.idx, {
                width: (placed.areaShare / rowShareTotal) * 100 + "%",
                height: "100%",
              })
            )}
          </div>
        );
      })}
    </div>,
    anyMissing ? "Some zones didn't include an area, so boxes are shown at equal size." : undefined
  );
}