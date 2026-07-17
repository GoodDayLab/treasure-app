import { prisma } from "./prisma";

export interface CollectionCardSummary {
  id: string;
  name: string;
  game: string;
  series: string;
  variantLabel: string;
  price: number;
  currency: string;
  changePercent: number;
  imageUrl?: string;
}

export interface TimelineEntry {
  id: string;
  eventType: string;
  eventDate: string;
  location?: string;
  note?: string;
}

export interface CollectionCardDetail extends CollectionCardSummary {
  tags: string[];
  trustLevel: string;
  privateStory: string;
  shareCaption: string;
  timeline: TimelineEntry[];
}

export interface ShareableCard {
  id: string;
  name: string;
  game: string;
  series: string;
  variantLabel: string;
  price: number;
  currency: string;
  changePercent: number;
  tags: string[];
  shareCaption: string;
  imageUrl?: string;
}

function variantLabel(variant: { variantType: string; gradingCompany: string | null; gradeValue: string | null }) {
  if (variant.variantType === "raw") return "裸卡";
  return [variant.gradingCompany, variant.gradeValue].filter(Boolean).join(" ");
}

// 只有兩個價格點以上才算得出漲跌幅,否則視為持平——避免除以零或顯示假數字。
function priceAndChange(priceHistory: { price: unknown; currency: string }[]) {
  const [latest, previous] = priceHistory;
  const price = latest ? Number(latest.price) : 0;
  const previousPrice = previous ? Number(previous.price) : 0;
  const changePercent = latest && previous && previousPrice !== 0 ? ((price - previousPrice) / previousPrice) * 100 : 0;
  return { price, currency: latest?.currency ?? "TWD", changePercent };
}

const variantWithPriceInclude = {
  card: true,
  priceHistory: { orderBy: { recordedAt: "desc" as const }, take: 2 },
};

export async function getCollectionSummary(): Promise<CollectionCardSummary[]> {
  const items = await prisma.collectionItem.findMany({
    where: { status: "owned" },
    include: {
      variant: { include: variantWithPriceInclude },
      photos: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: { createdAt: "asc" },
  });

  return items.map((item) => {
    const { price, currency, changePercent } = priceAndChange(item.variant.priceHistory);
    return {
      id: item.id,
      name: item.variant.card.name,
      game: item.variant.card.game,
      series: item.variant.card.series,
      variantLabel: variantLabel(item.variant),
      price,
      currency,
      changePercent,
      imageUrl: item.photos[0]?.url,
    };
  });
}

export async function getCardDetail(id: string): Promise<CollectionCardDetail | null> {
  const item = await prisma.collectionItem.findUnique({
    where: { id },
    include: {
      variant: { include: variantWithPriceInclude },
      photos: { orderBy: { isPrimary: "desc" } },
      itemTags: { include: { tag: true } },
      timelineEvents: { orderBy: { eventDate: "asc" } },
    },
  });

  if (!item) return null;

  const { price, currency, changePercent } = priceAndChange(item.variant.priceHistory);

  return {
    id: item.id,
    name: item.variant.card.name,
    game: item.variant.card.game,
    series: item.variant.card.series,
    variantLabel: variantLabel(item.variant),
    price,
    currency,
    changePercent,
    tags: item.itemTags.map((itemTag) => itemTag.tag.name),
    trustLevel: item.trustLevel,
    privateStory: item.privateStory ?? "",
    shareCaption: item.shareCaption ?? "",
    imageUrl: item.photos[0]?.url,
    timeline: item.timelineEvents.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      eventDate: event.eventDate.toISOString().slice(0, 10),
      location: event.location ?? undefined,
      note: event.note ?? undefined,
    })),
  };
}

// 給公開分享頁用——刻意只挑選安全欄位,privateStory / acquiredPrice / userId 一律不回傳。
export async function getShareableCard(id: string): Promise<ShareableCard | null> {
  const item = await prisma.collectionItem.findUnique({
    where: { id },
    include: {
      variant: { include: variantWithPriceInclude },
      photos: { orderBy: { isPrimary: "desc" }, take: 1 },
      itemTags: { include: { tag: true } },
    },
  });

  if (!item) return null;

  const { price, currency, changePercent } = priceAndChange(item.variant.priceHistory);

  return {
    id: item.id,
    name: item.variant.card.name,
    game: item.variant.card.game,
    series: item.variant.card.series,
    variantLabel: variantLabel(item.variant),
    price,
    currency,
    changePercent,
    tags: item.itemTags.map((itemTag) => itemTag.tag.name),
    shareCaption: item.shareCaption ?? "",
    imageUrl: item.photos[0]?.url,
  };
}
