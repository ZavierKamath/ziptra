import { beforeEach, describe, expect, it } from "vitest"
import request from "supertest"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { createDb } from "../src/database/db"
import { createApp } from "../src/app"
import { comments, tasks, projects } from "../src/database/schema"
import { eq } from "drizzle-orm"

const db = createDb(":memory:")

migrate(db, {
  migrationsFolder: "drizzle",
})

const app = createApp(db)
beforeEach(() => {
	db.delete(comments).run()
	db.delete(projects).run()
	db.delete(tasks).run()
})

describe("Tasks API", () => {
	it("creates and fetches single task", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const testProjectId = createProjectResponse.body.project.projectId

		const createTaskResponse = await request(app)
			.post("/api/tasks")
			.send({
				projectId: testProjectId,
				title: "Test Task Title",
				description: "Test task description."
			})

		expect(createTaskResponse.status).toBe(201)
		expect(createTaskResponse.body.task.title).toBe("Test Task Title")
		expect(createTaskResponse.body.task.description).toBe("Test task description.")

		const getResponse = await request(app)
			.get("/api/tasks")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.tasks).toHaveLength(1)
		expect(getResponse.body.tasks[0].title).toBe("Test Task Title")
		expect(getResponse.body.tasks[0].description).toBe("Test task description.")
	})

	it("creates unspecified status task with New status", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const testProjectId = createProjectResponse.body.project.projectId

		const createTaskResponse = await request(app)
			.post("/api/tasks")
			.send({
				projectId: testProjectId,
				title: "Test Task Title",
				description: "Test task description."
			})

		expect(createTaskResponse.status).toBe(201)
		expect(createTaskResponse.body.task.title).toBe("Test Task Title")
		expect(createTaskResponse.body.task.description).toBe("Test task description.")
		expect(createTaskResponse.body.task.status).toBe("New")

		const getResponse = await request(app)
			.get("/api/tasks")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.tasks).toHaveLength(1)
		expect(getResponse.body.tasks[0].title).toBe("Test Task Title")
		expect(getResponse.body.tasks[0].description).toBe("Test task description.")
		expect(getResponse.body.tasks[0].status).toBe("New")
	})

	it("creates unspecified project task", async () => {
		const createTaskResponse = await request(app)
			.post("/api/tasks")
			.send({
				title: "Test Task Title",
				description: "Test task description."
			})

		expect(createTaskResponse.status).toBe(201)
		expect(createTaskResponse.body.task.projectId).toBe(null)
		expect(createTaskResponse.body.task.title).toBe("Test Task Title")
		expect(createTaskResponse.body.task.description).toBe("Test task description.")
		expect(createTaskResponse.body.task.status).toBe("New")

		const getResponse = await request(app)
			.get("/api/tasks")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.tasks[0].projectId).toBe(null)
		expect(getResponse.body.tasks).toHaveLength(1)
		expect(getResponse.body.tasks[0].title).toBe("Test Task Title")
		expect(getResponse.body.tasks[0].description).toBe("Test task description.")
		expect(getResponse.body.tasks[0].status).toBe("New")
	})

	it("creates and fetches two tasks", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const testProjectId = createProjectResponse.body.project.projectId

		const createTaskResponse = await request(app)
			.post("/api/tasks")
			.send({
				projectId: testProjectId,
				title: "Test Task Title",
				description: "Test task description."
			})

		expect(createTaskResponse.status).toBe(201)
		expect(createTaskResponse.body.task.projectId).toBe(testProjectId)
		expect(createTaskResponse.body.task.title).toBe("Test Task Title")
		expect(createTaskResponse.body.task.description).toBe("Test task description.")

		const getResponse = await request(app)
			.get("/api/tasks")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.tasks[0].projectId).toBe(testProjectId)
		expect(getResponse.body.tasks).toHaveLength(1)
		expect(getResponse.body.tasks[0].title).toBe("Test Task Title")
		expect(getResponse.body.tasks[0].description).toBe("Test task description.")

		const createResponse2 = await request(app)
			.post("/api/tasks")
			.send({
				projectId: testProjectId,
				title: "Test Task Title 2",
				description: "Test task description 2."
			})

		expect(createResponse2.status).toBe(201)
		expect(createResponse2.body.task.projectId).toBe(testProjectId)
		expect(createResponse2.body.task.title).toBe("Test Task Title 2")
		expect(createResponse2.body.task.description).toBe("Test task description 2.")

		const getResponse2 = await request(app)
			.get("/api/tasks")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.tasks).toHaveLength(2)
		expect(getResponse2.body.tasks[0].projectId).toBe(testProjectId)
		expect(getResponse2.body.tasks[1].projectId).toBe(testProjectId)
		expect(getResponse2.body.tasks[0].title).toBe("Test Task Title")
		expect(getResponse2.body.tasks[1].title).toBe("Test Task Title 2")
		expect(getResponse2.body.tasks[0].description).toBe("Test task description.")
		expect(getResponse2.body.tasks[1].description).toBe("Test task description 2.")
	})

	it("excludes only closed tasks older than the requested cutoff", async () => {
		const oldClosed = await request(app).post("/api/tasks").send({ title: "Old closed", status: "Closed" })
		const recentClosed = await request(app).post("/api/tasks").send({ title: "Recent closed", status: "Closed" })
		const oldBuild = await request(app).post("/api/tasks").send({ title: "Old build", status: "Build" })
		const oldDate = "2025-01-01T00:00:00.000Z"

		for (const taskId of [oldClosed.body.task.taskId, oldBuild.body.task.taskId]) {
			db.update(tasks).set({ updatedAt: oldDate }).where(eq(tasks.taskId, taskId)).run()
		}

		const response = await request(app).get("/api/tasks?closedSince=2025-06-01T00:00:00.000Z")

		expect(response.status).toBe(200)
		expect(response.body.tasks.map((task: { title: string }) => task.title)).toEqual([
			"Recent closed",
			"Old build"
		])
	})

	it("fetches details for a single task", async () => {
		const createTaskResponse = await request(app)
			.post("/api/tasks")
			.send({
				title: "Test Task Title",
				description: "Test task description."
			})

		expect(createTaskResponse.status).toBe(201)
		expect(createTaskResponse.body.task.title).toBe("Test Task Title")
		expect(createTaskResponse.body.task.description).toBe("Test task description.")

		const taskId = createTaskResponse.body.task.taskId

		const createTaskCommentResponse = await request(app)
			.post("/api/comments")
			.send({
				taskId: taskId,
				content: "Test task comment content."
			})

		const getDetailsResponse = await request(app)
			.get(`/api/tasks/${taskId}`)

		expect(getDetailsResponse.status).toBe(200)
		expect(getDetailsResponse.body.task.task.title).toBe("Test Task Title")
		expect(getDetailsResponse.body.task.task.description).toBe("Test task description.")
		expect(getDetailsResponse.body.task.comments).toHaveLength(1)
		expect(getDetailsResponse.body.task.comments[0].content).toBe("Test task comment content.")
		expect(getDetailsResponse.body.task.comments[0].commentId).toBe(createTaskCommentResponse.body.comment.commentId)
		expect(getDetailsResponse.body.task.comments[0].taskId).toBe(taskId)
		expect(getDetailsResponse.body.task.comments[0].projectId).toBe(null)
	})

	it("updates an existing task", async () => {
		const createResponse = await request(app)
			.post("/api/tasks")
			.send({
				title: "Test Task Title",
				description: "Test task description."
			})

		const initialTaskId: string = createResponse.body.task.taskId

		const getResponse = await request(app)
			.get("/api/tasks")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.tasks).toHaveLength(1)
		expect(getResponse.body.tasks[0].title).toBe("Test Task Title")
		expect(getResponse.body.tasks[0].description).toBe("Test task description.")

		const updateResponse = await request(app)
			.put("/api/tasks")
			.send({
				taskId: initialTaskId,
				title: "Updated Test Title",
				description: "Updated test description.",
				status: "Build"
			})

		expect(updateResponse.status).toBe(201)
		expect(updateResponse.body.task.title).toBe("Updated Test Title")
		expect(updateResponse.body.task.description).toBe("Updated test description.")
		expect(updateResponse.body.task.status).toBe("Build")

		const getResponse2 = await request(app)
			.get("/api/tasks")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.tasks).toHaveLength(1)
		expect(getResponse2.body.tasks[0].title).toBe("Updated Test Title")
		expect(getResponse2.body.tasks[0].description).toBe("Updated test description.")
		expect(getResponse2.body.tasks[0].status).toBe("Build")
	})

	it("updates one of many tasks", async () => {
		for (let i = 0; i < 5; i++) {
			await request(app)
				.post("/api/tasks")
				.send({
					title: "Test Task Title",
					description: "Test task description."
				})
		}

		const getResponse = await request(app)
			.get("/api/tasks")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.tasks).toHaveLength(5)
		expect(getResponse.body.tasks[0].title).toBe("Test Task Title")
		expect(getResponse.body.tasks[0].description).toBe("Test task description.")
		expect(getResponse.body.tasks[0].status).toBe("New")

		const thirdTaskId = getResponse.body.tasks[2].taskId

		const updateResponse = await request(app)
			.put("/api/tasks")
			.send({
				taskId: thirdTaskId,
				title: "Updated Test Task Title",
				description: "Updated test task description.",
				status: "Build"
			})

		expect(updateResponse.status).toBe(201)
		expect(updateResponse.body.task.taskId).toBe(thirdTaskId)
		expect(updateResponse.body.task.title).toBe("Updated Test Task Title")
		expect(updateResponse.body.task.description).toBe("Updated test task description.")
		expect(updateResponse.body.task.status).toBe("Build")

		const getResponse2 = await request(app)
			.get("/api/tasks")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.tasks).toHaveLength(5)

		let foundRelevantTask = false
		for (const task of getResponse2.body.tasks) {
			if (task.taskId === thirdTaskId) {
				expect(task.title).toBe("Updated Test Task Title")
				expect(task.description).toBe("Updated test task description.")
				expect(task.status).toBe("Build")
				foundRelevantTask = true
			}
		}
		expect(foundRelevantTask).toBe(true)
	})

	it("reassigns a task and makes it standalone", async () => {
		const firstProject = await request(app).post("/api/projects").send({ title: "First" })
		const secondProject = await request(app).post("/api/projects").send({ title: "Second" })
		const created = await request(app).post("/api/tasks").send({
			projectId: firstProject.body.project.projectId,
			title: "Task",
			description: "Description"
		})

		const reassigned = await request(app).put("/api/tasks").send({
			taskId: created.body.task.taskId,
			projectId: secondProject.body.project.projectId
		})
		expect(reassigned.body.task.projectId).toBe(secondProject.body.project.projectId)

		const standalone = await request(app).put("/api/tasks").send({
			taskId: created.body.task.taskId,
			projectId: null,
			description: ""
		})
		expect(standalone.body.task.projectId).toBe(null)
		expect(standalone.body.task.description).toBe("")
	})

	it("deletes an existing task", async () => {
		const createResponse = await request(app)
			.post("/api/tasks")
			.send({
				title: "Test Task Title",
				description: "Test task description."
			})

		const initialTaskId: string = createResponse.body.task.taskId

		const getResponse = await request(app)
			.get("/api/tasks")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.tasks).toHaveLength(1)
		expect(getResponse.body.tasks[0].title).toBe("Test Task Title")
		expect(getResponse.body.tasks[0].description).toBe("Test task description.")

		const deleteResponse = await request(app)
			.delete("/api/tasks")
			.send({
				taskId: initialTaskId
			})

		expect(deleteResponse.status).toBe(201)
		expect(deleteResponse.body.taskId).toBe(initialTaskId)

		const getResponse2 = await request(app)
			.get("/api/tasks")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.tasks).toHaveLength(0)
	})

	it("deletes one of many tasks", async () => {
		for (let i = 0; i < 5; i++) {
			await request(app)
				.post("/api/tasks")
				.send({
					title: "Test Task Title",
					description: "Test task description."
				})
		}

		const getResponse = await request(app)
			.get("/api/tasks")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.tasks).toHaveLength(5)
		expect(getResponse.body.tasks[0].title).toBe("Test Task Title")
		expect(getResponse.body.tasks[0].description).toBe("Test task description.")

		const firstTaskId = getResponse.body.tasks[0].taskId

		const deleteResponse = await request(app)
			.delete("/api/tasks")
			.send({
				taskId: firstTaskId
			})

		expect(deleteResponse.status).toBe(201)
		expect(deleteResponse.body.taskId).toBe(firstTaskId)

		const getResponse2 = await request(app)
			.get("/api/tasks")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.tasks).toHaveLength(4)

		for (const task of getResponse2.body.tasks) {
			expect(task.taskId).not.toBe(firstTaskId)
		}
	})
})
