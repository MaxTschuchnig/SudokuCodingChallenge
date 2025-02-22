import { createApp, ref, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js'

createApp({
  setup() {
    const sudokuGrid = ref([]) // Holds the 9×9 Sudoku grid
    const currentId = ref(0)
    let sudokudata = {}

    // Fetch the Sudoku puzzle from the server
    const fetchSudoku = async () => {
      try {
        const response = await fetch("/sudoku")
        const data = await response.json()
        sudokuGrid.value = data.masked // Store the fetched grid
        currentId.value = data.id
        sudokudata = data
      } catch (error) {
        console.error("Error fetching Sudoku:", error)
      }
    }

    // Check if a cell is prefilled (cannot be edited)
    const isPrefilled = (row, col) => sudokuGrid.value[row][col] !== 0

    // Handle user input in Sudoku cells
    const updateCell = (event, row, col) => {
      const value = parseInt(event.target.value) // Convert input to number
      if (isNaN(value) || value < 1 || value > 9) {
        event.target.value = "" // Clear invalid input
        return
      }
      sudokuGrid.value[row][col] = value // Update Vue state
      console.log(sudokuGrid.value)
    }

    const sendResults = () => {
      const solution = { data: [] }
      sudokudata.template = JSON.parse(JSON.stringify(sudokuGrid.value))
      solution.data.push(sudokudata)
      fetch('/validate-sudokus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(solution)
      })
        .then(res => res.json())
        .then(data => alert(data))
    }

    const ret = () => {
      window.location.href = '/hidden/sudoku.html'
    }

    // Fetch Sudoku when the component mounts
    onMounted(fetchSudoku)

    return { sudokuGrid, updateCell, isPrefilled, currentId, sendResults, ret }
  },
}).mount("#app")
