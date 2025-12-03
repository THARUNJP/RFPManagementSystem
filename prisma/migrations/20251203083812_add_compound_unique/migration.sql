/*
  Warnings:

  - A unique constraint covering the columns `[rfp_id,vendor_id]` on the table `rfp_vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "rfp_vendors_rfp_id_vendor_id_key" ON "rfp_vendors"("rfp_id", "vendor_id");
