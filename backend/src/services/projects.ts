import type { Project, ProjectRow, TaskRow, CommentRow } from "../models.ts"
import { projects, tasks, comments } from "../database/schema.ts"
import { db } from "../database/db.ts"
import { eq, inArray } from "drizzle-orm"

export function getProjects(): Project[] {
	const foundProjects: ProjectRow[] = db.select()
		.from(projects)
		.all()

	const projectIds: string[] = foundProjects.map(project => project.projectId)

	const foundTasks: TaskRow[] = db.select()
		.from(tasks)
		.where(inArray(tasks.projectId, projectIds))
		.all()


}
export function createProject(project: Project): Project {}
export function updateProject(projectId: string, project: Project): Project {}
export function deleteProject(projectId: string): string {}
