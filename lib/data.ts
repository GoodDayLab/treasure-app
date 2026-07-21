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
  status: string;
  priceHistory: PricePoint[];
  timeline: TimelineEntry[];
}

export interface SoldCardSummary {
  id: string;
  name: string;
  game: string;
  series: string;
  variantLabel: string;
  currency: string;
  salePrice: number;
  saleDate: string;
  realizedGain: number | null;
}

export interface TagBreakdownSegment {
  label: string;
  count: number;
}

export interface TagBreakdown {
  dimensionId: string;
  dimensionName: string;
  segments: TagBreakdownSegment[];
}

export interface PricePoint {
  price: number;
  recordedAt: string;
}

export interface TagDimensionWithTags {
  id: string;
  name: string;
  tags: { id: string; name: string }[];
}

export interface LotSummary {
  id: string;
  name: string;
  totalPrice: number;
  cardCount: number;
  avgPrice: number;
  linkedItemCount: number;
  acquiredDate: string | null;
  source: string | null;
}

export interface LotDetail extends LotSummary {
  items: { id: string; name: string; variantLabel: string }[];
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

// priceHistory 這裡固定是「由舊到新」排序。只有兩個價格點以上才算得出漲跌幅,
// 否則視為持平——避免除以零或顯示假數字。
function priceAndChange(priceHistory: { price: unknown; currency: string }[]) {
  const latest = priceHistory[priceHistory.length - 1];
  const previous = priceHistory[priceHistory.length - 2];
  const price = latest ? Number(latest.price) : 0;
  const previousPrice = previous ? Number(previous.price) : 0;
  const changePercent = latest && previous && previousPrice !== 0 ? ((price - previousPrice) / previousPrice) * 100 : 0;
  return { price, currency: latest?.currency ?? "TWD", changePercent };
}

const variantWithPriceInclude = {
  card: true,
  priceHistory: { orderBy: { recordedAt: "asc" as const }, take: 100 },
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
    status: item.status,
    imageUrl: item.photos[0]?.url,
    priceHistory: item.variant.priceHistory.map((point) => ({
      price: Number(point.price),
      recordedAt: point.recordedAt.toISOString().slice(0, 10),
    })),
    timeline: item.timelineEvents.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      eventDate: event.eventDate.toISOString().slice(0, 10),
      location: event.location ?? undefined,
      note: event.note ?? undefined,
    })),
  };
}

export async function getSoldSummary(): Promise<SoldCardSummary[]> {
  const items = await prisma.collectionItem.findMany({
    where: { status: "sold" },
    include: {
      variant: { include: { card: true } },
      transaction: true,
    },
  });

  return items
    .filter((item) => item.transaction !== null)
    .map((item) => {
      const transaction = item.transaction!;
      return {
        id: item.id,
        name: item.variant.card.name,
        game: item.variant.card.game,
        series: item.variant.card.series,
        variantLabel: variantLabel(item.variant),
        currency: "TWD",
        salePrice: Number(transaction.salePrice),
        saleDate: transaction.saleDate.toISOString().slice(0, 10),
        realizedGain: transaction.realizedGain != null ? Number(transaction.realizedGain) : null,
      };
    })
    .sort((a, b) => (a.saleDate < b.saleDate ? 1 : -1));
}

// 圓餅圖用——依標籤維度統計「owned」卡片的分佈,對應 schema 註解裡
// 「多維度、可自由切換的圓餅圖」的原始設計:一個維度一組圓餅圖,使用者可以自己切換看哪個維度。
export async function getTagBreakdowns(): Promise<TagBreakdown[]> {
  const dimensions = await prisma.tagDimension.findMany({
    include: {
      tags: {
        include: {
          itemTags: { include: { item: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return dimensions
    .map((dimension) => {
      const segments = dimension.tags
        .map((tag) => ({
          label: tag.name,
          count: tag.itemTags.filter((itemTag) => itemTag.item.status === "owned").length,
        }))
        .filter((segment) => segment.count > 0)
        .sort((a, b) => b.count - a.count);

      return { dimensionId: dimension.id, dimensionName: dimension.name, segments };
    })
    .filter((dimension) => dimension.segments.length > 0);
}

export async function getTagDimensions(): Promise<TagDimensionWithTags[]> {
  const dimensions = await prisma.tagDimension.findMany({
    include: { tags: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return dimensions.map((dimension) => ({
    id: dimension.id,
    name: dimension.name,
    tags: dimension.tags.map((tag) => ({ id: tag.id, name: tag.name })),
  }));
}

function toLotSummary(lot: {
  id: string;
  name: string;
  totalPrice: unknown;
  cardCount: number;
  acquiredDate: Date | null;
  source: string | null;
  _count: { items: number };
}): LotSummary {
  const totalPrice = Number(lot.totalPrice);
  return {
    id: lot.id,
    name: lot.name,
    totalPrice,
    cardCount: lot.cardCount,
    avgPrice: lot.cardCount > 0 ? totalPrice / lot.cardCount : 0,
    linkedItemCount: lot._count.items,
    acquiredDate: lot.acquiredDate ? lot.acquiredDate.toISOString().slice(0, 10) : null,
    source: lot.source,
  };
}

export async function getLots(): Promise<LotSummary[]> {
  const lots = await prisma.acquisitionLot.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return lots.map(toLotSummary);
}

export async function getLotDetail(id: string): Promise<LotDetail | null> {
  const lot = await prisma.acquisitionLot.findUnique({
    where: { id },
    include: {
      _count: { select: { items: true } },
      items: { include: { variant: { include: { card: true } } } },
    },
  });

  if (!lot) return null;

  return {
    ...toLotSummary(lot),
    items: lot.items.map((item) => ({
      id: item.id,
      name: item.variant.card.name,
      variantLabel: variantLabel(item.variant),
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
