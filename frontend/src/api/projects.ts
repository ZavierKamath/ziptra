import { getRequest, postRequest, putRequest, deleteRequest } from "./helpers"
import type { CreateProjectInput, UpdateProjectInput } from "../../../backend/src/models.ts"

export async function getProjectsAPI() {
	const projectData = await getRequest("http://localhost:3000/api/projects")
	console.log(`GET projectData = ${JSON.stringify(projectData)}`)
	return projectData.projects
}

export async function createProjectAPI(input: CreateProjectInput) {
	const projectData = await postRequest("http://localhost:3000/api/projects", input)
	console.log(`POST projectData = ${JSON.stringify(projectData)}`)
	return projectData.project
}

export async function updateProjectAPI(input: UpdateProjectInput) {
	const projectData = await putRequest("http://localhost:3000/api/projects", input)
	console.log(`PUT projectData = ${JSON.stringify(projectData)}`)
	return projectData.project
}

export async function deleteProjectAPI(input: { projectId: string }) {
	const projectData = await deleteRequest("http://localhost:3000/api/projects", input)
	console.log(`DELETE projectData = ${JSON.stringify(projectData)}`)
	return projectData
}
