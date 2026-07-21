"use client";

import { useState } from "react";
import { DonutChart } from "./DonutChart";
import type { TagBreakdown } from "@/lib/data";

export function TagBreakdownChart({ breakdowns }: { breakdowns: TagBreakdown[] }) {
  const [dimensionId, setDimensionId] = useState(breakdowns[0]?.dimensionId ?? "");
  const active = breakdowns.find((breakdown) => breakdown.dimensionId === dimensionId) ?? breakdowns[0];

  if (!active) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-voice)", fontSize: 20, margin: 0, color: "var(--color-text-primary)" }}>
          依{active.dimensionName}分佈
        </h2>
        {breakdowns.length > 1 && (
          <select
            value={dimensionId}
            onChange={(event) => setDimensionId(event.target.value)}
            style={{
              padding: "6px 10px",
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--color-text-primary)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-ui)",
            }}
          >
            {breakdowns.map((breakdown) => (
              <option key={breakdown.dimensionId} value={breakdown.dimensionId}>
                {breakdown.dimensionName}
              </option>
            ))}
          </select>
        )}
      </div>
      <DonutChart segments={active.segments} />
    </div>
  );
}
