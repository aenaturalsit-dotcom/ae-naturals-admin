// utils/logger.ts
export const logger = {
  log: (message: string, meta?: any) => {
    console.log(`🟢 ${message}`, meta || "");
  },
  warn: (message: string, meta?: any) => {
    console.warn(`🟡 ${message}`, meta || "");
  },
  error: (message: string, meta?: any) => {
    console.error(`🔴 ${message}`, meta || "");
  },
};