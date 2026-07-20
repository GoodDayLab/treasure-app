-- AlterTable
ALTER TABLE "collection_items" ADD COLUMN     "lotId" TEXT;

-- CreateTable
CREATE TABLE "acquisition_lots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "cardCount" INTEGER NOT NULL,
    "acquiredDate" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acquisition_lots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "acquisition_lots" ADD CONSTRAINT "acquisition_lots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "acquisition_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
