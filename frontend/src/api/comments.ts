import { jsonRequest } from "./helpers"
import type { Comment, CreateCommentInput, UpdateCommentInput } from "../types"

export async function createCommentAPI(input: CreateCommentInput) {
  return (await jsonRequest<{ comment: Comment }>("/api/comments", "POST", input)).comment
}

export async function updateCommentAPI(input: UpdateCommentInput) {
  return (await jsonRequest<{ comment: Comment }>("/api/comments", "PUT", input)).comment
}

export function deleteCommentAPI(commentId: string) {
  return jsonRequest<{ commentId: string }>("/api/comments", "DELETE", { commentId })
}
