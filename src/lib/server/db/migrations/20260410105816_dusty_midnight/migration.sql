ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_client_id_clients_id_fk";--> statement-breakpoint
ALTER TABLE "line_items" DROP CONSTRAINT IF EXISTS "line_items_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "line_items" DROP CONSTRAINT IF EXISTS "line_items_invoice_id_invoices_id_fk";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "settings" DROP CONSTRAINT IF EXISTS "settings_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "access_token_expires_at" SET DATA TYPE timestamp(6) with time zone USING "access_token_expires_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "refresh_token_expires_at" SET DATA TYPE timestamp(6) with time zone USING "refresh_token_expires_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DATA TYPE timestamp(6) with time zone USING "created_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(6) with time zone USING "updated_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "email" SET DATA TYPE varchar(255) USING "email"::varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "street" SET DATA TYPE varchar(255) USING "street"::varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "street" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "city" SET DATA TYPE varchar(255) USING "city"::varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "state" SET DATA TYPE varchar(255) USING "state"::varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "state" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "zip" SET DATA TYPE varchar(255) USING "zip"::varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "zip" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "client_id" SET DATA TYPE uuid USING "client_id"::uuid;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "subject" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "discount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "line_items" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "line_items" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "line_items" ALTER COLUMN "invoice_id" SET DATA TYPE uuid USING "invoice_id"::uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expires_at" SET DATA TYPE timestamp(6) with time zone USING "expires_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "token" SET DATA TYPE varchar(255) USING "token"::varchar(255);--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DATA TYPE timestamp(6) with time zone USING "created_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(6) with time zone USING "updated_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET DATA TYPE varchar(255) USING "email"::varchar(255);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp(6) with time zone USING "created_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(6) with time zone USING "updated_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "expires_at" SET DATA TYPE timestamp(6) with time zone USING "expires_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DATA TYPE timestamp(6) with time zone USING "created_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(6) with time zone USING "updated_at"::timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;