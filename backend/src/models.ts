export type TaskStatus = "New" | "Explore" | "Build" | "Validate" | "Closed"
export type ProjectStatus = "New" | "Active" | "Closed"

export type Comment = {
	commentId: string,
	createdAt: Date,
	content: string
}

export type Task = {
	taskId: string,
	title: string,
	description: string,
	comments: Comment[],
	createdAt: Date,
	status: TaskStatus
}

export type Project = {
	projectId: string,
	title: string,
	description: string,
	comments: Comment[],
	createdAt: Date,
	status: ProjectStatus
}
