import imapConfig from "../config/imap";
import imaps from "imap-simple";
import { simpleParser } from "mailparser";
// import { handleIncomingEmail } from "../services/emailHandler"; // adjust path as needed

export const startEmailListener = async () => {
  try {
    const connection = await imaps.connect(imapConfig);

    await connection.openBox("INBOX");

    console.log("IMAP connected. Listening for new emails...");

    setInterval(async () => {
      const searchCriteria = ["UNSEEN"];
      const fetchOptions = {
        bodies: ["HEADER", "TEXT", ""],
        markSeen: true,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      for (const item of messages) {
        const all = item.parts.find((p) => p.which === "");
        if(all?.body){
        const parsed = await simpleParser(all.body);
        // await handleIncomingEmail(parsed);

        }
      }
    }, 10000); // check every 10 seconds
  } catch (err) {
    console.error("IMAP Error:", err);
  }
};
