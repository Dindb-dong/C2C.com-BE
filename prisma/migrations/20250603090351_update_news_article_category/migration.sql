/*
  Warnings:

  - You are about to drop the column `category` on the `NewsArticle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NewsArticle" DROP COLUMN "category",
ADD COLUMN     "categoryCode" TEXT NOT NULL DEFAULT '10000000';

-- CreateIndex
CREATE INDEX "NewsArticle_categoryCode_idx" ON "NewsArticle"("categoryCode");
