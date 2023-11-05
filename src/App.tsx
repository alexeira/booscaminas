import { useRef, useState } from 'react'

type Matrix = (number | string)[][]
type GameStatus = 'start' | 'playing' | 'win' | 'over'

const BOMB_COUNT = 8
const GRID_SIZE = 8
const CELL_CONTENT = 0
const MATCHES = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
]

// generar la grilla con 0s
const MATRIX: Matrix = Array.from({ length: GRID_SIZE }, () =>
  Array.from({ length: GRID_SIZE }, () => CELL_CONTENT)
)

export const App = () => {
  const [clicked, setClicked] = useState<string[]>([])
  const [gameStatus, setGameStatus] = useState<GameStatus>('start')
  const firstClick = useRef(true)

  // crea bombas en posiciones aleatorias a partir de bomb_count
  function generateBombs(rowIndex: number, cellIndex: number) {
    for (let count = 0; count < BOMB_COUNT; ) {
      const randomRow = Math.floor(Math.random() * GRID_SIZE)
      const randomCell = Math.floor(Math.random() * GRID_SIZE)
      const clickedPos = MATRIX[rowIndex][cellIndex]

      if (randomRow === rowIndex && randomCell === cellIndex) continue

      if (MATRIX[randomRow][randomCell] !== 'B') {
        MATRIX[randomRow][randomCell] = 'B'
        count++
      }
    }
    console.log('generated bombs')
    console.log(MATRIX)
  }

  // cuenta la cantidad de bombas alrededor de una casilla
  function countBombs() {
    for (let rowIndex = 0; rowIndex < MATRIX.length; rowIndex++) {
      for (let cellIndex = 0; cellIndex < MATRIX[rowIndex].length; cellIndex++) {
        let bombCount = 0

        if (MATRIX[rowIndex][cellIndex] === 'B') continue

        for (const match of MATCHES) {
          if (MATRIX[rowIndex + match[0]]?.[cellIndex + match[1]] === 'B') {
            bombCount++
          }
        }

        MATRIX[rowIndex][cellIndex] = bombCount
      }
    }
    console.log('counted bombs')
  }

  // abrir celdas aledañas que esten vacias
  function openAdjacentCells(row: number, cell: number, visited: Set<string>) {
    const queue: [number, number][] = [[row, cell]]

    while (queue.length > 0) {
      const [currentRow, currentCell] = queue.shift()!

      for (const match of MATCHES) {
        const newRow = currentRow + match[0]
        const newCell = currentCell + match[1]
        const cellKey = `${newRow}-${newCell}`

        if (
          visited.has(cellKey) ||
          MATRIX[newRow]?.[newCell] === undefined ||
          MATRIX[newRow][newCell] === 'B'
        ) {
          continue
        }

        visited.add(cellKey)
        setClicked(prevClicked => prevClicked.concat(cellKey))

        if (MATRIX[newRow][newCell] === 0) {
          queue.push([newRow, newCell])
        }
      }
    }
    console.log('open cells')
  }

  function handleClick(rowIndex: number, cellIndex: number) {
    const cellKey = `${rowIndex}-${cellIndex}`

    if (clicked.includes(cellKey)) {
      return
    }

    if (MATRIX[rowIndex][cellIndex] === 'B') {
      setGameStatus('over')
    } else {
      const visited = new Set([cellKey])

      setClicked(prevClicked => prevClicked.concat(cellKey))

      if (MATRIX[rowIndex][cellIndex] === 0) {
        openAdjacentCells(rowIndex, cellIndex, visited)
      }

      if (clicked.length + 1 === GRID_SIZE ** 2 - BOMB_COUNT) {
        setGameStatus('win')
      }
    }
  }

  // genera bombas, las cuenta y luego abre las casillas aledañas
  function initialClick(isFirstClick: boolean, rowIndex: number, cellIndex: number) {
    if (isFirstClick) {
      generateBombs(rowIndex, cellIndex)
      countBombs()
      firstClick.current = false
      handleClick(rowIndex, cellIndex)
    }
  }

  function playAgain() {
    window.location.reload()
  }

  return (
    <main className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] px-4">
      <header className="text-xl font-bold leading-[3rem]">booscaminas 👻</header>
      <section className="py-8">
        {gameStatus === 'start' && (
          <button className="border bg-green-700 p-2" onClick={() => setGameStatus('playing')}>
            Start Game
          </button>
        )}
        {gameStatus === 'playing' &&
          MATRIX.map((row, rowIndex) => (
            <section key={String(rowIndex)} className="grid grid-cols-9 w-fit">
              {row.map((cell, cellIndex) => (
                <div
                  key={`${rowIndex}-${cellIndex}`}
                  className={`border w-12 h-12 grid place-items-center ${
                    clicked.includes(`${rowIndex}-${cellIndex}`) ? 'bg-white/10' : 'bg-transparent'
                  }`}
                >
                  {clicked.includes(`${rowIndex}-${cellIndex}`) ? (
                    <span>{cell === 'B' ? '🎃' : cell === 0 ? null : cell}</span>
                  ) : (
                    <button
                      className="w-full h-full"
                      type="button"
                      onClick={() =>
                        gameStatus === 'playing' && !firstClick.current
                          ? handleClick(rowIndex, cellIndex)
                          : initialClick(firstClick.current, rowIndex, cellIndex)
                      }
                    />
                  )}
                </div>
              ))}
            </section>
          ))}
        {gameStatus === 'over' && (
          <section>
            <p>You lost :(</p>
            <button className="border p-2 bg-blue-700" onClick={playAgain}>
              Play Again
            </button>
          </section>
        )}
        {gameStatus === 'win' && (
          <section>
            <p>You win :)</p>
            <button className="border p-2 bg-yellow-500" onClick={playAgain}>
              Play Again
            </button>
          </section>
        )}
      </section>
      <footer className="text-center leading-[3rem] opacity-70">
        © {new Date().getFullYear()} booscaminas
      </footer>
    </main>
  )
}
