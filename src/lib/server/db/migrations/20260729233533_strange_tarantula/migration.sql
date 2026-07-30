-- Better Auth 1.7 rc.2: account identity is (issuer, provider_account_id).
-- Credential rows use issuer `local:credential` and provider_account_id = user id.
ALTER TABLE `account` RENAME COLUMN `account_id` TO `provider_account_id`;--> statement-breakpoint
ALTER TABLE `account` ADD `issuer` text NOT NULL DEFAULT 'local:credential';--> statement-breakpoint
UPDATE `account` SET `issuer` = 'local:credential' WHERE `provider_id` = 'credential';--> statement-breakpoint
UPDATE `account` SET `issuer` = 'local:oauth:' || `provider_id` WHERE `provider_id` != 'credential';--> statement-breakpoint
CREATE UNIQUE INDEX `account_issuer_providerAccountId_uidx` ON `account` (`issuer`,`provider_account_id`);
