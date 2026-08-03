import Header from "./components/Header.tsx"
import FilterBar from "./components/FilterBar.tsx"
import Board from "./components/Board.tsx"

function App() {

  return (
    <div>
			<Header />
			<div>
				<FilterBar />
				<Board />
			</div>
    </div>
  )
}

export default App
