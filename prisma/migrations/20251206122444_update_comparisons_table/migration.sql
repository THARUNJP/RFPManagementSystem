/*
  Warnings:

  - You are about to drop the column `recommended_vendor_id` on the `comparisons` table. All the data in the column will be lost.
  - Added the required column `recommended_proposal_id` to the `comparisons` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comparisons" DROP CONSTRAINT "comparisons_recommended_vendor_id_fkey";

-- AlterTable
ALTER TABLE "comparisons" DROP COLUMN "recommended_vendor_id",
ADD COLUMN     "recommended_proposal_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_recommended_proposal_id_fkey" FOREIGN KEY ("recommended_proposal_id") REFERENCES "proposals"("proposal_id") ON DELETE RESTRICT ON UPDATE CASCADE;
