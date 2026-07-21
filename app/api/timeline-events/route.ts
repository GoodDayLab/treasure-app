import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const itemId = body.itemId as string | undefined;
  const eventType = (body.eventType ?? "").trim();
  const eventDate = body.eventDate ? new Date(body.eventDate) : null;

  if (!itemId || !eventType || !eventDate || Number.isNaN(eventDate.getTime())) {
    return NextResponse.json({ error: "請填寫事件類型與日期" }, { status: 400 });
  }

  const event = await prisma.timelineEvent.create({
    data: {
      itemId,
      eventType,
      eventDate,
      location: body.location || null,
      note: body.note || null,
    },
  });

  return NextResponse.json({ id: event.id });
}
