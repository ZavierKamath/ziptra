import { useState, type FormEvent } from "react"
import MarkdownEditor from "./MarkdownEditor"
import { PROJECT_STATUSES, TASK_STATUSES, type BoardMode, type Project, type Task } from "../types"

type Values = { title: string; description: string; status: string; projectId?: string | null }
type Props = {
  mode: BoardMode
  entity?: Project | Task
  projects: Project[]
  onClose: () => void
  onSave: (values: Values) => Promise<void>
}

export default function EntityDialog({ mode, entity, projects, onClose, onSave }: Props) {
  const task = mode === "tasks" ? entity as Task | undefined : undefined
  const [title, setTitle] = useState(entity?.title ?? "")
  const [description, setDescription] = useState(entity?.description ?? "")
  const [status, setStatus] = useState<string>(entity?.status ?? "New")
  const [projectId, setProjectId] = useState(task?.projectId ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return setError("Title is required")
    setSaving(true)
    setError("")
    try {
      await onSave({ title: title.trim(), description, status, ...(mode === "tasks" ? { projectId: projectId || null } : {}) })
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <form className="modal" role="dialog" aria-modal="true" aria-label={`${entity ? "Edit" : "Create"} ${mode === "projects" ? "project" : "task"}`} onSubmit={submit}>
        <header><div><span className="eyebrow">{entity ? "Edit" : "Create"}</span><h2>{mode === "projects" ? "Project" : "Task"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button></header>
        <label>Title<input name="title" autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to happen?" /></label>
        <div className="form-row">
          <label>Status<select name="status" value={status} onChange={(event) => setStatus(event.target.value)}>{(mode === "projects" ? PROJECT_STATUSES : TASK_STATUSES).map((value) => <option key={value}>{value}</option>)}</select></label>
          {mode === "tasks" && <label>Project<select name="projectId" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Standalone</option>{projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.title}</option>)}</select></label>}
        </div>
        <div className="field"><div className="field-label">Description <span className="label-hint">Markdown</span></div><MarkdownEditor value={description} onChange={setDescription} /></div>
        {error && <p className="form-error">{error}</p>}
        <footer><button type="button" className="text-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save"}</button></footer>
      </form>
    </div>
  )
}
