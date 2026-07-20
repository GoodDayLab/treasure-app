import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "請輸入維度名稱" }, { status: 400 });
  }

  const user = await prisma.user.findFirst();
  if (!user) {
    return NextResponse.json({ error: "找不到使用者" }, { status: 500 });
  }

  const dimension = await prisma.tagDimension.create({ data: { userId: user.id, name } });
  return NextResponse.json({ id: dimension.id });
}
