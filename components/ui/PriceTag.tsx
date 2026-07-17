interface PriceTagProps {
  changePercent: number; // 正數=漲,負數=跌,0=持平
}

// 顏色沉穩(森林綠/磚紅),避免財經 App 常見的螢光紅綠破壞質感。
export function PriceTag({ changePercent }: PriceTagProps) {
  const isFlat = changePercent === 0;
  const isUp = changePercent > 0;

  const color = isFlat
    ? "var(--color-text-muted)"
    : isUp
    ? "var(--color-success)"
    : "var(--color-danger)";

  const label = isFlat ? "持平" : `${isUp ? "+" : ""}${changePercent.toFixed(1)}%`;

  return (
    <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color }}>
      {label}
    </span>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div
      style={{
        background: "var(--color-surface-muted)",
        borderRadius: "var(--radius-ui)",
        padding: "16px",
      }}
    >
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-secondary)" }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 24,
          fontWeight: 500,
          color: "var(--color-text-primary)",
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
