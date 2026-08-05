import { NextFunction, Request, Response, Router } from "express" 
import { getProjects, createProject, updateProject, deleteProject } from "../services/projects"

const router = Router() 

router.get("/projects", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await getProjects() 
    res.json({ projects }) 
  } catch (error) {
    next(error) 
  }
}) 

router.post("/projects", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await createProject(req.body.project) 
    res.status(201).json({ project }) 
  } catch (error) {
    next(error) 
  }
}) 

router.put("/projects", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await updateProject(req.body.project.projectId, req.body.project) 
    res.status(201).json({ project }) 
  } catch (error) {
    next(error) 
  }
}) 

router.delete("/projects", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await deleteProject(req.body.project.projectId) 
    res.status(201).json({ project }) 
  } catch (error) {
    next(error) 
  }
}) 

export default router 
