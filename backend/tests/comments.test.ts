import { beforeEach, describe, expect, it } from "vitest"
import request from "supertest"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { createDb } from "../src/database/db"
import { createApp } from "../src/app"
import { tasks, comments, projects } from "../src/database/schema"

const db = createDb(":memory:")

migrate(db, {
  migrationsFolder: "drizzle",
})

const app = createApp(db)
beforeEach(() => {
	db.delete(tasks).run()
	db.delete(projects).run()
	db.delete(comments).run()
})

describe("Comments API", () => {
	it("creates and fetches single comment on a project", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const testProjectId = createProjectResponse.body.project.projectId

		const createCommentResponse = await request(app)
			.post("/api/comments")
			.send({
				projectId: testProjectId,
				content: "Test comment content.",
			})

		expect(createCommentResponse.status).toBe(201)
		expect(createCommentResponse.body.comment.content).toBe("Test comment content.")

		const getResponse = await request(app)
			.get("/api/comments")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.comments).toHaveLength(1)
		expect(getResponse.body.comments[0].taskId).toBe(null)
		expect(getResponse.body.comments[0].projectId).toBe(testProjectId)
		expect(getResponse.body.comments[0].content).toBe("Test comment content.")
	})

	it("creates and fetches single comment on a task", async () => {
		const createTaskResponse = await request(app)
			.post("/api/tasks")
			.send({
				title: "Test Task Title",
				description: "Test task description."
			})

		const testTaskId = createTaskResponse.body.task.taskId

		const createCommentResponse = await request(app)
			.post("/api/comments")
			.send({
				taskId: testTaskId,
				content: "Test comment content.",
			})

		expect(createCommentResponse.status).toBe(201)
		expect(createCommentResponse.body.comment.content).toBe("Test comment content.")

		const getResponse = await request(app)
			.get("/api/comments")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.comments).toHaveLength(1)
		expect(getResponse.body.comments[0].taskId).toBe(testTaskId)
		expect(getResponse.body.comments[0].projectId).toBe(null)
		expect(getResponse.body.comments[0].content).toBe("Test comment content.")
	})

	it("creates and fetches two comments", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const testProjectId = createProjectResponse.body.project.projectId

		const createCommentResponse = await request(app)
			.post("/api/comments")
			.send({
				projectId: testProjectId,
				content: "Test comment content."
			})

		expect(createCommentResponse.status).toBe(201)
		expect(createCommentResponse.body.comment.projectId).toBe(testProjectId)
		expect(createCommentResponse.body.comment.content).toBe("Test comment content.")

		const getResponse = await request(app)
			.get("/api/comments")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.comments[0].projectId).toBe(testProjectId)
		expect(getResponse.body.comments).toHaveLength(1)
		expect(getResponse.body.comments[0].content).toBe("Test comment content.")

		const createResponse2 = await request(app)
			.post("/api/comments")
			.send({
				projectId: testProjectId,
				content: "Test comment content 2."
			})

		expect(createResponse2.status).toBe(201)
		expect(createResponse2.body.comment.projectId).toBe(testProjectId)
		expect(createResponse2.body.comment.content).toBe("Test comment content 2.")

		const getResponse2 = await request(app)
			.get("/api/comments")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.comments).toHaveLength(2)
		expect(getResponse2.body.comments[0].projectId).toBe(testProjectId)
		expect(getResponse2.body.comments[1].projectId).toBe(testProjectId)
		expect(getResponse2.body.comments[0].content).toBe("Test comment content.")
		expect(getResponse2.body.comments[1].content).toBe("Test comment content 2.")
	})

	it("updates an existing comment", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const testProjectId = createProjectResponse.body.project.projectId

		const createResponse = await request(app)
			.post("/api/comments")
			.send({
				projectId: testProjectId,
				content: "Test comment content."
			})

		const initialCommentId: string = createResponse.body.comment.commentId

		const getResponse = await request(app)
			.get("/api/comments")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.comments).toHaveLength(1)
		expect(getResponse.body.comments[0].content).toBe("Test comment content.")

		const updateResponse = await request(app)
			.put("/api/comments")
			.send({
				commentId: initialCommentId,
				projectId: testProjectId,
				content: "Updated test comment content."
			})

		expect(updateResponse.status).toBe(201)
		expect(updateResponse.body.comment.commentId).toBe(initialCommentId)
		expect(updateResponse.body.comment.content).toBe("Updated test comment content.")

		const getResponse2 = await request(app)
			.get("/api/comments")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.comments).toHaveLength(1)
		expect(getResponse2.body.comments[0].commentId).toBe(initialCommentId)
		expect(getResponse2.body.comments[0].content).toBe("Updated test comment content.")
	})

	it("clears existing comment content", async () => {
		const project = await request(app).post("/api/projects").send({ title: "Project" })
		const created = await request(app).post("/api/comments").send({
			projectId: project.body.project.projectId,
			content: "Content"
		})

		const updated = await request(app).put("/api/comments").send({
			commentId: created.body.comment.commentId,
			content: ""
		})

		expect(updated.body.comment.content).toBe("")
	})

	it("updates one of many comments", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const testProjectId = createProjectResponse.body.project.projectId

		for (let i = 0; i < 5; i++) {
			await request(app)
				.post("/api/comments")
				.send({
					projectId: testProjectId,
					content: "Test comment content."
				})
		}

		const getResponse = await request(app)
			.get("/api/comments")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.comments).toHaveLength(5)
		expect(getResponse.body.comments[2].content).toBe("Test comment content.")

		const thirdCommentId = getResponse.body.comments[2].commentId

		const updateResponse = await request(app)
			.put("/api/comments")
			.send({
				commentId: thirdCommentId,
				content: "Updated test comment content."
			})

		expect(updateResponse.status).toBe(201)
		expect(updateResponse.body.comment.commentId).toBe(thirdCommentId)
		expect(updateResponse.body.comment.content).toBe("Updated test comment content.")

		const getResponse2 = await request(app)
			.get("/api/comments")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.comments).toHaveLength(5)

		let foundRelevantComment = false
		for (const comment of getResponse2.body.comments) {
			if (comment.commentId === thirdCommentId) {
				expect(comment.content).toBe("Updated test comment content.")
				foundRelevantComment = true
			}
		}
		expect(foundRelevantComment).toBe(true)
	})

	it("deletes an existing comment", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const testProjectId = createProjectResponse.body.project.projectId

		const createResponse = await request(app)
			.post("/api/comments")
			.send({
				projectId: testProjectId,
				content: "Test comment content."
			})

		const initialCommentId: string = createResponse.body.comment.commentId

		const getResponse = await request(app)
			.get("/api/comments")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.comments).toHaveLength(1)
		expect(getResponse.body.comments[0].content).toBe("Test comment content.")

		const deleteResponse = await request(app)
			.delete("/api/comments")
			.send({
				commentId: initialCommentId
			})

		expect(deleteResponse.status).toBe(201)
		expect(deleteResponse.body.commentId).toBe(initialCommentId)

		const getResponse2 = await request(app)
			.get("/api/comments")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.comments).toHaveLength(0)
	})

	it("deletes one of many comments", async () => {
		const createProjectResponse = await request(app)
			.post("/api/projects")
			.send({
				title: "Test Project Title",
				description: "Test project description."
			})

		const testProjectId = createProjectResponse.body.project.projectId

		for (let i = 0; i < 5; i++) {
			await request(app)
				.post("/api/comments")
				.send({
					projectId: testProjectId,
					content: "Test comment content."
				})
		}

		const getResponse = await request(app)
			.get("/api/comments")

		expect(getResponse.status).toBe(200)
		expect(getResponse.body.comments).toHaveLength(5)
		expect(getResponse.body.comments[0].content).toBe("Test comment content.")

		const firstCommentId = getResponse.body.comments[0].commentId

		const deleteResponse = await request(app)
			.delete("/api/comments")
			.send({
				commentId: firstCommentId
			})

		expect(deleteResponse.status).toBe(201)
		expect(deleteResponse.body.commentId).toBe(firstCommentId)

		const getResponse2 = await request(app)
			.get("/api/comments")

		expect(getResponse2.status).toBe(200)
		expect(getResponse2.body.comments).toHaveLength(4)

		for (const comment of getResponse2.body.comments) {
			expect(comment.commentId).not.toBe(firstCommentId)
		}
	})
})
