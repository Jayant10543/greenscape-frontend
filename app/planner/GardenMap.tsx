"use client";

/**
 * GardenMap — draws a proportional top-down map of the garden plan.
 *
 * It takes the `zones` array the planner already returns and packs each zone
 * into a plot rectangle, sizing each zone's box by its share of the total area.
 * No backend changes: this reads the same data the text "Garden Zones" card uses.
 *
 * Layout approach: a simple shelf/row packing. Zones are laid out left-to-right;
 * when the next zone would overflow the current row's width, we wrap to a new row.
 * Each zone's width is proportional to its area share, so bigger zones look bigger.
 * This is an approximate tidy layout, not a literal landscape drawing.
 */

type Zone = {
  name: string;
  emoji?: string;
  area?: string;        // e.g. "40 sq ft"
  description?: string;
  plants?: string[];
};

// A palette of soft fills that still read against the light-green page.
// Cycled per zone so adjacent boxes stay distinguishable.
const ZONE_FILLS = [
  { bg: "#dcefc4", border: "#9cc96b" }, // light leaf
  { bg: "#cfe8f5", border: "#7fbcd8" }, // water/path blue
  { bg: "#f6e6c4", border: "#d8b877" }, // soil/sand
  { bg: "#e7dcf5", border: "#b79cd8" }, // ornamental
  { bg: "#f5d6d6", border: "#d89c9c" }, // accent
  { bg: "#d6f0e2", border: "#7fcea8" }, // herbs
];

// Pull the first number out of strings like "40 sq ft" -> 40.
// Falls back to null when there's no usable number.
function parseArea(area?: string): number | null {
  if (!area) return null;
  const match = area.replace(/,/g, "").match(/\d+(\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return isNaN(n) || n <= 0 ? null : n;
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

  // Work out each zone's area share. If any zone is missing a parseable area,
  // we fall back to equal shares for everyone so the map never breaks.
  const parsedAreas = zones.map((z) => parseArea(z.area));
  const anyMissing = parsedAreas.some((a) => a === null);
  const areas = anyMissing
    ? zones.map(() => 1)
    : (parsedAreas as number[]);
  const totalArea = areas.reduce((sum, a) => sum + a, 0);

  // The drawing canvas keeps the plot's real aspect ratio (length : width).
  // We render at a fixed pixel width and derive height from the ratio, so a
  // wide plot draws wide and a deep plot draws tall.
  const CANVAS_W = 300;
  const aspect = lengthNum && widthNum ? widthNum / lengthNum : 0.66;
  const CANVAS_H = Math.max(160, Math.min(360, Math.round(CANVAS_W * aspect)));

  // Shelf-packing: each zone gets a width proportional to its area share.
  // We accumulate zones into rows; a row is "full" once its widths reach the
  // canvas width, then we wrap. Row heights are split evenly across the rows
  // that end up being used.
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

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1.5px solid #e0f0c8",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      <p
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#1a4d00",
          marginBottom: "4px",
        }}
      >
        🗺️ Garden Layout Map
      </p>
      <p style={{ fontSize: "11px", color: "#888", marginBottom: "14px" }}>
        Top-down view · {lengthNum || "?"} × {widthNum || "?"} ft · box size
        reflects each zone's area
      </p>

      {/* The plot. A dashed border reads as the garden boundary. */}
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
            <div
              key={r}
              style={{
                display: "flex",
                height: rowHeight + "px",
                width: "100%",
              }}
            >
              {row.map((placed) => {
                const fill = ZONE_FILLS[placed.idx % ZONE_FILLS.length];
                // Width within the row is this zone's share of the row's total.
                const widthPct = (placed.areaShare / rowShareTotal) * 100;
                return (
                  <div
                    key={placed.idx}
                    title={placed.zone.name}
                    style={{
                      width: widthPct + "%",
                      height: "100%",
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
                    }}
                  >
                    <span style={{ fontSize: "20px", lineHeight: 1 }}>
                      {placed.zone.emoji || "🌱"}
                    </span>
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
                      {placed.zone.name}
                    </span>
                    {placed.zone.area && (
                      <span style={{ fontSize: "9px", color: "#5a8a3a" }}>
                        {placed.zone.area}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

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
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                color: "#444",
              }}
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

      {anyMissing && (
        <p
          style={{
            fontSize: "10px",
            color: "#b0894a",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          Some zones didn't include an area, so boxes are shown at equal size.
        </p>
      )}
    </div>
  );
}