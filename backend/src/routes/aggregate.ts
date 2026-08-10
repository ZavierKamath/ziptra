import { Router } from "express"
import tasksController from "./tasks"
import projectsController from "./projects"

const api = Router()
//  .use(tasksController)
  .use(projectsController)

export default Router().use("/api", api)
