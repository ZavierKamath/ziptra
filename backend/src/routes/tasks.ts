import { NextFunction, Request, Response, Router } from "express"
import {
	getTasks,
	getTaskDetails,
	createTask,
	updateTask,
	deleteTask
} from "../services/tasks"
import type { AppDB } from "../database/db"

export default function createTasksRouter(db: AppDB) {
	const router = Router()

	router.get("/tasks", async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const tasks = getTasks(db)
			res.json({ tasks })
		} catch (error) {
			next(error)
		}
	})

	router.get("/tasks/:taskId", async (req: Request<{ taskId: string }>, res: Response, next: NextFunction) => {
		try {
			const task = getTaskDetails(db, req.params.taskId) 
			res.json({ task }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.post("/tasks", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const task = createTask(db, req.body)
			res.status(201).json({ task })
		} catch (error) {
			next(error)
		}
	})

	router.put("/tasks", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const task = updateTask(db, req.body)
			res.status(201).json({ task })
		} catch (error) {
			next(error)
		}
	})

	router.delete("/tasks", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const taskIdToDelete: string = req.body.taskId
			const taskId = deleteTask(db, taskIdToDelete)
			res.status(201).json({ taskId })
		} catch (error) {
			next(error)
		}
	})

	return router
}
