"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import type { TagDimensionWithTags, LotSummary } from "@/lib/data";

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

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontFamily: "var(--font-ui)",
  fontSize: 12,
  color: "var(--color-text-secondary)",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function NewCardForm({ tagDimensions, lots }: { tagDimensions: TagDimensionWithTags[]; lots: LotSummary[] }) {
  const router = useRouter();

  const [game, setGame] = useState("");
  const [series, setSeries] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [edition, setEdition] = useState("");

  const [variantType, setVariantType] = useState<"raw" | "graded">("raw");
  const [gradingCompany, setGradingCompany] = useState("");
  const [gradeValue, setGradeValue] = useState("");

  const [price, setPrice] = useState("");

  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagsText, setNewTagsText] = useState("");

  const [mode, setMode] = useState<"single" | "group">("single");
  const [acquiredDate, setAcquiredDate] = useState(todayISO());

  // 單張建檔
  const [acquiredPrice, setAcquiredPrice] = useState("");

  // 群組建檔
  const [groupChoice, setGroupChoice] = useState<"existing" | "new">(lots.length > 0 ? "existing" : "new");
  const [lotId, setLotId] = useState(lots[0]?.id ?? "");
  const [lotName, setLotName] = useState("");
  const [lotTotalPrice, setLotTotalPrice] = useState("");
  const [lotCardCount, setLotCardCount] = useState("");
  const [lotSource, setLotSource] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) => {
      const next = new Set(current);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const selectedLot = lots.find((lot) => lot.id === lotId);
  const newLotAvgPrice =
    Number(lotTotalPrice) > 0 && Number(lotCardCount) > 0 ? Number(lotTotalPrice) / Number(lotCardCount) : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!game || !series || !cardNumber || !name || !price) {
      setError("請填寫遊戲、系列、卡號、名稱、市價");
      return;
    }

    const body: Record<string, unknown> = {
      game,
      series,
      cardNumber,
      name,
      edition: edition || undefined,
      variantType,
      gradingCompany: variantType === "graded" ? gradingCompany : undefined,
      gradeValue: variantType === "graded" ? gradeValue : undefined,
      price: Number(price),
      tagIds: Array.from(selectedTagIds),
      newTags: newTagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      mode,
      acquiredDate,
    };

    if (mode === "single") {
      body.acquiredPrice = acquiredPrice ? Number(acquiredPrice) : undefined;
    } else if (groupChoice === "existing") {
      if (!lotId) {
        setError("請選擇一個群組");
        return;
      }
      body.lotId = lotId;
    } else {
      if (!lotName || !lotTotalPrice || !lotCardCount) {
        setError("請填寫群組名稱、總價、張數");
        return;
      }
      body.newLot = {
        name: lotName,
        totalPrice: Number(lotTotalPrice),
        cardCount: Number(lotCardCount),
        acquiredDate,
        source: lotSource || undefined,
      };
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "建檔失敗");
      router.push(`/cards/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "建檔失敗");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionCard title="基本資料">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={labelStyle}>
            遊戲 *
            <input style={inputStyle} value={game} onChange={(e) => setGame(e.target.value)} placeholder="寶可夢 / 遊戲王…" />
          </label>
          <label style={labelStyle}>
            系列 *
            <input style={inputStyle} value={series} onChange={(e) => setSeries(e.target.value)} />
          </label>
          <label style={labelStyle}>
            卡號 *
            <input style={inputStyle} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          </label>
          <label style={labelStyle}>
            卡片名稱 *
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="工藤新一" />
          </label>
          <label style={labelStyle}>
            版本(選填)
            <input style={inputStyle} value={edition} onChange={(e) => setEdition(e.target.value)} placeholder="初版" />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="鑑定與市價">
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 13 }}>
            <input type="radio" checked={variantType === "raw"} onChange={() => setVariantType("raw")} />
            裸卡
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 13 }}>
            <input type="radio" checked={variantType === "graded"} onChange={() => setVariantType("graded")} />
            已鑑定
          </label>
        </div>

        {variantType === "graded" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <label style={labelStyle}>
              鑑定公司
              <input style={inputStyle} value={gradingCompany} onChange={(e) => setGradingCompany(e.target.value)} placeholder="PSA / BGS / CGC" />
            </label>
            <label style={labelStyle}>
              鑑定分數
              <input style={inputStyle} value={gradeValue} onChange={(e) => setGradeValue(e.target.value)} placeholder="10" />
            </label>
          </div>
        )}

        <label style={labelStyle}>
          目前市價(NT$)*
          <input style={inputStyle} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
      </SectionCard>

      <SectionCard title="標籤">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tagDimensions.map((dimension) => (
            <div key={dimension.id}>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>
                {dimension.name}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {dimension.tags.map((tag) => (
                  <label
                    key={tag.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: "var(--font-ui)",
                      fontSize: 12,
                      borderRadius: 999,
                      padding: "3px 10px",
                      cursor: "pointer",
                      border: `1px solid ${selectedTagIds.has(tag.id) ? "var(--color-accent)" : "var(--color-border)"}`,
                      color: selectedTagIds.has(tag.id) ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTagIds.has(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      style={{ display: "none" }}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <label style={labelStyle}>
            新增標籤(用逗號分隔,會建立在「其他」這個維度)
            <input style={inputStyle} value={newTagsText} onChange={(e) => setNewTagsText(e.target.value)} placeholder="例如:柯南, 自己收藏" />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="建檔方式">
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 13 }}>
            <input type="radio" checked={mode === "single"} onChange={() => setMode("single")} />
            單張建檔
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 13 }}>
            <input type="radio" checked={mode === "group"} onChange={() => setMode("group")} />
            群組建檔(整批進貨)
          </label>
        </div>

        <label style={{ ...labelStyle, marginBottom: 12 }}>
          入手日期
          <input style={inputStyle} type="date" value={acquiredDate} onChange={(e) => setAcquiredDate(e.target.value)} />
        </label>

        {mode === "single" ? (
          <label style={labelStyle}>
            買入價格(NT$,選填)
            <input style={inputStyle} type="number" min={0} value={acquiredPrice} onChange={(e) => setAcquiredPrice(e.target.value)} />
          </label>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 13 }}>
                <input
                  type="radio"
                  checked={groupChoice === "existing"}
                  onChange={() => setGroupChoice("existing")}
                  disabled={lots.length === 0}
                />
                加入現有群組
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 13 }}>
                <input type="radio" checked={groupChoice === "new"} onChange={() => setGroupChoice("new")} />
                建立新群組
              </label>
            </div>

            {groupChoice === "existing" ? (
              <label style={labelStyle}>
                選擇群組
                <select style={inputStyle} value={lotId} onChange={(e) => setLotId(e.target.value)}>
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name}(平均 NT$ {Math.round(lot.avgPrice).toLocaleString()}/張,已建檔 {lot.linkedItemCount} 張)
                    </option>
                  ))}
                </select>
                {selectedLot && (
                  <span style={{ color: "var(--color-text-muted)" }}>
                    這張卡的買入價會自動算成 NT$ {Math.round(selectedLot.avgPrice).toLocaleString()}
                  </span>
                )}
              </label>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={labelStyle}>
                    群組名稱 *
                    <input style={inputStyle} value={lotName} onChange={(e) => setLotName(e.target.value)} placeholder="疾風光輝" />
                  </label>
                  <label style={labelStyle}>
                    來源(選填)
                    <input style={inputStyle} value={lotSource} onChange={(e) => setLotSource(e.target.value)} placeholder="蝦皮賣家 A" />
                  </label>
                  <label style={labelStyle}>
                    整批總價(NT$)*
                    <input style={inputStyle} type="number" min={0} value={lotTotalPrice} onChange={(e) => setLotTotalPrice(e.target.value)} />
                  </label>
                  <label style={labelStyle}>
                    整批張數 *
                    <input style={inputStyle} type="number" min={1} value={lotCardCount} onChange={(e) => setLotCardCount(e.target.value)} />
                  </label>
                </div>
                {newLotAvgPrice != null && (
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-muted)" }}>
                    平均每張成本:NT$ {Math.round(newLotAvgPrice).toLocaleString()}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </SectionCard>

      {error && (
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-danger)" }}>{error}</span>
      )}

      <Button variant="primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "建立中…" : "建立卡片"}
      </Button>
    </form>
  );
}
