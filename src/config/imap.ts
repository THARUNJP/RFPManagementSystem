import { appEnv } from "./env";

 const imapConfig = {
  imap: {
    user: appEnv.email.user,
    password: appEnv.email.appPassword,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 3000,
  },
};

export default imapConfig;