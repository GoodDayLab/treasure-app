"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import type { LotSummary, LotDetail } from "@/lib/data";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontFamily: "var(--font-ui)",
  fontSize: 14,
  color: "var(--color-text-primary)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-ui)",
};

function LotCard({ lot }: { lot: LotSummary }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [totalPrice, setTotalPrice] = useState(String(lot.totalPrice));
  const [cardCount, setCardCount] = useState(String(lot.cardCount));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [items, setItems] = useState<LotDetail["items"] | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const handleToggleItems = async () => {
    if (showItems) {
      setShowItems(false);
      return;
    }
    setShowItems(true);
    if (items) return;
    setIsLoadingItems(true);
    try {
      const response = await fetch(`/api/lots/${lot.id}`);
      const detail: LotDetail = await response.json();
      setItems(detail.items);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch(`/api/lots/${lot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice: Number(totalPrice), cardCount: Number(cardCount) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "更新失敗");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const avgPrice = Number(totalPrice) > 0 && Number(cardCount) > 0 ? Number(totalPrice) / Number(cardCount) : lot.avgPrice;

  return (
    <SectionCard title={lot.name}>
      {isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-secondary)" }}>
              整批總價(NT$)
              <input style={inputStyle} type="number" min={0} value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-secondary)" }}>
              整批張數
              <input style={inputStyle} type="number" min={1} value={cardCount} onChange={(e) => setCardCount(e.target.value)} />
            </label>
          </div>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-muted)" }}>
            平均每張成本會變成 NT$ {Math.round(avgPrice).toLocaleString()},已建檔的 {lot.linkedItemCount} 張卡片買入價會一起更新
          </span>
          {error && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-danger)" }}>{error}</span>}
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "儲存中…" : "儲存"}
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              取消
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ui)", fontSize: 14 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>
              整批 {lot.cardCount} 張・總價 NT$ {lot.totalPrice.toLocaleString()}
              {lot.source && ` ・${lot.source}`}
            </span>
            <span style={{ fontWeight: 600, color: "var(--color-accent-text)" }}>
              平均 NT$ {Math.round(lot.avgPrice).toLocaleString()}/張
            </span>
          </div>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-muted)" }}>
            已建檔 {lot.linkedItemCount} 張{lot.acquiredDate && ` ・${lot.acquiredDate} 購入`}
          </span>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setIsEditing(true)}>
              編輯總價/張數
            </Button>
            <Button variant="ghost" onClick={handleToggleItems}>
              {showItems ? "收起卡片清單" : "查看已建檔卡片"}
            </Button>
          </div>

          {showItems && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {isLoadingItems && (
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-muted)" }}>載入中…</span>
              )}
              {items?.length === 0 && (
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-muted)" }}>
                  這個群組底下還沒有建檔的卡片
                </span>
              )}
              {items?.map((item) => (
                <Link
                  key={item.id}
                  href={`/cards/${item.id}`}
                  style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-accent-text)", textDecoration: "none" }}
                >
                  {item.name}({item.variantLabel})
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

export function LotList({ lots }: { lots: LotSummary[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {lots.map((lot) => (
        <LotCard key={lot.id} lot={lot} />
      ))}
    </div>
  );
}
