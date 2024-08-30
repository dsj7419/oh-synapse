import { env } from "@/env";

export const logger = {
  log: (...args: any[]) => {
    if (env.NODE_ENV === "development") {
      console.log(...args);
    }
  },
  error: console.error,
  warn: console.warn,
};