import type {
	Project,
	ProjectRow,
	TaskRow,
	CommentRow,
	ProjectStatus,
	CreateProjectInput,
    UpdateProjectInput
} from "../models.ts"
import { projects, tasks, comments } from "../database/schema.ts"
import { db } from "../database/db.ts"
import { eq, inArray } from "drizzle-orm"

export function getProjects(): ProjectRow[] {
	const foundProjects: ProjectRow[] = db.select()
		.from(projects)
		.all()

	return foundProjects
}

export function createProject(input: CreateProjectInput): ProjectRow {
	const nowString: string = new Date().toISOString()

	const projectRowToInsert: ProjectRow = {
		projectId: `proj_${crypto.randomUUID()}`,
		title: input.title,
		description: input.description || null,
		createdAt: nowString,
		updatedAt: nowString,
		status: input.status || "New" as ProjectStatus
	}

	const newProjectRow: ProjectRow = db.insert(projects)
		.values(projectRowToInsert)
		.returning()
		.get()

	return newProjectRow
}
export function updateProject(input: UpdateProjectInput): ProjectRow {
	if (!input.projectId.startsWith("proj_")) {
		throw new Error(
			`Error in updateProject: ProjectRow ID does not start with "proj_", it is ${input.projectId}
		`)
	}

	const projectRowToUpdate: ProjectRow | undefined = db.select()
		.from(projects)
		.where(eq(projects.projectId, input.projectId))
		.get()

	if (!projectRowToUpdate) {
		throw new Error(`Error in updateProject: No ProjectRow with ID = ${input.projectId}`)
	}

	const nowString: string = new Date().toISOString()

	const projectRowToInsert: ProjectRow = {
		projectId: projectRowToUpdate.projectId,
		title: input.title || projectRowToUpdate.title,
		description: input.description || projectRowToUpdate.description,
		createdAt: projectRowToUpdate.createdAt,
		updatedAt: nowString,
		status: input.status || projectRowToUpdate.status
	}

	const updatedProjectRow: ProjectRow = db.insert(projects)
		.values(projectRowToInsert)
		.returning()
		.get()

	return updatedProjectRow
}

export function deleteProject(projectId: string): string {
	if (projectId.startsWith("proj_")) {
		throw new Error(
			`Error in deleteProject: projectId does not start with "proj_", it is ${projectId}
		`)
	}

	const deletedProject = db.delete(projects)
		.where(eq(projects.projectId, projectId))
		.returning({ deletedProjectId: projects.projectId })
		.get()

	if (!deletedProject) {
		throw new Error(`Error in deleteProject: No ProjectRow with ID = ${projectId}`)
	}

	return deletedProject.deletedProjectId
}
