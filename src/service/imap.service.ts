import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import imapConfig from "../config/imap";
import { handleIncomingVendorEmail } from "../controller/vendor.controller";

let connection: any = null;

const connectIMAP = async () => {
  try {
    connection = await imaps.connect(imapConfig);
    await connection.openBox("INBOX");
    console.log("IMAP connected. Listening for new emails...");

    // Listen for new mail
    connection.on("mail", async () => {
      try {
        const messages = await connection.search(["UNSEEN"], {
          bodies: ["HEADER", "TEXT", ""],
          markSeen: true, // mark as read after fetching
        });

        for (const msg of messages) {
          const bodyPart = msg.parts.find((p: any) => p.which === "");
          if (bodyPart?.body) {
            const parsed = await simpleParser(bodyPart.body);
            console.log("New email received:", parsed.subject);
            handleIncomingVendorEmail(parsed);
          }
        }
      } catch (err) {
        console.error("Error fetching new email:", err);
      }
    });

    // Reconnect on error or end
    connection.on("error", (err:unknown) => {
      console.error("IMAP error:", err);
      reconnectIMAP();
    });

    connection.on("end", () => {
      console.log("IMAP connection ended, reconnecting...");
      reconnectIMAP();
    });
  } catch (err) {
    console.error("IMAP connection failed:", err);
    setTimeout(connectIMAP, 5000);
  }
};

const reconnectIMAP = () => {
  connection = null;
  setTimeout(connectIMAP, 5000);
};

export const startEmailListener = async () => {
  await connectIMAP();
};
