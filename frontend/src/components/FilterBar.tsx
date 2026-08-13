import type { BoardMode, Project } from "../types"

type Props = {
  mode: BoardMode
  query: string
  projectFilter: string
  projects: Project[]
  onQuery: (value: string) => void
  onProjectFilter: (value: string) => void
}

export default function FilterBar({ mode, query, projectFilter, projects, onQuery, onProjectFilter }: Props) {
  return (
    <div className="filter-bar">
      <label className="search-box">
        <span>⌕</span>
        <input name="search" aria-label={`Filter ${mode}`} value={query} onChange={(event) => onQuery(event.target.value)} placeholder={`Filter ${mode} by title or ID`} />
      </label>
      {mode === "tasks" && (
        <select name="projectFilter" value={projectFilter} onChange={(event) => onProjectFilter(event.target.value)} aria-label="Filter tasks by project">
          <option value="all">All projects</option>
          <option value="standalone">Standalone</option>
          {projects.map((project) => <option value={project.projectId} key={project.projectId}>{project.title}</option>)}
        </select>
      )}
    </div>
  )
}
