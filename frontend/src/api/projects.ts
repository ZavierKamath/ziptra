import { jsonRequest, request } from "./helpers"
import type { CreateProjectInput, Project, ProjectDetails, UpdateProjectInput } from "../types"

export async function getProjectsAPI(closedSince?: string) {
  const query = closedSince ? `?closedSince=${encodeURIComponent(closedSince)}` : ""
  return (await request<{ projects: Project[] }>(`/api/projects${query}`)).projects
}

export async function getProjectAPI(projectId: string) {
  return (await request<{ project: ProjectDetails }>(`/api/projects/${projectId}`)).project
}

export async function createProjectAPI(input: CreateProjectInput) {
  return (await jsonRequest<{ project: Project }>("/api/projects", "POST", input)).project
}

export async function updateProjectAPI(input: UpdateProjectInput) {
  return (await jsonRequest<{ project: Project }>("/api/projects", "PUT", input)).project
}

export function deleteProjectAPI(projectId: string) {
  return jsonRequest<{ projectId: string }>("/api/projects", "DELETE", { projectId })
}
