import { beforeEach, describe, expect, it } from "vitest"
import request from "supertest"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { createDb } from "../src/database/db"
import { createApp } from "../src/app"
import { comments, projects, tasks } from "../src/database/schema"

const db = createDb(":memory:")

migrate(db, {
  migrationsFolder: "drizzle",
})

const app = createApp(db)
beforeEach(() => {
	db.delete(comments).run()
	db.delete(tasks).run()
	db.delete(projects).run()
})

describe("Projects API", () => {
	it("creates and fetche single project", async () => {
		const createResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test title",
				description: "Test description."
			})

		expect(createResponse.status).toBe(201)
		expect(createResponse.body.project.title).toBe("Test title")
		expect(createResponse.body.project.description).toBe("Test description.")

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test title")
		expect(getResponse.body.projects[0].description).toBe("Test description.")
	})

	it("creates and fetches multiple projects", async () => {
		const createResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test title",
				description: "Test description."
			})

		expect(createResponse.status).toBe(201)
		expect(createResponse.body.project.title).toBe("Test title")
		expect(createResponse.body.project.description).toBe("Test description.")

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test title")
		expect(getResponse.body.projects[0].description).toBe("Test description.")

		const createResponse2 = await request(app)
			.post("/api/projects")
			.send({
				title: "Test title 2",
				description: "Test description 2."
			})

		expect(createResponse2.status).toBe(201)
		expect(createResponse2.body.project.title).toBe("Test title 2")
		expect(createResponse2.body.project.description).toBe("Test description 2.")

		const getResponse2 = await request(app)
			.get("/api/projects")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.projects).toHaveLength(2)
		expect(getResponse2.body.projects[0].title).toBe("Test title")
		expect(getResponse2.body.projects[1].title).toBe("Test title 2")
		expect(getResponse2.body.projects[0].description).toBe("Test description.")
		expect(getResponse2.body.projects[1].description).toBe("Test description 2.")
	})

	it("updates an existing project", async () => {
		const createResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test title",
				description: "Test description."
			})

		const initialProjectId: string = createResponse.body.projectId

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test title")
		expect(getResponse.body.projects[0].description).toBe("Test description.")

		const updateResponse = await request(app)
			.put("/api/projects")
			.send({
				projectId: initialProjectId,
				title: "Updated Test Title",
				description: "Updated test description."
			})

		expect(updateResponse.status).toBe(201)
		expect(updateResponse.body.project.title).toBe("Updated Test Title")
		expect(updateResponse.body.project.description).toBe("Updated test description.")

		const getResponse2 = await request(app)
			.get("/api/projects")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.projects).toHaveLength(1)
		expect(getResponse2.body.projects[0].title).toBe("Updated Test Title")
		expect(getResponse2.body.projects[0].description).toBe("Updated test description.")
	})
})
