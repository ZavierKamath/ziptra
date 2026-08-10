import { getRequest, postRequest, putRequest, deleteRequest } from "./helpers"
import type { CreateTaskInput, UpdateTaskInput } from "../../../backend/src/models.ts"

export async function getTasksAPI() {
	const tasksData = await getRequest("http://localhost:3000/api/tasks")
	console.log(`GET tasksData = ${JSON.stringify(tasksData)}`)
	return tasksData.task
}

export async function createTaskAPI(input: CreateTaskInput) {
	const tasksData = await postRequest("http://localhost:3000/api/tasks", input)
	console.log(`POST tasksData = ${JSON.stringify(tasksData)}`)
	return tasksData.task
}

export async function updateTaskAPI(input: UpdateTaskInput) {
	const tasksData = await putRequest("http://localhost:3000/api/tasks", input)
	console.log(`PUT tasksData = ${JSON.stringify(tasksData)}`)
	return tasksData.task
}

export async function deleteTaskAPI(input: { tasksId: string }) {
	const tasksData = await deleteRequest("http://localhost:3000/api/tasks", input)
	console.log(`DELETE tasksData = ${JSON.stringify(tasksData)}`)
	return tasksData
}
