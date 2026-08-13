import type { BoardMode } from "../types"

type Props = { mode: BoardMode; onMode: (mode: BoardMode) => void; onCreate: () => void }

export default function Header({ mode, onMode, onCreate }: Props) {
  return (
    <header className="app-header">
      <button className="brand" onClick={() => onMode("projects")} aria-label="Ziptra home">
        <span className="brand-mark"><i /><i /><i /></span>ziptra
      </button>
      <nav className="view-switch" aria-label="Board view">
        <button className={mode === "projects" ? "active" : ""} onClick={() => onMode("projects")}>Projects</button>
        <span>/</span>
        <button className={mode === "tasks" ? "active" : ""} onClick={() => onMode("tasks")}>Tasks</button>
      </nav>
      <button className="primary-button" onClick={onCreate}>+ New {mode === "projects" ? "project" : "task"}</button>
    </header>
  )
}
