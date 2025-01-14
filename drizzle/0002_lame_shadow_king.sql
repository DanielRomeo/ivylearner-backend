PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_course` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`short_description` text NOT NULL,
	`description` text,
	`thumbnail` text,
	`price` integer,
	`duration` integer,
	`level` text,
	`prerequisites` text,
	`objectives` text,
	`tags` text,
	`language` text,
	`certificate_available` integer,
	`featured` integer,
	`rating` integer,
	`enrollment_count` integer,
	`publish_status` text,
	`published_at` integer,
	`last_updated` integer,
	`organisation_id` integer NOT NULL,
	`created_by` integer NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisation`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_course`("id", "title", "short_description", "description", "thumbnail", "price", "duration", "level", "prerequisites", "objectives", "tags", "language", "certificate_available", "featured", "rating", "enrollment_count", "publish_status", "published_at", "last_updated", "organisation_id", "created_by") SELECT "id", "title", "short_description", "description", "thumbnail", "price", "duration", "level", "prerequisites", "objectives", "tags", "language", "certificate_available", "featured", "rating", "enrollment_count", "publish_status", "published_at", "last_updated", "organisation_id", "created_by" FROM `course`;--> statement-breakpoint
DROP TABLE `course`;--> statement-breakpoint
ALTER TABLE `__new_course` RENAME TO `course`;--> statement-breakpoint
PRAGMA foreign_keys=ON;