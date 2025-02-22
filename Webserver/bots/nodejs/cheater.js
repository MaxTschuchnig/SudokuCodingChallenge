const fetch = require('node-fetch')
const https = require('https')

const agent = new https.Agent({ rejectUnauthorized: false })

const ip = ''
const jwt = process.argv[2] || ''
if (!jwt) {
  console.error('JWT not provided!')
  process.exit(1)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function makeRequest() {
  try {
    const response = await fetch(`${ip}/sudoku`, {
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
    solution.data.push({
      id: parseInt(data.id, 10),
      template: data.template
    })

    console.log(`submitting: ${parseInt(data.id, 10)}`)
    const postResponse = await fetch(`${ip}/validate-sudokus`, {
      method: 'POST',
      headers: {
        Cookie: `auth=${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(solution),
      agent
    })

    // Check if the post request is successful
    if (!postResponse.ok) {
      const errorData = await postResponse.json()
      console.error(`Failed to validate sudoku: ${postResponse.statusText}. Error: ${JSON.stringify(errorData)}... retrying in 1 second...`)

      await delay(1000)

      const retryResponse = await fetch(`${ip}/validate-sudokus`, {
        method: 'POST',
        headers: {
          Cookie: `auth=${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(solution),
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
    console.error('Error during request:', error.message)
  }
}

setInterval(makeRequest, 1000)
