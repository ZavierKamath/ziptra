export type TaskStatus = "New" | "Explore" | "Build" | "Validate" | "Closed"
export type ProjectStatus = "New" | "Active" | "Closed"
export type ParentType = "Task" | "Project"

export type Comment = {
	commentId: string,
	parentType: ParentType,
	parentId: string,
	createdAt: Date,
	updatedAt: Date,
	content: string
}

export interface CommentRow {
	commentId: string,
	parentType: string,
	parentId: string,
	createdAt: string,
	updatedAt: string,
	content: string
}

export type Task = {
	taskId: string,
	projectId: string,
	title: string,
	description: string,
	comments: Comment[],
	createdAt: Date,
	updatedAt: Date,
	status: TaskStatus
}

export interface TaskRow {
	taskId: string,
	projectId: string,
	title: string,
	description: string,
	createdAt: string,
	updatedAt: string,
	status: string
}

export type Project = {
	projectId: string,
	title: string,
	description: string,
	comments: Comment[],
	createdAt: Date,
	updatedAt: Date,
	status: ProjectStatus
}

export interface ProjectRow {
	projectId: string,
	title: string,
	description: string,
	createdAt: string,
	updatedAt: string,
	status: string
}
