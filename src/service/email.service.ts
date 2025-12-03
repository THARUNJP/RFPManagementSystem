import transporter from "../config/mailer";
import { prisma } from "../config/prisma";
import { NotFound } from "../lib/errors/httpError";
import { generateRfpEmailHtml, mapRfpToEmailData } from "../lib/helper/helper";
import { EmailPayload, RfpEmailData } from "../types/types";


export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });
    return true; // email sent successfully
  } catch (error) {
    console.error("Email sending failed:", error);
    return false; // failed to send
  }
}

export const sendVendor = async (rfp_id: string, vendor_id: string) => {
  // 1. Fetch RFP
  const rfp = await prisma.rfps.findUnique({
    where: { rfp_id },
    select: {
      rfp_id: true,
      title: true,
      description_raw: true,
      description_structured: true,
      created_at: true,
    },
  });

  if (!rfp) throw new NotFound("RFP not found");

  // 2. Fetch Vendor
  const vendor = await prisma.vendors.findUnique({
    where: { vendor_id },
    select: { contact_email: true, name: true },
  });

  if (!vendor || !vendor.contact_email)
    throw new NotFound("Vendor not found or has no email");

  // 3. Map RFP to email-friendly data
  const emailData = mapRfpToEmailData(rfp);

  // 4. Generate HTML email
  const html = generateRfpEmailHtml(emailData);

  // 5. Send email
  await sendEmail({
    to: vendor.contact_email,
    subject: `New RFP: ${rfp.title}`,
    html,
  });
};

