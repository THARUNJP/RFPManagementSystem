import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import imapConfig from "../config/imap";

let connection: any = null;

const connectIMAP = async () => {
  try {
    connection = await imaps.connect(imapConfig);
    await connection.openBox("INBOX");
    console.log("IMAP connected. Listening for new emails...");
    listenEmails();
  } catch (err) {
    console.error("IMAP connection error:", err);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectIMAP, 5000);
  }
};

const listenEmails = () => {
  if (!connection) return;

  setInterval(async () => {
    try {
      const searchCriteria = ["UNSEEN"];
      const fetchOptions = {
        bodies: ["HEADER", "TEXT", ""],
        markSeen: true,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      for (const msg of messages) {
        const bodyPart = msg.parts.find((p: any) => p.which === "");
        if (bodyPart?.body) {
          const parsed = await simpleParser(bodyPart.body);
          // await handleIncomingEmail(parsed);
        }
      }
    } catch (err) {
      console.error("IMAP read error:", err);
      console.log("Reconnecting IMAP...");
      connectIMAP(); // reconnect
    }
  }, 10000);
};

export const startEmailListener = async () => {
  await connectIMAP();
};
