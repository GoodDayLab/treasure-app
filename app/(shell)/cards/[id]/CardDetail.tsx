"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { PriceTag } from "@/components/ui/PriceTag";
import { TagPill, AddTagPill } from "@/components/ui/TagPill";
import { SectionCard } from "@/components/ui/SectionCard";
import { PriceTrendChart } from "@/components/charts/PriceTrendChart";
import { TimelineManager } from "./TimelineManager";
import type { CollectionCardDetail } from "@/lib/data";

const TRUST_LABEL: Record<string, string> = {
  self_reported: "自行填寫",
  certificate_uploaded: "已上傳鑑定證書",
  verified: "官方鑑定機構驗證",
};

export function CardDetail({ card }: { card: CollectionCardDetail }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTag, setSelectedTag] = useState(card.tags[0]);
  const [isCollected, setIsCollected] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [story, setStory] = useState(card.privateStory);
  const [statusMessage, setStatusMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showPriceInShare, setShowPriceInShare] = useState(true);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [salePrice, setSalePrice] = useState(String(card.price));
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));

  // 分享圖是真的能發到 IG/X 的圖片(next/og 產生),不是連結——先抓圖再用原生分享選單帶檔案出去,
  // 桌機/不支援檔案分享的瀏覽器就退回直接下載,讓使用者自己存到相簿分享。
  const handleShare = async () => {
    setIsGeneratingShare(true);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/share-image/${card.id}?price=${showPriceInShare ? 1 : 0}`);
      if (!response.ok) throw new Error("圖片產生失敗");
      const blob = await response.blob();
      const file = new File([blob], `${card.name}-treasure.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: card.name, text: card.shareCaption || card.name });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${card.name}-treasure.png`;
        link.click();
        URL.revokeObjectURL(url);
        setStatusMessage("圖片已下載,可以到相簿分享到 IG / X ✓");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // 使用者自己取消分享,不用顯示錯誤
      } else {
        setStatusMessage(error instanceof Error ? error.message : "分享失敗");
      }
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const handleMarkSold = async () => {
    setIsSelling(true);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/collection-items/${card.id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salePrice: Number(salePrice), saleDate }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "標記失敗");
      }

      setStatusMessage("已標記為售出 ✓");
      setShowSellForm(false);
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "標記失敗");
    } finally {
      setIsSelling(false);
    }
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setStatusMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemId", card.id);

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "上傳失敗");
      }

      setStatusMessage("照片已更新 ✓");
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "上傳失敗");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
      <Link
        href="/"
        style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none" }}
      >
        ← 回收藏列表
      </Link>

      <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <PhotoFrame alt={card.name} size="large" src={card.imageUrl} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            style={{ display: "none" }}
          />
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? "上傳中…" : card.imageUrl ? "更換照片" : "拍照 / 上傳照片"}
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 240 }}>
          <h1 style={{ fontFamily: "var(--font-voice)", fontSize: 24, margin: 0, color: "var(--color-text-primary)" }}>
            {card.name}
          </h1>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-secondary)" }}>
            {card.game} · {card.series} · {card.variantLabel}
          </span>

          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 20, fontWeight: 600, color: "var(--color-accent-text)" }}>
              {card.currency} {card.price.toLocaleString()}
            </span>
            <PriceTag changePercent={card.changePercent} />
          </div>

          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-muted)" }}>
            鑑定狀態:{TRUST_LABEL[card.trustLevel] ?? card.trustLevel}
            {card.status === "sold" && (
              <span style={{ marginLeft: 8, color: "var(--color-accent-text)", fontWeight: 600 }}>・已售出</span>
            )}
          </span>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {card.tags.map((tag) => (
              <TagPill key={tag} selected={selectedTag === tag} onClick={() => setSelectedTag(tag)}>
                {tag}
              </TagPill>
            ))}
            <AddTagPill />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            <Button
              variant={isCollected ? "secondary" : "primary"}
              onClick={() => {
                setIsCollected((collected) => !collected);
                setStatusMessage(isCollected ? "已從收藏移除" : "已加入收藏 ✓");
              }}
            >
              {isCollected ? "已收藏 ✓" : "加入收藏"}
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing((editing) => !editing)}>
              {isEditing ? "完成編輯" : "編輯"}
            </Button>
            <Button variant="ghost" onClick={handleShare} disabled={isGeneratingShare}>
              {isGeneratingShare ? "產生分享圖中…" : "分享"}
            </Button>
            {card.status !== "sold" && (
              <Button variant="ghost" onClick={() => setShowSellForm((show) => !show)}>
                {showSellForm ? "取消" : "標記為已售出"}
              </Button>
            )}
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            <input
              type="checkbox"
              checked={showPriceInShare}
              onChange={(event) => setShowPriceInShare(event.target.checked)}
            />
            分享圖片顯示價格
          </label>

          {showSellForm && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 8,
                padding: 12,
                background: "var(--color-surface-muted)",
                borderRadius: "var(--radius-ui)",
              }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-secondary)" }}>
                售出價格(NT$)
                <input
                  type="number"
                  min={0}
                  value={salePrice}
                  onChange={(event) => setSalePrice(event.target.value)}
                  style={{ padding: 6, borderRadius: "var(--radius-ui)", border: "1px solid var(--color-border)" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-secondary)" }}>
                售出日期
                <input
                  type="date"
                  value={saleDate}
                  onChange={(event) => setSaleDate(event.target.value)}
                  style={{ padding: 6, borderRadius: "var(--radius-ui)", border: "1px solid var(--color-border)" }}
                />
              </label>
              <Button variant="primary" onClick={handleMarkSold} disabled={isSelling}>
                {isSelling ? "處理中…" : "確認售出"}
              </Button>
            </div>
          )}

          {statusMessage && (
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-success)" }}>
              {statusMessage}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 32 }}>
        <SectionCard title="價格走勢">
          <PriceTrendChart points={card.priceHistory} currency={card.currency} />
        </SectionCard>

        <SectionCard title="收藏故事">
          {isEditing ? (
            <textarea
              value={story}
              onChange={(event) => setStory(event.target.value)}
              rows={4}
              style={{
                width: "100%",
                fontFamily: "var(--font-voice)",
                fontSize: 14,
                color: "var(--color-text-primary)",
                background: "var(--color-surface-muted)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-ui)",
                padding: 12,
                resize: "vertical",
              }}
            />
          ) : (
            <p style={{ fontFamily: "var(--font-voice)", fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)", margin: 0 }}>
              {story || "還沒有寫下這張卡的故事。"}
            </p>
          )}
          <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 8 }}>
            只有你看得到,不會出現在分享頁裡
          </span>
        </SectionCard>

        <SectionCard title="時間軸">
          <TimelineManager itemId={card.id} events={card.timeline} />
        </SectionCard>
      </div>
    </main>
  );
}
