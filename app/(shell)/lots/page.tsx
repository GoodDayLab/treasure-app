import { getLots } from "@/lib/data";
import { LotList } from "./LotList";

export default async function LotsPage() {
  const lots = await getLots();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-voice)", fontSize: 24, margin: "0 0 8px 0", color: "var(--color-text-primary)" }}>
        群組管理
      </h1>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
        整批進貨的卡片會歸在同一個群組裡,平均成本 = 整批總價 ÷ 整批張數。改總價或張數,底下卡片的買入價會自動重算。
      </p>
      {lots.length === 0 ? (
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--color-text-muted)" }}>
          還沒有任何群組。到「新增卡片」選「群組建檔」就會自動建立。
        </p>
      ) : (
        <LotList lots={lots} />
      )}
    </main>
  );
}
