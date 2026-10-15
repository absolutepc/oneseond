CREATE TABLE `admin_account` (
	`id` text PRIMARY KEY NOT NULL,
	`password_hash` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_login_limit` (
	`id` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_session` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`account_version` integer NOT NULL,
	`expires_at` integer NOT NULL
);
