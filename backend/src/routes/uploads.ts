import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextFunction, Request, Response, Router } from "express"
import multer from "multer"

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }
}).single("image")

type ImageType = { mimeType: string, extension: string }

function detectImageType(bytes: Buffer): ImageType | null {
	if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
		return { mimeType: "image/png", extension: "png" }
	}
	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return { mimeType: "image/jpeg", extension: "jpg" }
	}
	if (["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"))) {
		return { mimeType: "image/gif", extension: "gif" }
	}
	if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") {
		return { mimeType: "image/webp", extension: "webp" }
	}
	return null
}

export default function createUploadsRouter(uploadsDir: string) {
	const router = Router()

	router.post("/uploads", (req: Request, res: Response, next: NextFunction) => {
		upload(req, res, async error => {
			if (error instanceof multer.MulterError) {
				const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400
				res.status(status).json({ error: error.message })
				return
			}
			if (error) {
				next(error)
				return
			}
			if (!req.file) {
				res.status(400).json({ error: "Image file is required" })
				return
			}

			const imageType = detectImageType(req.file.buffer)
			if (!imageType) {
				res.status(415).json({ error: "Unsupported image type" })
				return
			}

			try {
				await mkdir(uploadsDir, { recursive: true })
				const filename = `${randomUUID()}.${imageType.extension}`
				await writeFile(path.join(uploadsDir, filename), req.file.buffer)
				res.status(201).json({
					upload: {
						filename,
						url: `/uploads/${filename}`,
						mimeType: imageType.mimeType,
						size: req.file.size
					}
				})
			} catch (writeError) {
				next(writeError)
			}
		})
	})

	return router
}
