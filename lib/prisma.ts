import { PrismaClient } from "@prisma/client";

// 開發模式下 Next.js 會因為 hot reload 重複 import 這個檔案,
// 用 globalThis 快取單一 PrismaClient 實例,避免每次重整都開新的資料庫連線。
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
