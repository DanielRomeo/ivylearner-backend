PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_organisation` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`short_description` text,
	`banner` text,
	`logo` text,
	`website` text,
	`email` text,
	`phone` text,
	`address` text,
	`social_media` text,
	`verification_status` text,
	`founded_year` integer,
	`created_by` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `instructor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_organisation`("id", "name", "description", "short_description", "banner", "logo", "website", "email", "phone", "address", "social_media", "verification_status", "founded_year", "created_by") SELECT "id", "name", "description", "short_description", "banner", "logo", "website", "email", "phone", "address", "social_media", "verification_status", "founded_year", "created_by" FROM `organisation`;--> statement-breakpoint
DROP TABLE `organisation`;--> statement-breakpoint
ALTER TABLE `__new_organisation` RENAME TO `organisation`;--> statement-breakpoint
PRAGMA foreign_keys=ON;