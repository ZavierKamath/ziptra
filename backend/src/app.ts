import express from "express"
import cors from "cors"
import createRoutes from "./routes/aggregate"
import { AppDB } from "./database/db"

export function createApp(db: AppDB) {
	const app = express()

	app.use(cors())
	app.use(express.json())
	app.use(createRoutes(db))

	app.use(express.static(__dirname + "/assets"))

	app.get("/", (req: express.Request, res: express.Response) => {
		res.json({ status: "API is running on /api" })
	})
	return app
}
