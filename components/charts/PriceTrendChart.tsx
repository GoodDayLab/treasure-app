interface PricePoint {
  price: number;
  recordedAt: string;
}

// 單一數列不需要圖例(標題已經說明是什麼),照 dataviz skill 的線圖規格:
// 2px 線、端點 marker >= 8px、surface ring、只在端點直接標值,不是每個點都標。
export function PriceTrendChart({ points, currency }: { points: PricePoint[]; currency: string }) {
  if (points.length < 2) {
    return (
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>
        目前只有一筆價格記錄,累積更多價格點之後才看得出走勢。
      </p>
    );
  }

  const width = 560;
  const height = 160;
  const padding = { top: 16, right: 12, bottom: 24, left: 12 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const prices = points.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const xFor = (index: number) => padding.left + (index / (points.length - 1)) * plotWidth;
  const yFor = (price: number) => padding.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(point.price)}`).join(" ");

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="價格走勢圖">
      <line
        x1={padding.left}
        y1={padding.top + plotHeight}
        x2={width - padding.right}
        y2={padding.top + plotHeight}
        stroke="var(--color-border)"
        strokeWidth={1}
      />

      <path d={linePath} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {[first, last].map((point, i) => {
        const index = i === 0 ? 0 : points.length - 1;
        return (
          <g key={point.recordedAt + i}>
            <circle cx={xFor(index)} cy={yFor(point.price)} r={5} fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth={2} />
            <text
              x={xFor(index)}
              y={yFor(point.price) - 12}
              textAnchor={i === 0 ? "start" : "end"}
              style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, fill: "var(--color-text-primary)" }}
            >
              {currency} {point.price.toLocaleString()}
            </text>
            <title>{`${point.recordedAt}:${currency} ${point.price.toLocaleString()}`}</title>
          </g>
        );
      })}

      <text x={padding.left} y={height - 4} style={{ fontFamily: "var(--font-ui)", fontSize: 11, fill: "var(--color-text-muted)" }}>
        {first.recordedAt}
      </text>
      <text x={width - padding.right} y={height - 4} textAnchor="end" style={{ fontFamily: "var(--font-ui)", fontSize: 11, fill: "var(--color-text-muted)" }}>
        {last.recordedAt}
      </text>
    </svg>
  );
}
