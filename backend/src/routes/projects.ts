import { NextFunction, Request, Response, Router } from "express" 
import {
	getProjects,
	getProjectDetails,
	createProject,
	updateProject,
	deleteProject
} from "../services/projects"
import type { AppDB } from "../database/db"

export default function createProjectsRouter(db: AppDB) {
	const router = Router() 

	router.get("/projects", async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const projects = getProjects(db) 
			res.json({ projects }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.get("/projects/:projectId", async (req: Request<{ projectId: string }>, res: Response, next: NextFunction) => {
		try {
			const project = getProjectDetails(db, req.params.projectId) 
			res.json({ project }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.post("/projects", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const project = createProject(db, req.body) 
			res.status(201).json({ project }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.put("/projects", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const project = updateProject(db, req.body) 
			res.status(201).json({ project }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.delete("/projects", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const projectIdToDelete: string = req.body.projectId
			const projectId = deleteProject(db, projectIdToDelete) 
			res.status(201).json({ projectId }) 
		} catch (error) {
			next(error) 
		}
	}) 

	return router 
}
