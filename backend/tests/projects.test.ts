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
				title: "Test Project Title",
				description: "Test project description."
			})

		expect(createResponse.status).toBe(201)
		expect(createResponse.body.project.title).toBe("Test Project Title")
		expect(createResponse.body.project.description).toBe("Test project description.")

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test Project Title")
		expect(getResponse.body.projects[0].description).toBe("Test project description.")
	})

	it("creates unspecified status project with New status", async () => {
		const createResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		expect(createResponse.status).toBe(201)
		expect(createResponse.body.project.title).toBe("Test Project Title")
		expect(createResponse.body.project.description).toBe("Test project description.")
		expect(createResponse.body.project.status).toBe("New")

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test Project Title")
		expect(getResponse.body.projects[0].description).toBe("Test project description.")
		expect(getResponse.body.projects[0].status).toBe("New")
	})

	it("creates and fetches two projects", async () => {
		const createResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		expect(createResponse.status).toBe(201)
		expect(createResponse.body.project.title).toBe("Test Project Title")
		expect(createResponse.body.project.description).toBe("Test project description.")

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test Project Title")
		expect(getResponse.body.projects[0].description).toBe("Test project description.")

		const createResponse2 = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title 2",
				description: "Test project description 2."
			})

		expect(createResponse2.status).toBe(201)
		expect(createResponse2.body.project.title).toBe("Test Project Title 2")
		expect(createResponse2.body.project.description).toBe("Test project description 2.")

		const getResponse2 = await request(app)
			.get("/api/projects")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.projects).toHaveLength(2)
		expect(getResponse2.body.projects[0].title).toBe("Test Project Title")
		expect(getResponse2.body.projects[1].title).toBe("Test Project Title 2")
		expect(getResponse2.body.projects[0].description).toBe("Test project description.")
		expect(getResponse2.body.projects[1].description).toBe("Test project description 2.")
	})

	it("fetches details for a single project", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		expect(createProjectResponse.status).toBe(201)
		expect(createProjectResponse.body.project.title).toBe("Test Project Title")
		expect(createProjectResponse.body.project.description).toBe("Test project description.")

		const projectId = createProjectResponse.body.project.projectId

		const createProjectCommentResponse = await request(app)
			.post("/api/comments")
			.send({
				projectId: projectId,
				content: "Test project comment content."
			})


		let taskTwoId = "garbo"
		for (let i = 0; i < 3; i++) {
			const createTaskResponse = await request(app)
				.post("/api/tasks")
				.send({
					projectId: projectId,
					title: "Test Task Title",
					description: "Test task description."
				})
			if (i === 1) {
				taskTwoId = createTaskResponse.body.task.taskId
			}
		}

		const createTaskCommentResponse = await request(app)
			.post("/api/comments")
			.send({
				taskId: taskTwoId,
				content: "Test task comment content."
			})

		const getDetailsResponse = await request(app)
			.get(`/api/projects/${projectId}`)

		expect(getDetailsResponse.status).toBe(200)
		expect(getDetailsResponse.body.project.project.title).toBe("Test Project Title")
		expect(getDetailsResponse.body.project.tasks).toHaveLength(3)
		expect(getDetailsResponse.body.project.tasks[0].title).toBe("Test Task Title")
		expect(getDetailsResponse.body.project.tasks[0].description).toBe("Test task description.")
		expect(getDetailsResponse.body.project.projectComments).toHaveLength(1)
		expect(getDetailsResponse.body.project.taskComments).toHaveLength(1)
		expect(getDetailsResponse.body.project.taskComments[0].projectId).toBe(null)
		expect(getDetailsResponse.body.project.taskComments[0].taskId).toBe(taskTwoId)
		expect(getDetailsResponse.body.project.taskComments[0].content).toBe("Test task comment content.")
		expect(getDetailsResponse.body.project.projectComments[0].content).toBe("Test project comment content.")
	})

	it("updates an existing project", async () => {
		const createResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const initialProjectId: string = createResponse.body.project.projectId

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test Project Title")
		expect(getResponse.body.projects[0].description).toBe("Test project description.")

		const updateResponse = await request(app)
			.put("/api/projects")
			.send({
				projectId: initialProjectId,
				title: "Updated Test Project Title",
				description: "Updated test project description.",
				status: "Active"
			})

		expect(updateResponse.status).toBe(201)
		expect(updateResponse.body.project.title).toBe("Updated Test Project Title")
		expect(updateResponse.body.project.description).toBe("Updated test project description.")
		expect(updateResponse.body.project.status).toBe("Active")

		const getResponse2 = await request(app)
			.get("/api/projects")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.projects).toHaveLength(1)
		expect(getResponse2.body.projects[0].title).toBe("Updated Test Project Title")
		expect(getResponse2.body.projects[0].description).toBe("Updated test project description.")
		expect(getResponse2.body.projects[0].status).toBe("Active")
	})

	it("updates one of many projects", async () => {
		for (let i = 0; i < 5; i++) {
			await request(app)
				.post("/api/projects")
				.send({
					title: "Test Project Title",
					description: "Test project description."
				})
		}

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(5)
		expect(getResponse.body.projects[0].title).toBe("Test Project Title")
		expect(getResponse.body.projects[0].description).toBe("Test project description.")
		expect(getResponse.body.projects[0].status).toBe("New")

		const thirdProjectId = getResponse.body.projects[2].projectId

		const updateResponse = await request(app)
			.put("/api/projects")
			.send({
				projectId: thirdProjectId,
				title: "Updated Test Project Title",
				description: "Updated test project description.",
				status: "Active"
			})

		expect(updateResponse.status).toBe(201)
		expect(updateResponse.body.project.projectId).toBe(thirdProjectId)
		expect(updateResponse.body.project.title).toBe("Updated Test Project Title")
		expect(updateResponse.body.project.description).toBe("Updated test project description.")
		expect(updateResponse.body.project.status).toBe("Active")

		const getResponse2 = await request(app)
			.get("/api/projects")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.projects).toHaveLength(5)

		let foundRelevantProject = false
		for (const project of getResponse2.body.projects) {
			if (project.projectId === thirdProjectId) {
				expect(project.title).toBe("Updated Test Project Title")
				expect(project.description).toBe("Updated test project description.")
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
				title: "Test Project Title",
				description: "Test project description."
			})

		const initialProjectId: string = createResponse.body.project.projectId

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(1)
		expect(getResponse.body.projects[0].title).toBe("Test Project Title")
		expect(getResponse.body.projects[0].description).toBe("Test project description.")

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
					title: "Test Project Title",
					description: "Test project description."
				})
		}

		const getResponse = await request(app)
			.get("/api/projects")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.projects).toHaveLength(5)
		expect(getResponse.body.projects[0].title).toBe("Test Project Title")
		expect(getResponse.body.projects[0].description).toBe("Test project description.")

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
