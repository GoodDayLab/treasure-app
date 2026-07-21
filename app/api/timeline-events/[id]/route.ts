import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const data: { eventType?: string; eventDate?: Date; location?: string | null; note?: string | null } = {};
  if (body.eventType !== undefined) data.eventType = body.eventType;
  if (body.eventDate !== undefined) {
    const date = new Date(body.eventDate);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "日期格式不正確" }, { status: 400 });
    }
    data.eventDate = date;
  }
  if (body.location !== undefined) data.location = body.location || null;
  if (body.note !== undefined) data.note = body.note || null;

  await prisma.timelineEvent.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.timelineEvent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
