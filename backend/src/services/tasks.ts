import type {
	Project,
	ProjectRow,
	TaskRow,
	CommentRow,
	TaskStatus,
	CreateTaskInput,
	UpdateTaskInput
} from "../models.ts"
import { projects, tasks, comments } from "../database/schema.ts"
import { AppDB } from "../database/db.ts"
import { eq, inArray } from "drizzle-orm"

export function getTasks(db: AppDB): TaskRow[] {
	const foundTasks: TaskRow[] = db.select()
		.from(tasks)
		.all()

	return foundTasks
}

export function createTask(db: AppDB, input: CreateTaskInput): TaskRow {
	const nowString: string = new Date().toISOString()

	const taskRowToInsert: TaskRow = {
		taskId: `task_${crypto.randomUUID()}`,
		projectId: input.projectId || null,
		title: input.title,
		description: input.description || null,
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
		projectId: taskRowToUpdate.projectId,
		title: input.title || taskRowToUpdate.title,
		description: input.description || taskRowToUpdate.description,
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
