import { NextFunction, Request, Response, Router } from "express" 
import { getComments, createComment, updateComment, deleteComment } from "../services/comments"
import type { AppDB } from "../database/db"

export default function createCommentsRouter(db: AppDB) {
	const router = Router() 

	router.get("/comments", async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const comments = getComments(db) 
			res.json({ comments }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.post("/comments", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const comment = createComment(db, req.body) 
			res.status(201).json({ comment }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.put("/comments", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const comment = updateComment(db, req.body) 
			res.status(201).json({ comment }) 
		} catch (error) {
			next(error) 
		}
	}) 

	router.delete("/comments", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const commentIdToDelete: string = req.body.commentId
			const commentId = deleteComment(db, commentIdToDelete) 
			res.status(201).json({ commentId }) 
		} catch (error) {
			next(error) 
		}
	}) 

	return router 
}
