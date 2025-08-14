import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema.js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY must be set. Did you forget to configure Supabase?",
  );
}

// Create Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Create postgres client for Drizzle
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL or SUPABASE_DB_URL must be set for database operations",
  );
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Export client for session storage
export { client as pool };
