import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const salePrice = Number(body.salePrice);
  if (!Number.isFinite(salePrice) || salePrice < 0) {
    return NextResponse.json({ error: "請輸入正確的售出價格" }, { status: 400 });
  }

  const saleDate = body.saleDate ? new Date(body.saleDate) : new Date();
  if (Number.isNaN(saleDate.getTime())) {
    return NextResponse.json({ error: "售出日期格式不正確" }, { status: 400 });
  }

  const item = await prisma.collectionItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "找不到這個收藏項目" }, { status: 404 });
  }

  const realizedGain = item.acquiredPrice != null ? salePrice - Number(item.acquiredPrice) : null;

  await prisma.$transaction([
    prisma.collectionItem.update({ where: { id }, data: { status: "sold" } }),
    prisma.transaction.upsert({
      where: { itemId: id },
      update: { salePrice, saleDate, realizedGain },
      create: { itemId: id, salePrice, saleDate, realizedGain },
    }),
    prisma.timelineEvent.create({
      data: { itemId: id, eventType: "sold", eventDate: saleDate },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
