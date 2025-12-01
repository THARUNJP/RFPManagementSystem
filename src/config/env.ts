import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("8000"), // read as string from env
  DATABASE_URL: z.string(),
  SHADOW_DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  FORGET_PASSWORD_SECRET:z.string()
});

// 2. Parse and validate

const env = envSchema.parse(process.env);


// 3. Export centralized config

export const appEnv = {
  env: env.NODE_ENV,
  port: Number(env.PORT),

  database: {
    main: env.DATABASE_URL,
    shadow: env.SHADOW_DATABASE_URL,
  },
  jwt: {
    accessSecret: env.ACCESS_TOKEN_SECRET,
    refreshSecret: env.REFRESH_TOKEN_SECRET,
    forgetPassSecret:env.FORGET_PASSWORD_SECRET,
  },
};

