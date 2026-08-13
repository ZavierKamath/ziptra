export const PROJECT_STATUSES = ["New", "Active", "Closed"] as const
export const TASK_STATUSES = ["New", "Explore", "Build", "Validate", "Closed"] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type BoardMode = "projects" | "tasks"

export type Project = {
  projectId: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
  status: ProjectStatus
}

export type Task = {
  taskId: string
  projectId: string | null
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
  status: TaskStatus
}

export type Comment = {
  commentId: string
  taskId: string | null
  projectId: string | null
  content: string
  createdAt: string
  updatedAt: string
}

export type ProjectDetails = {
  project: Project
  projectComments: Comment[]
  tasks: Task[]
  taskComments: Comment[]
}

export type TaskDetails = { task: Task; comments: Comment[] }

export type CreateProjectInput = Pick<Project, "title" | "status"> & { description?: string }
export type UpdateProjectInput = Partial<CreateProjectInput> & { projectId: string }
export type CreateTaskInput = Pick<Task, "title" | "status"> & { projectId?: string | null; description?: string }
export type UpdateTaskInput = Partial<CreateTaskInput> & { taskId: string }
export type CreateCommentInput = { taskId?: string; projectId?: string; content: string }
export type UpdateCommentInput = CreateCommentInput & { commentId: string }

export type Selection = { type: "project"; id: string } | { type: "task"; id: string }
