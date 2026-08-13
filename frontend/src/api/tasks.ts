import { jsonRequest, request } from "./helpers"
import type { CreateTaskInput, Task, TaskDetails, UpdateTaskInput } from "../types"

export async function getTasksAPI(closedSince?: string) {
  const query = closedSince ? `?closedSince=${encodeURIComponent(closedSince)}` : ""
  return (await request<{ tasks: Task[] }>(`/api/tasks${query}`)).tasks
}

export async function getTaskAPI(taskId: string) {
  return (await request<{ task: TaskDetails }>(`/api/tasks/${taskId}`)).task
}

export async function createTaskAPI(input: CreateTaskInput) {
  return (await jsonRequest<{ task: Task }>("/api/tasks", "POST", input)).task
}

export async function updateTaskAPI(input: UpdateTaskInput) {
  return (await jsonRequest<{ task: Task }>("/api/tasks", "PUT", input)).task
}

export function deleteTaskAPI(taskId: string) {
  return jsonRequest<{ taskId: string }>("/api/tasks", "DELETE", { taskId })
}
