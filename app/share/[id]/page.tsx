import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { PriceTag } from "@/components/ui/PriceTag";
import { TagPill } from "@/components/ui/TagPill";
import { getShareableCard } from "@/lib/data";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await getShareableCard(id);
  if (!card) return { title: "Treasure" };
  return {
    title: `${card.name} · Treasure`,
    description: card.shareCaption || `${card.game} · ${card.series}`,
  };
}

// 公開頁面——任何人拿到連結都能看到,所以只用 getShareableCard() 這種
// 刻意排除 privateStory / acquiredPrice 的安全資料,不會沿用詳情頁那份完整資料。
export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const card = await getShareableCard(id);

  if (!card) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <PhotoFrame alt={card.name} size="large" src={card.imageUrl} />
      </div>

      <h1 style={{ fontFamily: "var(--font-voice)", fontSize: 24, margin: "20px 0 4px" }}>{card.name}</h1>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
        {card.game} · {card.series} · {card.variantLabel}
      </p>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 8, marginTop: 12 }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 600, color: "var(--color-accent-text)" }}>
          {card.currency} {card.price.toLocaleString()}
        </span>
        <PriceTag changePercent={card.changePercent} />
      </div>

      {card.shareCaption && (
        <p style={{ fontFamily: "var(--font-voice)", fontSize: 15, lineHeight: 1.7, color: "var(--color-text-primary)", marginTop: 20 }}>
          {card.shareCaption}
        </p>
      )}

      {card.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 20 }}>
          {card.tags.map((tag) => (
            <TagPill key={tag}>{tag}</TagPill>
          ))}
        </div>
      )}

      <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 40 }}>
        由 Treasure 分享
      </p>
    </main>
  );
}
