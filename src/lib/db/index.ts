import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

import { PUBLIC_SUPABASE_URL } from '$env/static/public';

// Create a PostgreSQL client
const client = postgres(PUBLIC_SUPABASE_URL);

// Create a Drizzle instance
export const db = drizzle(client, { schema });

// Export the client for migrations
export { client };
