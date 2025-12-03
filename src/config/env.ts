import z from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("8000"), // read as string from env
  DATABASE_URL: z.string(),
  SHADOW_DATABASE_URL: z.string(),
  GEMINI_API_KEY: z.string(),
  GMAIL_USER: z.string(),
  GMAIL_APP_PASSWORD: z.string(),
});

// 2. Parse and validate

const env = envSchema.parse(process.env);

// 3. Export centralized config

export const appEnv = {
  env: env.NODE_ENV,
  port: Number(env.PORT),

  api_key: {
    gemini: env.GEMINI_API_KEY,
  },

  database: {
    main: env.DATABASE_URL,
    shadow: env.SHADOW_DATABASE_URL,
  },
  email: {
    user: env.GMAIL_USER,
    appPassword: env.GMAIL_APP_PASSWORD,
  },
};
