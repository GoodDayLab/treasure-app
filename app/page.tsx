import { CardThumbnail } from "@/components/ui/CardThumbnail";
import { MetricCard } from "@/components/ui/PriceTag";
import { getCollectionSummary } from "@/lib/data";

export default async function Home() {
  const cards = await getCollectionSummary();

  const totalValue = cards.reduce((sum, card) => sum + card.price, 0);
  const avgChange = cards.length > 0 ? cards.reduce((sum, card) => sum + card.changePercent, 0) / cards.length : 0;

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px" }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-voice)", fontSize: 28, margin: 0, color: "var(--color-text-primary)" }}>
          我的收藏
        </h1>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--color-text-secondary)", marginTop: 4 }}>
          共 {cards.length} 張卡,依鑑定版本個別追蹤價格
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(140px, 1fr))", gap: 12, marginBottom: 40 }}>
        <MetricCard label="收藏總數" value={`${cards.length} 張`} />
        <MetricCard label="總市值" value={`NT$ ${totalValue.toLocaleString()}`} />
        <MetricCard label="平均漲跌" value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(1)}%`} />
      </div>

      {cards.length === 0 ? (
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--color-text-muted)" }}>
          還沒有收藏卡片。執行 <code>npx prisma db seed</code> 可以匯入展示資料。
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 220px)", gap: 28 }}>
          {cards.map((card) => (
            <CardThumbnail
              key={card.id}
              id={card.id}
              name={card.name}
              series={`${card.game} · ${card.series}`}
              price={card.price}
              currency={card.currency}
              changePercent={card.changePercent}
              imageUrl={card.imageUrl}
            />
          ))}
        </div>
      )}
    </main>
  );
}
