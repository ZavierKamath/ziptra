import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

export function createDb(dbString: string) {
	const sqlite = new Database(dbString)
	sqlite.pragma("foreign_keys = ON")
	const db = drizzle(sqlite)
	return db
}

export type AppDB = ReturnType<typeof createDb>
