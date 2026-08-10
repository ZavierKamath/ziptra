import { createDb } from "./database/db"
import { createApp } from "./app"

const db = createDb("ziptra.db")
const app = createApp(db)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.info(`server up on port ${PORT}`)
});
