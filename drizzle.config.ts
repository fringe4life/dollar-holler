import { defineConfig } from 'drizzle-kit';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables for Drizzle config');
}

const host = supabaseUrl.replace('https://', '');
const connectionString = `postgresql://postgres:${supabaseKey}@${host}:5432/postgres`;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
});
