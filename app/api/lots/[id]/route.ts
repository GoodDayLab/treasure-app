import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLotDetail } from "@/lib/data";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lot = await getLotDetail(id);
  if (!lot) return NextResponse.json({ error: "找不到這個群組" }, { status: 404 });
  return NextResponse.json(lot);
}

// 改群組的總價或張數,平均成本會變,所有掛在這個群組底下的卡片的 acquiredPrice
// 要跟著重新計算並回寫,不然卡片詳情頁顯示的買入價會跟群組資料對不上。
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const data: { name?: string; totalPrice?: number; cardCount?: number; source?: string | null; acquiredDate?: Date } = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.totalPrice !== undefined) data.totalPrice = Number(body.totalPrice);
  if (body.cardCount !== undefined) data.cardCount = Number(body.cardCount);
  if (body.source !== undefined) data.source = body.source || null;
  if (body.acquiredDate !== undefined) data.acquiredDate = new Date(body.acquiredDate);

  if (data.totalPrice !== undefined && (!Number.isFinite(data.totalPrice) || data.totalPrice < 0)) {
    return NextResponse.json({ error: "總價不正確" }, { status: 400 });
  }
  if (data.cardCount !== undefined && (!Number.isInteger(data.cardCount) || data.cardCount <= 0)) {
    return NextResponse.json({ error: "張數要是大於 0 的整數" }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const lot = await tx.acquisitionLot.update({ where: { id }, data });

        if (data.totalPrice !== undefined || data.cardCount !== undefined) {
          const avgPrice = lot.cardCount > 0 ? Number(lot.totalPrice) / lot.cardCount : 0;
          await tx.collectionItem.updateMany({ where: { lotId: id }, data: { acquiredPrice: avgPrice } });
        }
      },
      { timeout: 15000 }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "更新失敗" }, { status: 500 });
  }
}
