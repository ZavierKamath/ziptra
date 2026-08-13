import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Header from "./components/Header"
import FilterBar from "./components/FilterBar"
import Board from "./components/Board"
import EntityDialog from "./components/EntityDialog"
import DetailDrawer from "./components/DetailDrawer"
import { createProjectAPI, deleteProjectAPI, getProjectAPI, getProjectsAPI, updateProjectAPI } from "./api/projects"
import { createTaskAPI, deleteTaskAPI, getTaskAPI, getTasksAPI, updateTaskAPI } from "./api/tasks"
import { createCommentAPI, deleteCommentAPI, updateCommentAPI } from "./api/comments"
import { PROJECT_STATUSES, TASK_STATUSES, type BoardMode, type Comment, type Project, type ProjectDetails, type Selection, type Task, type TaskDetails } from "./types"

type DialogState = { mode: BoardMode; entity?: Project | Task } | null

function initialSelection(): Selection | null {
  const match = window.location.hash.match(/^#(project|task)=(.+)$/)
  return match ? { type: match[1] as "project" | "task", id: match[2] } : null
}

function selectionKey(selection: Selection) {
  return `${selection.type}:${selection.id}`
}

function closedSinceCutoff() {
  const cutoff = new Date()
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 4)
  return cutoff.toISOString()
}

export default function App() {
  const [mode, setMode] = useState<BoardMode>("projects")
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [query, setQuery] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")
  const [dialog, setDialog] = useState<DialogState>(null)
  const [selection, setSelection] = useState<Selection | null>(initialSelection)
  const [details, setDetails] = useState<ProjectDetails | TaskDetails | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const detailsCache = useRef(new Map<string, ProjectDetails | TaskDetails>())
  const detailRequestId = useRef(0)

  const loadBoard = useCallback(async () => {
    try {
      const cutoff = closedSinceCutoff()
      const [nextProjects, nextTasks] = await Promise.all([getProjectsAPI(cutoff), getTasksAPI(cutoff)])
      setProjects(nextProjects)
      setTasks(nextTasks)
      setNotice("")
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Could not load the board")
    } finally { setLoading(false) }
  }, [])

  const loadDetails = useCallback(async (selected: Selection, force = false) => {
    const requestId = ++detailRequestId.current
    const key = selectionKey(selected)
    const cached = detailsCache.current.get(key)
    if (cached && !force) {
      setDetailLoading(false)
      setDetailError("")
      setDetails(cached)
      return
    }

    setDetailLoading(true)
    setDetailError("")
    try {
      const loaded = selected.type === "project" ? await getProjectAPI(selected.id) : await getTaskAPI(selected.id)
      detailsCache.current.set(key, loaded)
      if (requestId === detailRequestId.current) setDetails(loaded)
    } catch (cause) {
      if (requestId === detailRequestId.current) {
        setDetailError(cause instanceof Error ? cause.message : "Could not load details")
      }
    } finally {
      if (requestId === detailRequestId.current) setDetailLoading(false)
    }
  }, [])

  useEffect(() => { void loadBoard() }, [loadBoard])
  useEffect(() => {
    if (selection) {
      window.history.replaceState(null, "", `#${selection.type}=${selection.id}`)
      void loadDetails(selection)
    } else {
      detailRequestId.current++
      setDetailLoading(false)
      setDetails(null)
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
    }
  }, [selection, loadDetails])

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const source: Array<Project | Task> = mode === "projects" ? projects : tasks
    return source.filter((item) => {
      const id = "taskId" in item ? item.taskId : item.projectId
      const matchesQuery = !needle || item.title.toLowerCase().includes(needle) || id.toLowerCase().includes(needle)
      const matchesProject = mode === "projects" || projectFilter === "all" || (projectFilter === "standalone" ? (item as Task).projectId === null : (item as Task).projectId === projectFilter)
      return matchesQuery && matchesProject
    })
  }, [mode, projects, tasks, query, projectFilter])

  function openEntity(item: Project | Task) {
    const isTask = "taskId" in item
    const nextSelection: Selection = { type: isTask ? "task" : "project", id: isTask ? item.taskId : item.projectId }
    const cached = detailsCache.current.get(selectionKey(nextSelection))
    setDetails(cached ?? (isTask
      ? { task: item as Task, comments: [] }
      : { project: item as Project, projectComments: [], tasks: tasks.filter((task) => task.projectId === item.projectId), taskComments: [] }))
    setSelection(nextSelection)
  }

  async function saveEntity(values: { title: string; description: string; status: string; projectId?: string | null }) {
    if (!dialog) return
    if (dialog.mode === "projects") {
      const entity = dialog.entity as Project | undefined
      if (entity) await updateProjectAPI({ projectId: entity.projectId, title: values.title, description: values.description, status: values.status as Project["status"] })
      else await createProjectAPI({ title: values.title, description: values.description, status: values.status as Project["status"] })
    } else {
      const entity = dialog.entity as Task | undefined
      const input = { title: values.title, description: values.description, status: values.status as Task["status"], projectId: values.projectId ?? null }
      if (entity) await updateTaskAPI({ taskId: entity.taskId, ...input })
      else await createTaskAPI(input)
    }
    await loadBoard()
    if (selection) await loadDetails(selection, true)
  }

  async function moveEntity(item: Project | Task, status: string) {
    setNotice("")
    if ("taskId" in item) setTasks((current) => current.map((task) => task.taskId === item.taskId ? { ...task, status: status as Task["status"] } : task))
    else setProjects((current) => current.map((project) => project.projectId === item.projectId ? { ...project, status: status as Project["status"] } : project))
    try {
      if ("taskId" in item) await updateTaskAPI({ taskId: item.taskId, status: status as Task["status"] })
      else await updateProjectAPI({ projectId: item.projectId, status: status as Project["status"] })
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Could not move card")
    } finally { await loadBoard() }
  }

  async function deleteEntity(entity: Project | Task) {
    if ("taskId" in entity) await deleteTaskAPI(entity.taskId)
    else await deleteProjectAPI(entity.projectId)
    setSelection(null)
    await loadBoard()
  }

  async function mutateComment(action: () => Promise<unknown>) {
    await action()
    if (selection) await loadDetails(selection, true)
  }

  const selectedType = selection?.type ?? "project"
  return (
    <div className="app-shell">
      <Header mode={mode} onMode={(next) => { setMode(next); setQuery("") }} onCreate={() => setDialog({ mode })} />
      <div className="workspace">
        <div className="board-title"><div><span className="eyebrow">Workspace / {mode}</span><h1>{mode === "projects" ? "Project board" : "Task board"}</h1></div><span>{visibleItems.length} cards</span></div>
        <FilterBar mode={mode} query={query} projectFilter={projectFilter} projects={projects} onQuery={setQuery} onProjectFilter={setProjectFilter} />
        {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}
        {loading ? <div className="loading-state">Loading board...</div> : <Board mode={mode} items={visibleItems} statuses={mode === "projects" ? PROJECT_STATUSES : TASK_STATUSES} projects={projects} onOpen={openEntity} onMove={(item, status) => void moveEntity(item, status)} />}
      </div>
      {dialog && <EntityDialog key={`${dialog.mode}-${dialog.entity ? ("taskId" in dialog.entity ? dialog.entity.taskId : dialog.entity.projectId) : "new"}`} mode={dialog.mode} entity={dialog.entity} projects={projects} onClose={() => setDialog(null)} onSave={saveEntity} />}
      {selection && <DetailDrawer type={selectedType} details={details} loading={detailLoading} error={detailError} projects={projects} onClose={() => setSelection(null)} onEdit={(entity) => setDialog({ mode: "taskId" in entity ? "tasks" : "projects", entity })} onDelete={deleteEntity} onOpenTask={openEntity} onCreateComment={(content) => mutateComment(() => createCommentAPI({ [selectedType === "project" ? "projectId" : "taskId"]: selection.id, content }))} onUpdateComment={(comment: Comment, content) => mutateComment(() => updateCommentAPI({ commentId: comment.commentId, [selectedType === "project" ? "projectId" : "taskId"]: selection.id, content }))} onDeleteComment={(comment) => mutateComment(() => deleteCommentAPI(comment.commentId))} />}
    </div>
  )
}
