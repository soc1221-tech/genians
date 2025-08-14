import { type Express } from "express";

export function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Remove vite-specific functions as they're not needed for production
