CREATE TABLE `comments` (
	`commentId` text PRIMARY KEY NOT NULL,
	`taskId` text,
	`projectId` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`taskId`) REFERENCES `tasks`(`taskId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`projectId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`projectId` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`taskId` text PRIMARY KEY NOT NULL,
	`projectId` text,
	`title` text NOT NULL,
	`description` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`projectId`) ON UPDATE no action ON DELETE set null
);
