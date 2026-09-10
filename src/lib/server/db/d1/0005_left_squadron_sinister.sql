-- Better Auth 1.7.3: non-unique lookup index for (provider_id, account_id).
CREATE INDEX `account_providerId_accountId_idx` ON `account` (`provider_id`,`account_id`);