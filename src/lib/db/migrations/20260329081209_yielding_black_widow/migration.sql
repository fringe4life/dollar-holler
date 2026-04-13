ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invoices" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "line_items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_username_unique";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "two_factor_enabled";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "display_username";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");