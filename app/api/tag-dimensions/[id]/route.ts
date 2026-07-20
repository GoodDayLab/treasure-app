import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "請輸入維度名稱" }, { status: 400 });
  }

  await prisma.tagDimension.update({ where: { id }, data: { name } });
  return NextResponse.json({ ok: true });
}

// 刪除維度會連帶刪掉底下所有標籤,以及那些標籤跟卡片的關聯——
// 卡片本身不會被刪除,只是失去這些標籤。
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await prisma.$transaction([
    prisma.itemTag.deleteMany({ where: { tag: { dimensionId: id } } }),
    prisma.tag.deleteMany({ where: { dimensionId: id } }),
    prisma.tagDimension.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
