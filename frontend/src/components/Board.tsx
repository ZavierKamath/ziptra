import type { BoardMode, Project, ProjectStatus, Task, TaskStatus } from "../types"

const tone: Record<string, string> = {
  New: "blue", Active: "green", Explore: "violet", Build: "amber", Validate: "cyan", Closed: "muted",
}

type Props = {
  mode: BoardMode
  items: Array<Project | Task>
  statuses: readonly (ProjectStatus | TaskStatus)[]
  projects: Project[]
  onOpen: (item: Project | Task) => void
  onMove: (item: Project | Task, status: string) => void
}

function plainPreview(value: string | null) {
  return value?.replace(/!\[[^\]]*\]\([^)]*\)|[#*_>`~[\]]/g, "").trim() ?? ""
}

export default function Board({ mode, items, statuses, projects, onOpen, onMove }: Props) {
  const projectNames = new Map(projects.map((project) => [project.projectId, project.title]))
  return (
    <main className="board">
      {statuses.map((status) => {
        const laneItems = items.filter((item) => item.status === status)
        return (
          <section className="lane" key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
            const id = event.dataTransfer.getData("text/plain")
            const item = items.find((candidate) => ("projectId" in candidate && mode === "projects" ? candidate.projectId : "taskId" in candidate ? candidate.taskId : "") === id)
            if (item && item.status !== status) onMove(item, status)
          }}>
            <header className="lane-header">
              <span><i className={`status-dot ${tone[status]}`} />{status}</span>
              <b>{laneItems.length.toString().padStart(2, "0")}</b>
            </header>
            <div className="lane-body">
              {laneItems.map((item) => {
                const isProject = mode === "projects" && "projectId" in item
                const id: string = isProject ? (item as Project).projectId : (item as Task).taskId
                const task = item as Task
                const taskProjectId = task.projectId
                return (
                  <article className="card" role="button" tabIndex={0} draggable key={id} onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", id)
                    event.dataTransfer.effectAllowed = "move"
                  }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpen(item) }} onClick={() => onOpen(item)}>
                    <h2>{item.title}</h2>
                    {plainPreview(item.description) && <p>{plainPreview(item.description)}</p>}
                    {!isProject && <div className="card-project">{taskProjectId ? projectNames.get(taskProjectId) ?? "Unknown project" : "Standalone"}</div>}
                    <time>{new Date(item.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
                  </article>
                )
              })}
              {laneItems.length === 0 && <div className="empty-lane">Drop here</div>}
            </div>
          </section>
        )
      })}
    </main>
  )
}
