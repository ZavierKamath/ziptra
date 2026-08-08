import type { Comment } from "../models.ts"

export function getComments(): Comment[] {}
export function createComment(comment: Comment): Comment {}
export function updateComment(commentId: string, comment: Comment): Comment {}
export function deleteComment(commentId: string): string {}
