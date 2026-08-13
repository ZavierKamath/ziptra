import type {
	CommentRow,
	CreateCommentInput,
	UpdateCommentInput
} from "../models.ts"
import { comments } from "../database/schema.ts"
import { AppDB } from "../database/db.ts"
import { eq } from "drizzle-orm"

export function getComments(db: AppDB): CommentRow[] {
	const foundComments: CommentRow[] = db.select()
		.from(comments)
		.all()

	return foundComments
}

export function createComment(db: AppDB, input: CreateCommentInput): CommentRow {
	if (!input.taskId && !input.projectId) {
		throw new Error("Cannot create comment with no taskId or projectId")
	}
	const nowString: string = new Date().toISOString()

	const commentRowToInsert: CommentRow = {
		commentId: `comment_${crypto.randomUUID()}`,
		taskId: input.taskId || null,
		projectId: input.projectId || null,
		createdAt: nowString,
		updatedAt: nowString,
		content: input.content
	}

	const newCommentRow: CommentRow = db.insert(comments)
		.values(commentRowToInsert)
		.returning()
		.get()

	return newCommentRow
}

export function updateComment(db: AppDB, input: UpdateCommentInput): CommentRow {
	if (!input.commentId.startsWith("comment_")) {
		throw new Error(
			`Error in updateComment: CommentRow ID does not start with "comment_", it is ${input.commentId}
		`)
	}

	const commentRowToUpdate: CommentRow | undefined = db.select()
		.from(comments)
		.where(eq(comments.commentId, input.commentId))
		.get()

	if (!commentRowToUpdate) {
		throw new Error(`Error in updateComment: No CommentRow with ID = ${input.commentId}`)
	}

	const nowString: string = new Date().toISOString()

	const commentRowToInsert: CommentRow = {
		commentId: commentRowToUpdate.commentId,
		taskId: input.taskId || commentRowToUpdate.taskId,
		projectId: input.projectId || commentRowToUpdate.projectId,
		createdAt: commentRowToUpdate.createdAt,
		updatedAt: nowString,
		content: input.content ?? commentRowToUpdate.content
	}

	const updatedCommentRow: CommentRow = db.update(comments)
		.set(commentRowToInsert)
		.where(eq(comments.commentId, input.commentId))
		.returning()
		.get()

	return updatedCommentRow
}

export function deleteComment(db: AppDB, commentId: string): string {
	if (!commentId.startsWith("comment_")) {
		throw new Error(
			`Error in deleteComment: commentId does not start with "comment_", it is ${commentId}
		`)
	}

	const deletedComment = db.delete(comments)
		.where(eq(comments.commentId, commentId))
		.returning({ deletedCommentId: comments.commentId })
		.get()

	if (!deletedComment) {
		throw new Error(`Error in deleteComment: No CommentRow with ID = ${commentId}`)
	}

	return deletedComment.deletedCommentId
}
