import nodemailer, { Transporter } from "nodemailer";

export function createEmailTransporter(): Transporter {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("Email configuration error:", error);
    } else {
      console.log("Nodemailer transporter initialized successfully");
    }
  });

  return transporter;
}

const emailTransporter = createEmailTransporter();
export default emailTransporter;
