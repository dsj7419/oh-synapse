import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    DISCORD_ELEVATED_USER_ID: z.string(), 
  },
  client: {
    NEXT_PUBLIC_CLIENTVAR: z.string().optional(), 
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    DISCORD_ELEVATED_USER_ID: process.env.DISCORD_ELEVATED_USER_ID, 
    NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true", 
  emptyStringAsUndefined: process.env.EMPTY_STRING_AS_UNDEFINED === "true",
});
