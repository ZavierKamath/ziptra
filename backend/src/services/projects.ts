import type {
	CommentRow,
	ProjectRow,
	TaskRow,
	ProjectStatus,
	CreateProjectInput,
	UpdateProjectInput,
	ProjectDetails
} from "../models.ts"
import { comments, tasks, projects } from "../database/schema.ts"
import { AppDB } from "../database/db.ts"
import { eq, inArray } from "drizzle-orm"

export function getProjects(db: AppDB): ProjectRow[] {
	const foundProjects: ProjectRow[] = db.select()
		.from(projects)
		.all()

	return foundProjects
}

export function getProjectDetails(db: AppDB, projectId: string): ProjectDetails {
	if (!projectId.startsWith("proj_")) {
		throw new Error(`projectId must start with proj_ - found ${projectId}`)
	}

	const projectRow: ProjectRow | undefined = db.select()
		.from(projects)
		.where(eq(projects.projectId, projectId))
		.get()

	if (!projectRow) {
		throw new Error(`No ProjectRow for projectId: ${projectId}`)
	}

	const projectTasks: TaskRow[] = db.select()
		.from(tasks)
		.where(eq(tasks.projectId, projectId))
		.all()

	const taskIds: string[] = projectTasks.map(task => task.taskId)

	const taskComments: CommentRow[] = db.select()
		.from(comments)
		.where(inArray(comments.taskId, taskIds))
		.all()

	const projectComments: CommentRow[] = db.select()
		.from(comments)
		.where(eq(comments.projectId, projectId))
		.all()

	const projectDetails: ProjectDetails = {
		project: projectRow,
		projectComments: projectComments,
		tasks: projectTasks,
		taskComments: taskComments
	}

	return projectDetails
}

export function createProject(db: AppDB, input: CreateProjectInput): ProjectRow {
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
export function updateProject(db: AppDB, input: UpdateProjectInput): ProjectRow {
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

	const updatedProjectRow: ProjectRow = db.update(projects)
		.set(projectRowToInsert)
		.where(eq(projects.projectId, input.projectId))
		.returning()
		.get()

	return updatedProjectRow
}

export function deleteProject(db: AppDB, projectId: string): string {
	if (!projectId.startsWith("proj_")) {
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
