CREATE TABLE `catalog_state` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_owner` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL
);
