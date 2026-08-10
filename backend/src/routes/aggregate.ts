import { Router } from "express"
import createTasksRouter from "./tasks"
import createProjectsRouter from "./projects"
import { AppDB } from "../database/db"

export default function createRoutes(db: AppDB) {
	const api = Router()
	//  .use(tasksController)
		.use(createProjectsRouter(db))

	return Router().use("/api", api)
}
