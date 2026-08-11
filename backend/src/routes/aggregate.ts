import { Router } from "express"
import createTasksRouter from "./tasks"
import createProjectsRouter from "./projects"
import createCommentsRouter from "./comments"
import { AppDB } from "../database/db"

export default function createRoutes(db: AppDB) {
	const api = Router()
	  .use(createTasksRouter(db))
		.use(createProjectsRouter(db))
		.use(createCommentsRouter(db))

	return Router().use("/api", api)
}
