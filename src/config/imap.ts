import { appEnv } from "./env";

const imapConfig = {
  imap: {
    user: appEnv.email.user,           // Gmail address
    password: appEnv.email.appPassword, // App password
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 3000,
    tlsOptions: { rejectUnauthorized: false }, // optional for dev self-signed certs/
     keepalive: {
      interval: 3000, // ping every 3s
      idleInterval: 10000, 
      forceNoop: true
    }
  },
};

export default imapConfig;
