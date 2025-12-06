/*
  Warnings:

  - You are about to drop the column `updated_at` on the `comparisons` table. All the data in the column will be lost.
  - Made the column `generated_at` on table `comparisons` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "comparisons" DROP COLUMN "updated_at",
ALTER COLUMN "generated_at" SET NOT NULL,
ALTER COLUMN "generated_at" DROP DEFAULT;
