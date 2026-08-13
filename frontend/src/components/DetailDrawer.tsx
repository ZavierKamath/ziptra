import type { Comment, Project, ProjectDetails, Task, TaskDetails } from "../types"
import MarkdownContent from "./MarkdownContent"
import CommentsSection from "./CommentsSection"

function shortId(id: string) { return id.split("_")[1]?.slice(0, 8) ?? id }

type Props = {
  type: "project" | "task"
  details: ProjectDetails | TaskDetails | null
  loading: boolean
  error: string
  projects: Project[]
  onClose: () => void
  onEdit: (entity: Project | Task) => void
  onDelete: (entity: Project | Task) => Promise<void>
  onOpenTask: (task: Task) => void
  onCreateComment: (content: string) => Promise<void>
  onUpdateComment: (comment: Comment, content: string) => Promise<void>
  onDeleteComment: (comment: Comment) => Promise<void>
}

export default function DetailDrawer(props: Props) {
  const { type, details, loading, error, projects, onClose } = props
  const entity = details ? (type === "project" ? (details as ProjectDetails).project : (details as TaskDetails).task) : undefined
  const comments = details ? (type === "project" ? (details as ProjectDetails).projectComments : (details as TaskDetails).comments) : []
  const task = type === "task" ? entity as Task | undefined : undefined
  const projectName = task?.projectId ? projects.find((project) => project.projectId === task.projectId)?.title : null

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="drawer">
        <button className="drawer-close" onClick={onClose} aria-label="Close details">×</button>
        {loading && <div className="drawer-state">Loading...</div>}
        {error && <div className="drawer-state error">{error}</div>}
        {entity && (
          <>
            <header className="detail-header">
              <span className="eyebrow">{type} / {shortId(type === "project" ? (entity as Project).projectId : (entity as Task).taskId)}</span>
              <h1>{entity.title}</h1>
              <div className="detail-meta"><span>{entity.status}</span>{task && <span>{projectName ?? "Standalone"}</span>}<time>Updated {new Date(entity.updatedAt).toLocaleDateString()}</time></div>
              <div className="detail-actions"><button className="secondary-button" onClick={() => props.onEdit(entity)}>Edit</button><button className="danger-button" onClick={() => {
                const warning = type === "project" ? "Delete this project? Its tasks will remain as standalone tasks." : "Delete this task and its comments?"
                if (window.confirm(warning)) void props.onDelete(entity)
              }}>Delete</button></div>
            </header>
            <section className="description"><div className="section-heading"><h3>Description</h3></div><MarkdownContent value={entity.description} /></section>
            {type === "project" && (
              <section className="related-tasks">
                <div className="section-heading"><h3>Tasks</h3><span>{(details as ProjectDetails).tasks.length}</span></div>
                {(details as ProjectDetails).tasks.map((relatedTask) => <button key={relatedTask.taskId} onClick={() => props.onOpenTask(relatedTask)}><span>{relatedTask.title}</span><small>{relatedTask.status}</small></button>)}
                {(details as ProjectDetails).tasks.length === 0 && <p className="muted-copy">No tasks in this project.</p>}
              </section>
            )}
            <CommentsSection comments={comments} onCreate={props.onCreateComment} onUpdate={props.onUpdateComment} onDelete={props.onDeleteComment} />
          </>
        )}
      </aside>
    </div>
  )
}
