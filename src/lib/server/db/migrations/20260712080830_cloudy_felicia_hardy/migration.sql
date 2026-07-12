CREATE INDEX "clients_userId_id_idx" ON "clients" ("user_id","id");--> statement-breakpoint
CREATE INDEX "invoices_userId_id_idx" ON "invoices" ("user_id","id");--> statement-breakpoint
CREATE INDEX "invoices_userId_clientId_id_idx" ON "invoices" ("user_id","client_id","id");--> statement-breakpoint
CREATE INDEX "line_items_invoiceId_idx" ON "line_items" ("invoice_id");
