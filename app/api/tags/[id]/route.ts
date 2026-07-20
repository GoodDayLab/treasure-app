import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "請輸入標籤名稱" }, { status: 400 });
  }

  try {
    await prisma.tag.update({ where: { id }, data: { name } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "這個維度底下已經有同名標籤了" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await prisma.$transaction([
    prisma.itemTag.deleteMany({ where: { tagId: id } }),
    prisma.tag.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
