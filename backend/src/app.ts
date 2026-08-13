import path from "node:path"
import express from "express"
import cors from "cors"
import createRoutes from "./routes/aggregate"
import createUploadsRouter from "./routes/uploads"
import { AppDB } from "./database/db"

export function createApp(db: AppDB, options: { uploadsDir?: string } = {}) {
	const app = express()
	const uploadsDir = options.uploadsDir ?? process.env.UPLOADS_DIR ?? path.join(__dirname, "../uploads")

	app.use(cors())
	app.use(express.json())
	app.use("/uploads", express.static(uploadsDir))
	app.use("/api", createUploadsRouter(uploadsDir))
	app.use(createRoutes(db))

	app.use(express.static(__dirname + "/assets"))

	app.get("/", (req: express.Request, res: express.Response) => {
		res.json({ status: "API is running on /api" })
	})
	return app
}
