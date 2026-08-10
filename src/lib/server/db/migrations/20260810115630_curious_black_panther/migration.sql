-- Better Auth 1.7 rc.4: revert rc.3 provider_account_id rename; identity is (issuer, account_id).
ALTER TABLE `account` RENAME COLUMN `provider_account_id` TO `account_id`;--> statement-breakpoint
DROP INDEX IF EXISTS `account_issuer_providerAccountId_uidx`;--> statement-breakpoint
CREATE UNIQUE INDEX `account_issuer_accountId_uidx` ON `account` (`issuer`,`account_id`);