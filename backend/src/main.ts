import express from "express"
import cors from "cors"
import routes from "./routes/aggregate"

const app = express()

app.use(cors())
app.use(express.json())
app.use(routes)

app.use(express.static(__dirname + "/assets"))

app.get("/", (req: express.Request, res: express.Response) => {
  res.json({ status: "API is running on /api" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.info(`server up on port ${PORT}`)
});
