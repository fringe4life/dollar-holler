import { defineConfig } from "drizzle-kit";

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Missing Supabase environment variables for Drizzle config");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/lib/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: supabaseUrl,
	},
	verbose: true,
	strict: true,
});
