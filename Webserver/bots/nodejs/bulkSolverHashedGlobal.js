const fetch = require('node-fetch')
const https = require('https')

const agent = new https.Agent({ rejectUnauthorized: false })

const crypto = require('crypto')
const ip = ''
const jwt = process.argv[2] || ''
if (!jwt) {
  console.error('JWT not provided!')
  process.exit(1)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function uniqueInRow(sudoku, row, number) {
  for (let cCol = 0; cCol < 9; cCol++) {
    if (sudoku[row][cCol] === number) {
      return false
    }
  }
  return true
}

function uniqueInCol(sudoku, col, number) {
  for (let cRow = 0; cRow < 9; cRow++) {
    if (sudoku[cRow][col] === number) {
      return false
    }
  }
  return true
}

function uniqueInBlock(sudoku, row, col, number) {
  const startrow = Math.floor(row / 3) * 3
  const startcol = Math.floor(col / 3) * 3
  for (let cRow = startrow; cRow < startrow + 3; cRow++) {
    for (let cCol = startcol; cCol < startcol + 3; cCol++) {
      if (sudoku[cRow][cCol] === number) {
        return false
      }
    }
  }
  return true
}

function solve(unfinishedSudoku, row, col) {
  if (row === 9) {
    return true // we are done
  }

  if (col === 9) {
    return solve(unfinishedSudoku, row + 1, 0)
  }

  // if already set, skip to next col
  if (unfinishedSudoku[row][col] > 0) {
    return solve(unfinishedSudoku, row, col + 1)
  }

  // else we try to fill a random number
  for (let cNumber = 1; cNumber <= 9; ++cNumber) {
    // if number is already in row, try another number
    if (!uniqueInRow(unfinishedSudoku, row, cNumber)) {
      continue
    }

    // if number is already in col, try another number
    if (!uniqueInCol(unfinishedSudoku, col, cNumber)) {
      continue
    }

    // check if number is already in block
    if (!uniqueInBlock(unfinishedSudoku, row, col, cNumber)) {
      continue
    }

    // if this works, set and proceed with solving
    unfinishedSudoku[row][col] = cNumber

    // check if the rest can be solved
    if (solve(unfinishedSudoku, row, col + 1)) {
      return true
    }

    // else, rest back to 0 and solve again
    unfinishedSudoku[row][col] = 0
  }
  return false
}

async function makeRequest() {
  try {
    const response = await fetch(`${ip}/hashsudokus`, {
      method: 'GET',
      headers: {
        Cookie: `auth=${jwt}`
      },
      agent
    })

    // If the fetch response is not OK, throw an error
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to fetch sudoku: ${response.statusText}. Error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    let solution = { data: [] }
    for (let cData of data) {
      solve(cData.masked, 0, 0)
      solution.data.push({
        id: parseInt(cData.id, 10),
        template: cData.masked
      })
    }

    const hash = crypto
      .createHash('sha1')
      .update(JSON.stringify(solution))
      .digest('hex')

    const postResponse = await fetch(`${ip}/validate-sudokus-hash`, {
      method: 'POST',
      headers: {
        Cookie: `auth=${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: hash }),
      agent
    })

    // Check if the post request is successful
    if (!postResponse.ok) {
      const errorData = await postResponse.json()
      console.error(`Failed to validate sudoku: ${postResponse.statusText}. Error: ${JSON.stringify(errorData)}... retrying in 1 second...`)

      await delay(1000)

      const retryResponse = await fetch(`${ip}/validate-sudokus-hash`, {
        method: 'POST',
        headers: {
          Cookie: `auth=${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hash),
        agent
      })

      if (!retryResponse.ok) {
        const retryErrorData = await retryResponse.json()
        throw new Error(`Failed to validate sudoku after retry: ${retryResponse.statusText}. Error: ${JSON.stringify(retryErrorData)}`)
      }

      const retryData = await retryResponse.json()
      console.log('Retry success:', retryData)
    } else {
      const postData = await postResponse.json()
      console.log(postData)
    }
  } catch (error) {
    throw new Error('Error during request:', error)
  }
}

(async function runForever() {
  while (true) {
    try {
      await makeRequest()
      await delay(10) // wait 10 millis at least
    } catch (error) {
      console.error(error)
      await delay(1000 * 10)
    }
  }
})()
