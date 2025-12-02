-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "vendors" (
    "vendor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("vendor_id")
);

-- CreateTable
CREATE TABLE "rfps" (
    "rfp_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description_raw" TEXT,
    "description_structured" JSONB,
    "budget" DECIMAL(65,30),
    "delivery_timeline" TEXT,
    "payment_terms" TEXT,
    "warranty" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rfps_pkey" PRIMARY KEY ("rfp_id")
);

-- CreateTable
CREATE TABLE "rfp_vendors" (
    "id" TEXT NOT NULL,
    "rfp_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "email_status" "EmailStatus" NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rfp_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_emails" (
    "email_id" TEXT NOT NULL,
    "rfp_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "subject" TEXT,
    "email_body_raw" TEXT,
    "attachments" JSONB,
    "received_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vendor_emails_pkey" PRIMARY KEY ("email_id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "proposal_id" TEXT NOT NULL,
    "rfp_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "email_id" TEXT NOT NULL,
    "parsed_proposal" JSONB,
    "total_price" DECIMAL(65,30),
    "delivery_days" INTEGER,
    "payment_terms" TEXT,
    "warranty" TEXT,
    "completeness_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("proposal_id")
);

-- CreateTable
CREATE TABLE "comparisons" (
    "comparison_id" TEXT NOT NULL,
    "rfp_id" TEXT NOT NULL,
    "result_json" JSONB,
    "recommended_vendor_id" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "comparisons_pkey" PRIMARY KEY ("comparison_id")
);

-- AddForeignKey
ALTER TABLE "rfp_vendors" ADD CONSTRAINT "rfp_vendors_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "rfps"("rfp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfp_vendors" ADD CONSTRAINT "rfp_vendors_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_emails" ADD CONSTRAINT "vendor_emails_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "rfps"("rfp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_emails" ADD CONSTRAINT "vendor_emails_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "rfps"("rfp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "vendor_emails"("email_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "rfps"("rfp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_recommended_vendor_id_fkey" FOREIGN KEY ("recommended_vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE RESTRICT ON UPDATE CASCADE;
