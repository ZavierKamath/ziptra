import { afterAll, describe, expect, it } from "vitest"
import request from "supertest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { createDb } from "../src/database/db"
import { createApp } from "../src/app"

const uploadsDir = await mkdtemp(path.join(tmpdir(), "ziptra-uploads-"))
const app = createApp(createDb(":memory:"), { uploadsDir })

const images = [
	{ bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), mimeType: "image/png", extension: "png" },
	{ bytes: Buffer.from([0xff, 0xd8, 0xff, 0x00]), mimeType: "image/jpeg", extension: "jpg" },
	{ bytes: Buffer.from("GIF89a"), mimeType: "image/gif", extension: "gif" },
	{ bytes: Buffer.from("RIFF\x00\x00\x00\x00WEBP"), mimeType: "image/webp", extension: "webp" }
]

afterAll(async () => {
	await rm(uploadsDir, { recursive: true, force: true })
})

describe("Uploads API", () => {
	it.each(images)("uploads and serves $mimeType bytes", async ({ bytes, mimeType, extension }) => {
		const response = await request(app)
			.post("/api/uploads")
			.attach("image", bytes, { filename: "image.bin", contentType: "application/octet-stream" })

		expect(response.status).toBe(201)
		expect(response.body.upload).toEqual({
			filename: expect.stringMatching(new RegExp(`^[0-9a-f-]{36}\\.${extension}$`)),
			url: expect.stringMatching(new RegExp(`^/uploads/[0-9a-f-]{36}\\.${extension}$`)),
			mimeType,
			size: bytes.length
		})

		const served = await request(app).get(response.body.upload.url)
		expect(served.status).toBe(200)
		expect(served.headers["content-type"]).toContain(mimeType)
		expect(served.body).toEqual(bytes)
	})

	it("rejects a request without an image", async () => {
		const response = await request(app).post("/api/uploads").send({})
		expect(response.status).toBe(400)
		expect(response.headers["content-type"]).toMatch(/json/)
	})

	it("rejects unsupported bytes including SVG", async () => {
		for (const bytes of [Buffer.from("not an image"), Buffer.from("<svg></svg>")]) {
			const response = await request(app)
				.post("/api/uploads")
				.attach("image", bytes, { filename: "image.svg", contentType: "image/svg+xml" })
			expect(response.status).toBe(415)
		}
	})

	it("rejects images larger than 10 MiB", async () => {
		const bytes = Buffer.alloc(10 * 1024 * 1024 + 1)
		bytes.set(images[0].bytes)
		const response = await request(app)
			.post("/api/uploads")
			.attach("image", bytes, { filename: "large.png", contentType: "image/png" })
		expect(response.status).toBe(413)
	})
})
