import { env } from "@/env";

export const logger = {
  log: (...args: (string | number | boolean | object)[]) => {
    if (env.NODE_ENV === "development") {
      console.log(...args);
    }
  },
  error: console.error,
  warn: console.warn,
};