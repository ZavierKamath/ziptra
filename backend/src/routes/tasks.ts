import { NextFunction, Request, Response, Router } from "express"
import { getTasks, createTask, updateTask, deleteTask } from "../services/tasks"
import type { AppDB } from "../database/db"

export default function createTasksRouter(db: AppDB) {
	const router = Router()

	router.get("/tasks", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const tasks = await getTasks(db)
			res.json({ tasks })
		} catch (error) {
			next(error)
		}
	})

	router.post("/tasks", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const task = await createTask(db, req.body)
			res.status(201).json({ task })
		} catch (error) {
			next(error)
		}
	})

	router.put("/tasks", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const task = await updateTask(db, req.body)
			res.status(201).json({ task })
		} catch (error) {
			next(error)
		}
	})

	router.delete("/tasks", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const taskIdToDelete: string = req.body.taskId
			const task = await deleteTask(db, taskIdToDelete)
			res.status(201).json({ task })
		} catch (error) {
			next(error)
		}
	})

	return router
}
