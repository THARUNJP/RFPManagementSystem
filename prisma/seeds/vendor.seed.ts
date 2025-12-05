// prisma/seeds/vendors.ts

import { EmailStatus } from "@prisma/client";
import { prisma } from "../../src/config/prisma";


 export async function SeedDatabase() {
  console.log(" Seeding database...");

  // -----------------------------
  // 1. Seed Vendors
  // -----------------------------
  const vendors = [
    { name: "Tech Supplies Global", contact_email: "contact@tsglobal.com", phone: "9876543210" },
    { name: "Digital Depot Solutions", contact_email: "info@digitaldepot.com", phone: "9123456780" },
    { name: "PrimeTech Distributors", contact_email: "sales@primetech.com", phone: "9988776655" },
    { name: "NextWave Electronics", contact_email: "support@nextwave.com", phone: "9090909090" },
    { name: "ProGear Systems", contact_email: "hello@progear.com", phone: "7878787878" },
    { name: "Infinity Tech Mart", contact_email: "service@infinitytech.com", phone: "9994442211" },
    { name: "Global IT Traders", contact_email: "sales@globalit.com", phone: "8882224444" },
  ];

  await prisma.vendors.createMany({ data: vendors });

  const allVendors = await prisma.vendors.findMany();


  // -----------------------------
  // 2. Seed RFPs
  // -----------------------------
  const rfps = [
    {
      title: "Procurement of Laptops & Monitors",
      description_raw: "Need laptops and monitors for new project team.",
      description_structured: {
        items: [
          { type: "Laptop", qty: 20, specs: "10GB RAM, 512GB SSD" },
          { type: "Monitor", qty: 15, specs: "27-inch IPS" },
        ],
      },
      budget: 50000,
      delivery_timeline: "30 days",
      payment_terms: "Net 30",
      warranty: "1 year"
    },
    {
      title: "Purchase of Networking Equipment",
      description_raw: "Require switches, routers, and cabling materials.",
      description_structured: {
        items: [
          { type: "Switch", qty: 10, specs: "24-port Gigabit" },
          { type: "Router", qty: 5, specs: "Dual-band enterprise" },
        ],
      },
      budget: 30000,
      delivery_timeline: "20 days",
      payment_terms: "Net 15",
      warranty: "2 years"
    },
  ];

  await prisma.rfps.createMany({ data: rfps });

  const allRfps = await prisma.rfps.findMany();


  // -----------------------------
  // 3. Seed RFP–Vendor Linking
  // -----------------------------
  const rfpVendors = [];

  for (const rfp of allRfps) {
    for (const vendor of allVendors) {
      rfpVendors.push({
        rfp_id: rfp.rfp_id,
        vendor_id: vendor.vendor_id,
        email_status:EmailStatus.sent,
        sent_at: new Date(),
      });
    }
  }

  await prisma.rfp_vendors.createMany({ data: rfpVendors });


  // -----------------------------
  // 4. Seed Vendor Emails
  // -----------------------------
  const vendorEmails = [];

  for (const rfp of allRfps) {
    for (const vendor of allVendors) {
      vendorEmails.push({
        rfp_id: rfp.rfp_id,
        vendor_id: vendor.vendor_id,
        subject: `Proposal for ${rfp.title}`,
        email_body_raw: `Dear Team,\nPlease find our proposal attached for ${rfp.title}.\nRegards,\n${vendor.name}`,
        attachments: [],
        received_at: new Date()
      });
    }
  }

  await prisma.vendor_emails.createMany({ data: vendorEmails });

  const allEmails = await prisma.vendor_emails.findMany();


  // -----------------------------
  // 5. Seed Proposals
  // -----------------------------
  const proposals = allEmails.map(email => ({
    rfp_id: email.rfp_id,
    vendor_id: email.vendor_id,
    email_id: email.email_id,
    parsed_proposal: {
      items: [
        { type: "Laptop", qty: 20, price: 1200 },
        { type: "Monitor", qty: 15, price: 300 }
      ],
      total: 1200 * 20 + 300 * 15
    },
    total_price: 1200 * 20 + 300 * 15,
    delivery_days: 25,
    payment_terms: "Net 30",
    warranty: "1 year",
    completeness_score: Math.floor(Math.random() * 100)
  }));

  await prisma.proposals.createMany({ data: proposals });


  // -----------------------------
  // 6. Seed Comparisons (AI Recommendation)
  // -----------------------------
  const comparisons = allRfps.map(rfp => {
    const vendor = allVendors[Math.floor(Math.random() * allVendors.length)];
    return {
      rfp_id: rfp.rfp_id,
      recommended_vendor_id: vendor.vendor_id,
      result_json: {
        recommended_vendor: vendor.name,
        reasoning: "Best price–value ratio with highest completeness score."
      },
      generated_at: new Date()
    };
  });

  await prisma.comparisons.createMany({ data: comparisons });

  console.log(" Seed complete");
}

SeedDatabase().finally(() => prisma.$disconnect());

