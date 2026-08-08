import type { Task } from "../models.ts"

export function getTasks(): Task[] {}
export function createTask(task: Task): Task {}
export function updateTask(taskId: string, task: Task): Task {}
export function deleteTask(taskId: string): string {}
