CREATE TABLE `rounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`option_a` text NOT NULL,
	`option_b` text NOT NULL,
	`deadline` integer NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`count_a` integer,
	`count_b` integer,
	`commentary` text DEFAULT '' NOT NULL,
	`commentary_source` text DEFAULT 'preset' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`round_id` integer NOT NULL,
	`participant` text NOT NULL,
	`choice` text NOT NULL,
	PRIMARY KEY(`round_id`, `participant`),
	FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON UPDATE no action ON DELETE no action
);
