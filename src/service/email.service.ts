import transporter from "../config/mailer";
import { EmailPayload } from "../types/types";


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

export const sendVendor = async()=> {
    
}
