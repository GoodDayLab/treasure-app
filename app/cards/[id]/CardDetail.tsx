"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { PriceTag } from "@/components/ui/PriceTag";
import { TagPill, AddTagPill } from "@/components/ui/TagPill";
import { SectionCard } from "@/components/ui/SectionCard";
import { TimelineItem } from "@/components/ui/TimelineItem";
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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${card.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: card.name, text: card.shareCaption || card.name, url: shareUrl });
        return;
      } catch {
        // 使用者取消分享或該裝置不支援,退回用複製連結
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatusMessage("已複製分享連結 ✓");
    } catch {
      setStatusMessage(shareUrl);
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
            <Button variant="ghost" onClick={handleShare}>
              分享
            </Button>
          </div>

          {statusMessage && (
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-success)" }}>
              {statusMessage}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 32 }}>
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
          <div>
            {card.timeline.map((event, index) => (
              <TimelineItem
                key={event.id}
                eventType={event.eventType}
                eventDate={event.eventDate}
                location={event.location}
                note={event.note}
                isLast={index === card.timeline.length - 1}
              />
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
