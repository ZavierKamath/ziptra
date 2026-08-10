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
	it("creates and fetches single project", async () => {
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

	it("creates unspecified status project with New status", async () => {
		const createResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test title",
				description: "Test description."
			})

		expect(createResponse.status).toBe(201)
		expect(createResponse.body.project.title).toBe("Test title")
		expect(createResponse.body.project.description).toBe("Test description.")
		expect(createResponse.body.project.status).toBe("New")

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test title")
		expect(getResponse.body.projects[0].description).toBe("Test description.")
		expect(getResponse.body.projects[0].status).toBe("New")
	})

	it("creates and fetches two projects", async () => {
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

		const initialProjectId: string = createResponse.body.project.projectId

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
				description: "Updated test description.",
				status: "Active"
			})

		expect(updateResponse.status).toBe(201)
		expect(updateResponse.body.project.title).toBe("Updated Test Title")
		expect(updateResponse.body.project.description).toBe("Updated test description.")
		expect(updateResponse.body.project.status).toBe("Active")

		const getResponse2 = await request(app)
			.get("/api/projects")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.projects).toHaveLength(1)
		expect(getResponse2.body.projects[0].title).toBe("Updated Test Title")
		expect(getResponse2.body.projects[0].description).toBe("Updated test description.")
		expect(getResponse2.body.projects[0].status).toBe("Active")
	})

	it("updates one of many projects", async () => {
		for (let i = 0; i < 5; i++) {
			await request(app)
				.post("/api/projects")
				.send({
					title: "Test title",
					description: "Test description."
				})
		}

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(5)
		expect(getResponse.body.projects[0].title).toBe("Test title")
		expect(getResponse.body.projects[0].description).toBe("Test description.")
		expect(getResponse.body.projects[0].status).toBe("New")

		const thirdProjectId = getResponse.body.projects[2].projectId

		const updateResponse = await request(app)
			.put("/api/projects")
			.send({
				projectId: thirdProjectId,
				title: "Updated Test Title",
				description: "Updated test description.",
				status: "Active"
			})

		expect(updateResponse.status).toBe(201)
		expect(updateResponse.body.project.projectId).toBe(thirdProjectId)
		expect(updateResponse.body.project.title).toBe("Updated Test Title")
		expect(updateResponse.body.project.description).toBe("Updated test description.")
		expect(updateResponse.body.project.status).toBe("Active")

		const getResponse2 = await request(app)
			.get("/api/projects")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.projects).toHaveLength(5)

		let foundRelevantProject = false
		for (const project of getResponse2.body.projects) {
			if (project.projectId === thirdProjectId) {
				expect(project.title).toBe("Updated Test Title")
				expect(project.description).toBe("Updated test description.")
				expect(project.status).toBe("Active")
				foundRelevantProject = true
			}
		}
		expect(foundRelevantProject).toBe(true)
	})

	it("deletes an existing project", async () => {
		const createResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test title",
				description: "Test description."
			})

		const initialProjectId: string = createResponse.body.project.projectId

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test title")
		expect(getResponse.body.projects[0].description).toBe("Test description.")

		const deleteResponse = await request(app)
			.delete("/api/projects")
			.send({
				projectId: initialProjectId
			})

		expect(deleteResponse.status).toBe(201)
		expect(deleteResponse.body.projectId).toBe(initialProjectId)

		const getResponse2 = await request(app)
			.get("/api/projects")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.projects).toHaveLength(0)
	})

	it("deletes one of many projects", async () => {
		for (let i = 0; i < 5; i++) {
			await request(app)
				.post("/api/projects")
				.send({
					title: "Test title",
					description: "Test description."
				})
		}

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(5)
		expect(getResponse.body.projects[0].title).toBe("Test title")
		expect(getResponse.body.projects[0].description).toBe("Test description.")

		const firstProjectId = getResponse.body.projects[0].projectId

		const deleteResponse = await request(app)
			.delete("/api/projects")
			.send({
				projectId: firstProjectId
			})

		expect(deleteResponse.status).toBe(201)
		expect(deleteResponse.body.projectId).toBe(firstProjectId)

		const getResponse2 = await request(app)
			.get("/api/projects")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.projects).toHaveLength(4)

		for (const project of getResponse2.body.projects) {
			expect(project.projectId).not.toBe(firstProjectId)
		}
	})
})
