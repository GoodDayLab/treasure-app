import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedTimelineEvent {
  eventType: string;
  eventDate: string;
  location?: string;
  note?: string;
}

interface SeedCard {
  cardId: string;
  itemId: string;
  game: string;
  series: string;
  cardNumber: string;
  name: string;
  variantType: string;
  gradingCompany: string | null;
  gradeValue: string | null;
  price: number;
  changePercent: number;
  tags: { dim: string; name: string }[];
  trustLevel: string;
  privateStory: string;
  shareCaption: string;
  timeline: SeedTimelineEvent[];
}

// 展示用種子資料——單一使用者 + 5 張卡,涵蓋不同遊戲/鑑定狀態。
async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@treasure.app" },
    update: {},
    create: {
      email: "demo@treasure.app",
      displayName: "Demo",
      defaultCurrency: "TWD",
    },
  });

  const seriesDimension = await prisma.tagDimension.upsert({
    where: { id: "dim-series" },
    update: {},
    create: { id: "dim-series", userId: user.id, name: "系列" },
  });
  const purposeDimension = await prisma.tagDimension.upsert({
    where: { id: "dim-purpose" },
    update: {},
    create: { id: "dim-purpose", userId: user.id, name: "用途" },
  });
  const gradingDimension = await prisma.tagDimension.upsert({
    where: { id: "dim-grading" },
    update: {},
    create: { id: "dim-grading", userId: user.id, name: "鑑定狀態" },
  });

  async function ensureTag(dimensionId: string, name: string) {
    const existing = await prisma.tag.findFirst({ where: { dimensionId, name } });
    if (existing) return existing;
    return prisma.tag.create({ data: { dimensionId, name } });
  }

  const cards: SeedCard[] = [
    {
      cardId: "card-1",
      itemId: "item-1",
      game: "名偵探柯南 TCG",
      series: "初版",
      cardNumber: "DC-001",
      name: "工藤新一",
      variantType: "graded",
      gradingCompany: "PSA",
      gradeValue: "10",
      price: 4200,
      changePercent: 12.4,
      tags: [
        { dim: seriesDimension.id, name: "柯南" },
        { dim: purposeDimension.id, name: "自己收藏" },
        { dim: gradingDimension.id, name: "PSA" },
      ],
      trustLevel: "verified",
      privateStory: "第一次自己標到的鑑定卡,拿到實體那天緊張到手抖。",
      shareCaption: "終於補齊這張初版 PSA 10 🎉",
      timeline: [
        { eventType: "acquired", eventDate: "2025-11-02", location: "露天拍賣", note: "跟賣家約在捷運站面交" },
        { eventType: "graded_submitted", eventDate: "2025-12-10", note: "送 PSA 鑑定" },
        { eventType: "story_added", eventDate: "2026-01-15" },
      ],
    },
    {
      cardId: "card-2",
      itemId: "item-2",
      game: "寶可夢",
      series: "基礎收藏系列",
      cardNumber: "PK-014",
      name: "皮卡丘",
      variantType: "graded",
      gradingCompany: "PSA",
      gradeValue: "9",
      price: 2600,
      changePercent: -3.8,
      tags: [
        { dim: seriesDimension.id, name: "寶可夢" },
        { dim: purposeDimension.id, name: "自己收藏" },
      ],
      trustLevel: "certificate_uploaded",
      privateStory: "小時候第一副卡包抽到的,重買一張鑑定版留念。",
      shareCaption: "童年回憶補完 ⚡",
      timeline: [{ eventType: "acquired", eventDate: "2025-06-20", location: "卡牌展" }],
    },
    {
      cardId: "card-3",
      itemId: "item-3",
      game: "遊戲王",
      series: "First Edition",
      cardNumber: "YGO-055",
      name: "黑魔導",
      variantType: "raw",
      gradingCompany: null,
      gradeValue: null,
      price: 1800,
      changePercent: 0,
      tags: [
        { dim: seriesDimension.id, name: "遊戲王" },
        { dim: purposeDimension.id, name: "用途:對戰" },
      ],
      trustLevel: "self_reported",
      privateStory: "還在用這張打牌,沒打算送鑑定。",
      shareCaption: "",
      timeline: [{ eventType: "acquired", eventDate: "2024-09-01" }],
    },
    {
      cardId: "card-4",
      itemId: "item-4",
      game: "航海王卡牌",
      series: "Leader 稀有系列",
      cardNumber: "OP-101",
      name: "魯夫",
      variantType: "graded",
      gradingCompany: "BGS",
      gradeValue: "9.5",
      price: 9500,
      changePercent: 24.1,
      tags: [
        { dim: seriesDimension.id, name: "航海王" },
        { dim: purposeDimension.id, name: "投資" },
      ],
      trustLevel: "verified",
      privateStory: "漲最多的一張,考慮要不要出。",
      shareCaption: "手裡最猛的一張 Leader 卡 🏴‍☠️",
      timeline: [
        { eventType: "acquired", eventDate: "2025-02-14", location: "海外代購" },
        { eventType: "graded_submitted", eventDate: "2025-04-01" },
      ],
    },
    {
      cardId: "card-5",
      itemId: "item-5",
      game: "運動卡",
      series: "MLB Rookie",
      cardNumber: "MLB-017",
      name: "大谷翔平",
      variantType: "graded",
      gradingCompany: "PSA",
      gradeValue: "10",
      price: 32000,
      changePercent: -6.2,
      tags: [
        { dim: seriesDimension.id, name: "運動卡" },
        { dim: purposeDimension.id, name: "投資" },
        { dim: gradingDimension.id, name: "PSA" },
      ],
      trustLevel: "verified",
      privateStory: "咬牙買下去的一張,長期持有中。",
      shareCaption: "收藏裡最貴的一張",
      timeline: [
        { eventType: "acquired", eventDate: "2024-05-30", location: "美國代標" },
        { eventType: "graded_submitted", eventDate: "2024-07-18" },
        { eventType: "story_added", eventDate: "2025-01-10" },
      ],
    },
  ];

  for (const c of cards) {
    const card = await prisma.card.upsert({
      where: { id: c.cardId },
      update: {},
      create: {
        id: c.cardId,
        game: c.game,
        series: c.series,
        cardNumber: c.cardNumber,
        name: c.name,
      },
    });

    const variant = await prisma.cardVariant.upsert({
      where: { id: `${c.cardId}-variant` },
      update: {},
      create: {
        id: `${c.cardId}-variant`,
        cardId: card.id,
        variantType: c.variantType,
        gradingCompany: c.gradingCompany,
        gradeValue: c.gradeValue,
      },
    });

    // 存兩筆價格點(30 天前的基準價 + 現在),讓漲跌幅是從真實價格算出來的,不是寫死的數字。
    const basePrice = Math.round((c.price / (1 + c.changePercent / 100)) * 100) / 100;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.priceHistory.upsert({
      where: { id: `${c.cardId}-price-old` },
      update: { price: basePrice },
      create: {
        id: `${c.cardId}-price-old`,
        variantId: variant.id,
        price: basePrice,
        currency: "TWD",
        recordedAt: thirtyDaysAgo,
        source: "seed",
      },
    });

    await prisma.priceHistory.upsert({
      where: { id: `${c.cardId}-price-latest` },
      update: { price: c.price },
      create: {
        id: `${c.cardId}-price-latest`,
        variantId: variant.id,
        price: c.price,
        currency: "TWD",
        recordedAt: new Date(),
        source: "seed",
      },
    });

    const item = await prisma.collectionItem.upsert({
      where: { id: c.itemId },
      update: {
        privateStory: c.privateStory,
        shareCaption: c.shareCaption,
        trustLevel: c.trustLevel,
      },
      create: {
        id: c.itemId,
        userId: user.id,
        variantId: variant.id,
        privateStory: c.privateStory,
        shareCaption: c.shareCaption,
        trustLevel: c.trustLevel,
        status: "owned",
        acquiredPrice: c.price,
      },
    });

    for (const t of c.tags) {
      const tag = await ensureTag(t.dim, t.name);
      await prisma.itemTag.upsert({
        where: { itemId_tagId: { itemId: item.id, tagId: tag.id } },
        update: {},
        create: { itemId: item.id, tagId: tag.id },
      });
    }

    for (const [index, event] of c.timeline.entries()) {
      await prisma.timelineEvent.upsert({
        where: { id: `${c.itemId}-event-${index}` },
        update: {},
        create: {
          id: `${c.itemId}-event-${index}`,
          itemId: item.id,
          eventType: event.eventType,
          eventDate: new Date(event.eventDate),
          location: event.location,
          note: event.note,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
