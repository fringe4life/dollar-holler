CREATE TYPE "client_status" AS ENUM('active', 'archive');--> statement-breakpoint
CREATE TYPE "invoice_status" AS ENUM('draft', 'sent', 'paid');--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "client_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "client_status" SET DATA TYPE "client_status" USING "client_status"::"client_status";--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "client_status" SET DEFAULT 'active'::"client_status";--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "invoice_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "invoice_status" SET DATA TYPE "invoice_status" USING "invoice_status"::"invoice_status";--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "invoice_status" SET DEFAULT 'draft'::"invoice_status";