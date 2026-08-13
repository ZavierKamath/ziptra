import { useState } from "react"
import type { Comment } from "../types"
import MarkdownContent from "./MarkdownContent"
import MarkdownEditor from "./MarkdownEditor"

type Props = {
  comments: Comment[]
  onCreate: (content: string) => Promise<void>
  onUpdate: (comment: Comment, content: string) => Promise<void>
  onDelete: (comment: Comment) => Promise<void>
}

export default function CommentsSection({ comments, onCreate, onUpdate, onDelete }: Props) {
  const [draft, setDraft] = useState("")
  const [editing, setEditing] = useState<Comment | null>(null)
  const [editValue, setEditValue] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError("")
    try { await action() } catch (cause) { setError(cause instanceof Error ? cause.message : "Comment action failed") } finally { setBusy(false) }
  }

  return (
    <section className="comments">
      <div className="section-heading"><h3>Comments</h3><span>{comments.length}</span></div>
      <div className="comment-list">
        {comments.map((comment) => editing?.commentId === comment.commentId ? (
          <div className="comment editing" key={comment.commentId}>
            <MarkdownEditor value={editValue} onChange={setEditValue} rows={4} />
            <div className="comment-actions"><button onClick={() => setEditing(null)}>Cancel</button><button disabled={busy} onClick={() => void run(async () => { await onUpdate(comment, editValue); setEditing(null) })}>Save</button></div>
          </div>
        ) : (
          <article className="comment" key={comment.commentId}>
            <MarkdownContent value={comment.content} empty="Empty comment" />
            <footer><time>{new Date(comment.createdAt).toLocaleString()}</time><div><button onClick={() => { setEditing(comment); setEditValue(comment.content) }}>Edit</button><button onClick={() => { if (window.confirm("Delete this comment?")) void run(() => onDelete(comment)) }}>Delete</button></div></footer>
          </article>
        ))}
        {comments.length === 0 && <p className="muted-copy">No comments yet.</p>}
      </div>
      <div className="comment-composer">
        <MarkdownEditor value={draft} onChange={setDraft} rows={4} placeholder="Add a comment..." />
        <button className="primary-button" disabled={busy || !draft.trim()} onClick={() => void run(async () => { await onCreate(draft); setDraft("") })}>Comment</button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </section>
  )
}
