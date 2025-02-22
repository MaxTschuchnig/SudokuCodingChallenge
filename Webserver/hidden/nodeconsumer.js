const fetch = require('node-fetch')
const https = require('https')

const agent = new https.Agent({ rejectUnauthorized: false })

const ip = 'https://IP'

// you get a jwt from successful registration, followed by login. After logging in you will find under cookies, the auth cookie. Copy and paste its content in here
const jwt = ""

function solve(currentSudoku) {
  // represents logic to solve the sudoku
  const solved = currentSudoku
  return solved
}

async function makeRequest() {
  // get singular sudoku to solve
  const response = await fetch(`${ip}/sudoku`, { // Target URL to get sudokus
    method: 'GET',
    headers: {
      Cookie: `auth=${jwt}`
    },
    agent
  })
  // parse the data
  const data = await response.json()

  // TODO: generate a solution and put it into the right format
  let solution = { data: [] }
  solution.data.push({
    id: parseInt(data.id, 10),
    template: solve(data.masked) // TODO: add solution
  })

  // send back the solution
  const postResponse = await fetch(`${ip}/validate-sudokus`, { // Target URL to validate
    method: 'POST',
    headers: {
      Cookie: `auth=${jwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(solution),
    agent
  })
  const postData = await postResponse.json()
  console.log(postData)
}

makeRequest()
