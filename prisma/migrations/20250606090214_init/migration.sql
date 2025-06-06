-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "topic" TEXT,
ADD COLUMN     "topicSummaryId" TEXT;

-- CreateTable
CREATE TABLE "TopicSummary" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "categoryCode" TEXT NOT NULL DEFAULT '10000000',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicSummary_title_key" ON "TopicSummary"("title");

-- CreateIndex
CREATE INDEX "TopicSummary_categoryCode_idx" ON "TopicSummary"("categoryCode");

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_topicSummaryId_fkey" FOREIGN KEY ("topicSummaryId") REFERENCES "TopicSummary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
