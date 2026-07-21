// categorical palette 取自 dataviz skill 的 references/palette.md,已經跑過
// validate_palette.js 確認在我們的淺色底(#FFFFFF)/深色底上都過關(3 個顏色低於 3:1 對比,
// 所以強制搭配圖例文字,不能只靠顏色辨識)。順序是固定的,不能因為篩選換了資料就重新排色。
const SERIES_COUNT = 8;

interface DonutChartProps {
  segments: { label: string; count: number }[];
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const startInner = polarToCartesian(cx, cy, rInner, endAngle);
  const endInner = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    "M", startOuter.x, startOuter.y,
    "A", rOuter, rOuter, 0, largeArc, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", rInner, rInner, 0, largeArc, 1, startInner.x, startInner.y,
    "Z",
  ].join(" ");
}

export function DonutChart({ segments }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  if (total === 0) return null;

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 90;
  const rInner = 56;

  let cursor = 0;
  const arcs = segments.slice(0, SERIES_COUNT).map((segment, index) => {
    const startAngle = (cursor / total) * 360;
    cursor += segment.count;
    const endAngle = (cursor / total) * 360;
    return {
      ...segment,
      path: describeArc(cx, cy, rOuter, rInner, startAngle, endAngle),
      seriesIndex: index + 1,
      percent: (segment.count / total) * 100,
    };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }} className="donut-chart">
      <style>{`
        .donut-chart .series-1 { fill: #2a78d6; }
        .donut-chart .series-2 { fill: #1baf7a; }
        .donut-chart .series-3 { fill: #eda100; }
        .donut-chart .series-4 { fill: #008300; }
        .donut-chart .series-5 { fill: #4a3aa7; }
        .donut-chart .series-6 { fill: #e34948; }
        .donut-chart .series-7 { fill: #e87ba4; }
        .donut-chart .series-8 { fill: #eb6834; }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .donut-chart .series-1 { fill: #3987e5; }
          :root:not([data-theme="light"]) .donut-chart .series-2 { fill: #199e70; }
          :root:not([data-theme="light"]) .donut-chart .series-3 { fill: #c98500; }
          :root:not([data-theme="light"]) .donut-chart .series-4 { fill: #008300; }
          :root:not([data-theme="light"]) .donut-chart .series-5 { fill: #9085e9; }
          :root:not([data-theme="light"]) .donut-chart .series-6 { fill: #e66767; }
          :root:not([data-theme="light"]) .donut-chart .series-7 { fill: #d55181; }
          :root:not([data-theme="light"]) .donut-chart .series-8 { fill: #d95926; }
        }
        [data-theme="dark"] .donut-chart .series-1 { fill: #3987e5; }
        [data-theme="dark"] .donut-chart .series-2 { fill: #199e70; }
        [data-theme="dark"] .donut-chart .series-3 { fill: #c98500; }
        [data-theme="dark"] .donut-chart .series-4 { fill: #008300; }
        [data-theme="dark"] .donut-chart .series-5 { fill: #9085e9; }
        [data-theme="dark"] .donut-chart .series-6 { fill: #e66767; }
        [data-theme="dark"] .donut-chart .series-7 { fill: #d55181; }
        [data-theme="dark"] .donut-chart .series-8 { fill: #d95926; }
      `}</style>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="標籤分佈圓餅圖">
        {arcs.map((arc) => (
          <path
            key={arc.label}
            d={arc.path}
            className={`series-${arc.seriesIndex}`}
            stroke="var(--color-surface)"
            strokeWidth={2}
          />
        ))}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: "var(--font-ui)", fontSize: 20, fontWeight: 600, fill: "var(--color-text-primary)" }}
        >
          {total}
        </text>
      </svg>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {arcs.map((arc) => (
          <li key={arc.label} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontSize: 13 }}>
            <span
              className={`series-${arc.seriesIndex}`}
              style={{ width: 10, height: 10, borderRadius: 2, flexShrink: 0, display: "inline-block" }}
            />
            <span style={{ color: "var(--color-text-primary)" }}>{arc.label}</span>
            <span style={{ color: "var(--color-text-muted)" }}>
              {arc.count} 張・{arc.percent.toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
