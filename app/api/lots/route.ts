import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLots } from "@/lib/data";

export async function GET() {
  const lots = await getLots();
  return NextResponse.json(lots);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !Number.isFinite(Number(body.totalPrice)) || !Number.isInteger(Number(body.cardCount))) {
    return NextResponse.json({ error: "請填寫群組名稱、總價、張數" }, { status: 400 });
  }
  if (Number(body.cardCount) <= 0) {
    return NextResponse.json({ error: "張數要大於 0" }, { status: 400 });
  }

  const user = await prisma.user.findFirst();
  if (!user) {
    return NextResponse.json({ error: "找不到使用者" }, { status: 500 });
  }

  const lot = await prisma.acquisitionLot.create({
    data: {
      userId: user.id,
      name: body.name,
      totalPrice: Number(body.totalPrice),
      cardCount: Number(body.cardCount),
      acquiredDate: body.acquiredDate ? new Date(body.acquiredDate) : null,
      source: body.source || null,
    },
  });

  return NextResponse.json({ id: lot.id });
}
