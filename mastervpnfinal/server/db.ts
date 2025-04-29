import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Please set up your database connection.");
  // You could add a fallback here such as SQLite for development
}

// Initialize database connection
const connectionString = process.env.DATABASE_URL || "";
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });