export type TaskStatus = "New" | "Explore" | "Build" | "Validate" | "Closed"
export type ProjectStatus = "New" | "Active" | "Closed"
export type ParentType = "Task" | "Project"

export type Comment = {
	commentId: string,
	taskId: string | null,
	projectId: string | null,
	createdAt: Date,
	updatedAt: Date,
	content: string
}

export interface CommentRow {
	commentId: string,
	taskId: string | null,
	projectId: string | null,
	createdAt: string,
	updatedAt: string,
	content: string
}

export type Task = {
	taskId: string,
	projectId: string | null,
	title: string,
	description: string | null,
	createdAt: Date,
	updatedAt: Date,
	status: TaskStatus
}

export type TaskDetails = {
	task: TaskRow,
	comments: CommentRow[],
}

export interface TaskRow {
	taskId: string,
	projectId: string | null,
	title: string,
	description: string | null,
	createdAt: string,
	updatedAt: string,
	status: string
}

export type Project = {
	projectId: string,
	title: string,
	description: string | null,
	createdAt: Date,
	updatedAt: Date,
	status: ProjectStatus
}

export type ProjectDetails = {
	project: ProjectRow,
	projectComments: CommentRow[],
	tasks: TaskRow[],
	taskComments: CommentRow[]
}

export interface ProjectRow {
	projectId: string,
	title: string,
	description: string | null,
	createdAt: string,
	updatedAt: string,
	status: string
}

export type CreateProjectInput = {
	title: string,
	description?: string,
	status?: ProjectStatus
}

export type UpdateProjectInput = {
	projectId: string,
	title?: string,
	description?: string,
	status?: ProjectStatus
}

export type CreateTaskInput = {
	title: string,
	projectId?: string | null,
	description?: string,
	status?: TaskStatus
}

export type UpdateTaskInput = {
	taskId: string,
	title?: string,
	projectId?: string | null,
	description?: string,
	status?: TaskStatus
}

export type CreateCommentInput = {
	taskId?: string | null,
	projectId?: string | null,
	content: string
}

export type UpdateCommentInput = {
	commentId: string,
	taskId?: string | null,
	projectId?: string | null,
	content?: string
}
