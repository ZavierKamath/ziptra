import type { Project } from "../models.ts"

export function getProjects(): Project[] {}
export function createProject(project: Project): Project {}
export function updateProject(projectId: string, project: Project): Project {}
export function deleteProject(projectId: string): string {}
