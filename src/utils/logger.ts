import { env } from "@/env";

export const logger = {
  log: (...args: (string | number | boolean | object)[]) => {
    const environment = env.NODE_ENV || "development";
    console.log("Current NODE_ENV:", environment);
    if (environment === "development") {
      console.log(...args);
    }
  },
  error: console.error,
  warn: console.warn,
};
