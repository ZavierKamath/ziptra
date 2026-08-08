import { NextFunction, Request, Response, Router } from "express"
import { getTasks, createTask, updateTask, deleteTask } from "../services/tasks"

const router = Router()

router.get("/tasks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await getTasks()
    res.json({ tasks })
  } catch (error) {
    next(error)
  }
})

router.post("/tasks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await createTask(req.body.task)
    res.status(201).json({ task })
  } catch (error) {
    next(error)
  }
})

router.put("/tasks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await updateTask(req.body.task.taskId, req.body.task)
    res.status(201).json({ task })
  } catch (error) {
    next(error)
  }
})

router.delete("/tasks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await deleteTask(req.body.task.taskId)
    res.status(201).json({ task })
  } catch (error) {
    next(error)
  }
})

export default router
