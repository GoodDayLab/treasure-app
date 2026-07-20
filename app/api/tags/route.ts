import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const dimensionId = body.dimensionId as string | undefined;
  const name = (body.name ?? "").trim();

  if (!dimensionId || !name) {
    return NextResponse.json({ error: "請輸入標籤名稱" }, { status: 400 });
  }

  try {
    const tag = await prisma.tag.create({ data: { dimensionId, name } });
    return NextResponse.json({ id: tag.id });
  } catch {
    return NextResponse.json({ error: "這個維度底下已經有同名標籤了" }, { status: 400 });
  }
}
