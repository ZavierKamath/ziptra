import type {
	TaskRow,
	TaskStatus,
	TaskDetails,
	CommentRow,
	CreateTaskInput,
	UpdateTaskInput
} from "../models.ts"
import { comments, tasks } from "../database/schema.ts"
import { AppDB } from "../database/db.ts"
import { eq, gte, ne, or } from "drizzle-orm"

export function getTasks(db: AppDB, closedSince?: string): TaskRow[] {
	if (closedSince) {
		return db.select()
			.from(tasks)
			.where(or(ne(tasks.status, "Closed"), gte(tasks.updatedAt, closedSince)))
			.all()
	}

	return db.select().from(tasks).all()
}

export function createTask(db: AppDB, input: CreateTaskInput): TaskRow {
	const nowString: string = new Date().toISOString()

	const taskRowToInsert: TaskRow = {
		taskId: `task_${crypto.randomUUID()}`,
		projectId: input.projectId || null,
		title: input.title,
		description: input.description ?? null,
		createdAt: nowString,
		updatedAt: nowString,
		status: input.status || "New" as TaskStatus
	}

	const newTaskRow: TaskRow = db.insert(tasks)
		.values(taskRowToInsert)
		.returning()
		.get()

	return newTaskRow
}

export function getTaskDetails(db: AppDB, taskId: string): TaskDetails {
	if (!taskId.startsWith("task_")) {
		throw new Error(`taskId must start with task_ - found ${taskId}`)
	}

	const taskRow: TaskRow | undefined = db.select()
		.from(tasks)
		.where(eq(tasks.taskId, taskId))
		.get()

	if (!taskRow) {
		throw new Error(`No TaskRow for taskId: ${taskId}`)
	}

	const taskComments: CommentRow[] = db.select()
		.from(comments)
		.where(eq(comments.taskId, taskId))
		.all()

	const taskDetails: TaskDetails = {
		task: taskRow,
		comments: taskComments,
	}

	return taskDetails
}

export function updateTask(db: AppDB, input: UpdateTaskInput): TaskRow {
	if (!input.taskId.startsWith("task_")) {
		throw new Error(
			`Error in updateTask: TaskRow ID does not start with "task_", it is ${input.taskId}
		`)
	}

	const taskRowToUpdate: TaskRow | undefined = db.select()
		.from(tasks)
		.where(eq(tasks.taskId, input.taskId))
		.get()

	if (!taskRowToUpdate) {
		throw new Error(`Error in updateTask: No TaskRow with ID = ${input.taskId}`)
	}

	const nowString: string = new Date().toISOString()

	const taskRowToInsert: TaskRow = {
		taskId: taskRowToUpdate.taskId,
		projectId: input.projectId === undefined ? taskRowToUpdate.projectId : input.projectId,
		title: input.title || taskRowToUpdate.title,
		description: input.description ?? taskRowToUpdate.description,
		createdAt: taskRowToUpdate.createdAt,
		updatedAt: nowString,
		status: input.status || taskRowToUpdate.status
	}

	const updatedTaskRow: TaskRow = db.update(tasks)
		.set(taskRowToInsert)
		.where(eq(tasks.taskId, input.taskId))
		.returning()
		.get()

	return updatedTaskRow
}

export function deleteTask(db: AppDB, taskId: string): string {
	if (!taskId.startsWith("task_")) {
		throw new Error(
			`Error in deleteTask: taskId does not start with "task_", it is ${taskId}
		`)
	}

	const deletedTask = db.delete(tasks)
		.where(eq(tasks.taskId, taskId))
		.returning({ deletedTaskId: tasks.taskId })
		.get()

	if (!deletedTask) {
		throw new Error(`Error in deleteTask: No TaskRow with ID = ${taskId}`)
	}

	return deletedTask.deletedTaskId
}
