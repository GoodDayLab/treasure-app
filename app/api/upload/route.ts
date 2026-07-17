import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB,手機拍照的原圖通常在這個範圍內

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const itemId = formData.get("itemId");

  if (!(file instanceof File) || typeof itemId !== "string" || !itemId) {
    return NextResponse.json({ error: "缺少照片或收藏項目 ID" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "只接受圖片檔案" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "檔案太大,請控制在 8MB 以內" }, { status: 400 });
  }

  const item = await prisma.collectionItem.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ error: "找不到這個收藏項目" }, { status: 404 });
  }

  // 明確指定 token,不要讓 SDK 自動偵測 OIDC——這個專案的 OIDC 沒有對所有環境開放,
  // 自動偵測會在部分環境誤用 OIDC 導致上傳失敗。
  const blob = await put(`collection-items/${itemId}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  await prisma.photo.updateMany({ where: { itemId }, data: { isPrimary: false } });
  const photo = await prisma.photo.create({
    data: { itemId, url: blob.url, isPrimary: true },
  });

  return NextResponse.json({ url: photo.url });
}
