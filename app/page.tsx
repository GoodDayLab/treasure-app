import Link from "next/link";
import { CardThumbnail } from "@/components/ui/CardThumbnail";
import { MetricCard } from "@/components/ui/PriceTag";
import { getCollectionSummary, getSoldSummary } from "@/lib/data";

export default async function Home() {
  const [cards, soldCards] = await Promise.all([getCollectionSummary(), getSoldSummary()]);

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

      {soldCards.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "var(--font-voice)", fontSize: 20, margin: "0 0 16px 0", color: "var(--color-text-primary)" }}>
            已售出
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {soldCards.map((card) => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-ui)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {card.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-secondary)" }}>
                    {card.game} · {card.series} · {card.saleDate} 售出
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {card.currency} {card.salePrice.toLocaleString()}
                  </div>
                  {card.realizedGain != null && (
                    <div
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: 12,
                        color: card.realizedGain >= 0 ? "var(--color-success)" : "var(--color-danger)",
                      }}
                    >
                      {card.realizedGain >= 0 ? "+" : ""}
                      {card.realizedGain.toLocaleString()}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
