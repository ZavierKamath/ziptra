import { NextFunction, Request, Response, Router } from "express" 
import { getProjects, createProject, updateProject, deleteProject } from "../services/projects"
import type { AppDB } from "../database/db"

export default function createProjectsRouter(db: AppDB) {
	const router = Router() 

	router.get("/projects", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const projects = await getProjects(db) 
			res.json({ projects }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.post("/projects", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const project = await createProject(db, req.body) 
			res.status(201).json({ project }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.put("/projects", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const project = await updateProject(db, req.body) 
			res.status(201).json({ project }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.delete("/projects", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const projectIdToDelete: string = req.body.projectId
			const projectId = await deleteProject(db, projectIdToDelete) 
			res.status(201).json({ projectId }) 
		} catch (error) {
			next(error) 
		}
	}) 

	return router 
}
