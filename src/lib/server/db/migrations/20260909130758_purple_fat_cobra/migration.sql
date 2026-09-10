-- Better Auth 1.7.3: restore 1.6 account identity (provider_id, account_id); drop issuer.
DROP INDEX IF EXISTS `account_issuer_accountId_uidx`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `issuer`;
