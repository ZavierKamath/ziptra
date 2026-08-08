import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const projects = sqliteTable("projects", {
	projectId: text("projectId").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	createdAt: text("createdAt").notNull(),
	updatedAt: text("updatedAt").notNull(),
	status: text("status").notNull()
})

export const tasks = sqliteTable("tasks", {
	taskId: text("tasksId").primaryKey(),
	projectId: text("projectId").references(() => projects.projectId, {
		onDelete: "set null"
	}),
	title: text("title").notNull(),
	description: text("description").notNull(),
	createdAt: text("createdAt").notNull(),
	updatedAt: text("updatedAt").notNull(),
	status: text("status").notNull()
})

export const comments = sqliteTable("comments", {
	commentId: text("commentId").primaryKey(),
	parentType: text("parentType").notNull(),
	parentId: text("parentId").notNull().references(() => projects.projectId, {
		onDelete: "cascade"
	}),
	createdAt: text("createdAt").notNull(),
	updatedAt: text("updatedAt").notNull(),
	content: text("content").notNull()
})
