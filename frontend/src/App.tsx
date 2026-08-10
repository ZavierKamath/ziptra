import Header from "./components/Header.tsx"
import FilterBar from "./components/FilterBar.tsx"
import Board from "./components/Board.tsx"
import { useEffect } from "react"
import {
	createProjectAPI,
	getProjectsAPI,
	updateProjectAPI,
	deleteProjectAPI
} from "./api/projects.ts"
import {
	createTaskAPI,
	getTasksAPI,
	// updateTaskAPI,
	// deleteTaskAPI
} from "./api/tasks.ts"
import type {
	CreateProjectInput,
	UpdateProjectInput,
	CreateTaskInput,
	// UpdateTaskInput,
} from "../../backend/src/models.ts"

function App() {

	useEffect(() => {
		getProjectsAPI().catch(console.error)
		getTasksAPI().catch(console.error)
	}, [])

	function makeTestProject() {
		const testProject: CreateProjectInput = {
			title: "Test Title",
			description: "Test description.",
			status: "New"
		}

		createProjectAPI(testProject)
	}

	function updateTestProject() {
		const testProject: UpdateProjectInput = {
			projectId: "proj_93b1a575-afe5-43d1-96d6-91e30ba42195",
			title: "Updated Title",
			description: "Updated description.",
			status: "Active"
		}

		updateProjectAPI(testProject)
	}

	function deleteTestProject() {
		const projectIdToDelete: string = "proj_31b1292b-3328-40ce-bf9c-a6b9d5bad18f"
		const deletionPayload = { projectId: projectIdToDelete }
		deleteProjectAPI(deletionPayload)
	}

	function makeTestTask() {
		const testTask: CreateTaskInput = {
			title: "Test Title",
			projectId: "proj_7a66f6c1-6f6c-4a17-ba13-b3c5733153be",
			description: "Test description.",
			status: "New"
		}

		createTaskAPI(testTask)
	}

  return (
    <div>
			<Header />
			<div>
				<FilterBar />
				<Board />
				<button
					onClick={makeTestProject}
					className="cursor-pointer rounded border px-3 py-2"
				>
					Make Project
				</button>
				<button
					onClick={updateTestProject}
					className="cursor-pointer rounded border px-3 py-2"
				>
					Update Project
				</button>
				<button
					onClick={deleteTestProject}
					className="cursor-pointer rounded border px-3 py-2"
				>
					Delete Project
				</button>
				<button
					onClick={makeTestTask}
					className="cursor-pointer rounded border px-3 py-2"
				>
					Make Task
				</button>
			</div>
    </div>
  )
}

export default App
