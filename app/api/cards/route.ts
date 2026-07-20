import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CreateCardBody {
  game: string;
  series: string;
  cardNumber: string;
  name: string;
  edition?: string;
  variantType: "raw" | "graded";
  gradingCompany?: string;
  gradeValue?: string;
  price: number;
  tagIds?: string[];
  newTags?: string[];
  mode: "single" | "group";
  acquiredDate?: string;
  // mode === "single"
  acquiredPrice?: number;
  // mode === "group"
  lotId?: string;
  newLot?: { name: string; totalPrice: number; cardCount: number; acquiredDate?: string; source?: string };
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreateCardBody | null;

  if (!body || !body.game || !body.series || !body.cardNumber || !body.name) {
    return NextResponse.json({ error: "請填寫遊戲、系列、卡號、名稱" }, { status: 400 });
  }
  if (!Number.isFinite(body.price) || body.price < 0) {
    return NextResponse.json({ error: "請輸入正確的市價" }, { status: 400 });
  }
  if (body.variantType === "graded" && !body.gradingCompany) {
    return NextResponse.json({ error: "鑑定版本請填寫鑑定公司" }, { status: 400 });
  }

  const acquiredDate = body.acquiredDate ? new Date(body.acquiredDate) : new Date();

  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "找不到使用者,請先執行 prisma db seed" }, { status: 500 });
    }

    const item = await prisma.$transaction(async (tx) => {
      const card = await tx.card.create({
        data: {
          game: body.game,
          series: body.series,
          cardNumber: body.cardNumber,
          name: body.name,
          edition: body.edition || null,
        },
      });

      const variant = await tx.cardVariant.create({
        data: {
          cardId: card.id,
          variantType: body.variantType,
          gradingCompany: body.variantType === "graded" ? body.gradingCompany : null,
          gradeValue: body.variantType === "graded" ? body.gradeValue || null : null,
        },
      });

      await tx.priceHistory.create({
        data: {
          variantId: variant.id,
          price: body.price,
          currency: "TWD",
          recordedAt: new Date(),
          source: "manual",
        },
      });

      // 群組建檔:平均成本 = 該批總價 / 該批總張數,不是「已建檔張數」,
      // 因為使用者可能買一整箱但只挑幾張建檔。
      let lotId: string | null = null;
      let acquiredPrice: number | null = null;

      if (body.mode === "group") {
        if (body.lotId) {
          const lot = await tx.acquisitionLot.findUniqueOrThrow({ where: { id: body.lotId } });
          lotId = lot.id;
          acquiredPrice = lot.cardCount > 0 ? Number(lot.totalPrice) / lot.cardCount : 0;
        } else if (body.newLot) {
          const lot = await tx.acquisitionLot.create({
            data: {
              userId: user.id,
              name: body.newLot.name,
              totalPrice: body.newLot.totalPrice,
              cardCount: body.newLot.cardCount,
              acquiredDate: body.newLot.acquiredDate ? new Date(body.newLot.acquiredDate) : acquiredDate,
              source: body.newLot.source || null,
            },
          });
          lotId = lot.id;
          acquiredPrice = lot.cardCount > 0 ? Number(lot.totalPrice) / lot.cardCount : 0;
        }
      } else {
        acquiredPrice = body.acquiredPrice ?? null;
      }

      const collectionItem = await tx.collectionItem.create({
        data: {
          userId: user.id,
          variantId: variant.id,
          status: "owned",
          trustLevel: "self_reported",
          acquiredDate,
          acquiredPrice,
          lotId,
        },
      });

      const tagIds = body.tagIds ?? [];
      if (body.newTags && body.newTags.length > 0) {
        let otherDimension = await tx.tagDimension.findFirst({ where: { name: "其他" } });
        if (!otherDimension) {
          otherDimension = await tx.tagDimension.create({ data: { userId: user.id, name: "其他" } });
        }
        for (const tagName of body.newTags) {
          const trimmed = tagName.trim();
          if (!trimmed) continue;
          const tag = await tx.tag.upsert({
            where: { dimensionId_name: { dimensionId: otherDimension.id, name: trimmed } },
            update: {},
            create: { dimensionId: otherDimension.id, name: trimmed },
          });
          tagIds.push(tag.id);
        }
      }

      if (tagIds.length > 0) {
        await tx.itemTag.createMany({ data: tagIds.map((tagId) => ({ itemId: collectionItem.id, tagId })) });
      }

      await tx.timelineEvent.create({
        data: { itemId: collectionItem.id, eventType: "acquired", eventDate: acquiredDate },
      });

      return collectionItem;
    }, { timeout: 15000 });

    return NextResponse.json({ id: item.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "建檔失敗" }, { status: 500 });
  }
}
