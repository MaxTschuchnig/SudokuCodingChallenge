const fs = require('fs')
const crypto = require('crypto')

const dbhelper = require('./db')

const datafolder = './data'
// const datafolder = '/home/max/builds/data'
const minAmount = 100000 // 100k
const maxSudokusPerUser = 500 // 200
const maxHashesPerUser = 5 // 200

const sudokutimeout = 60 * 5 * 1000 // 60s * 5 = 5 min // 1000 for millis

let sudokus = []
let cSolvingSudokus = []
let cSolvingHashes = []

function printAmountSudokus() {
  console.log(sudokus.length)
}

// every 5 seconds
function startLoading() {
  console.log(`Looking for data in directory ${datafolder}`)
  setInterval(() => {
    if (sudokus.length < minAmount) { // check if the min amount of sudokus is loaded
      fs.stat(datafolder, (err, stats) => { // if it isn't, check if the data folder exists
        if (err) {
          console.error(err)
          return
        }

        fs.readdir(datafolder, (err, data) => { // if it does, check what files are in the folder
          if (err) {
            console.error(err)
            return
          }

          if (data.length > 0) { // if there is at least one file in the folder, load it
            let rngNumber = Math.floor(Math.random() * data.length)
            fs.readFile(`${datafolder}/${data[rngNumber]}`, (err, fileData) => {
              if (err) {
                console.error(err)
                return
              }

              try {
                sudokus = sudokus.concat(JSON.parse(fileData)) // parse it into json

                fs.unlink(`${datafolder}/${data[rngNumber]}`, (err) => { // and delete the file
                  if (err) {
                    console.error(`failed to delete file: ${datafolder}/${data[rngNumber]}`, err)
                  } else {
                    console.log(`loaded and deleted file: ${datafolder}/${data[rngNumber]}. currently there are ${sudokus.length} loaded`)
                  }
                })
              } catch (error) {
                console.error(`Error on parsing newly loaded sudokus: ${error}. Filedata: ${fileData}`)
              }
            })
          }
        })
      })
    }
  }, 250) // all 5s check if there are enough sudokus loaded. if not, load new ones
}

function checkSudokuTimeouts() {
  setInterval(async () => {
    const currentTime = Date.now()
    const timedOutSudokus = cSolvingSudokus.filter(citem => currentTime > citem.timestamp + sudokutimeout) // get timed out sudokus
    const timedOutHashes = cSolvingHashes.filter(citem => currentTime > citem.timestamp + sudokutimeout) // get timed out sudokus
    console.log(`current timed (sudokus) out to be deleted: ${timedOutSudokus.length}. Current sudokus list: ${cSolvingSudokus.length}`)
    console.log(`current timed (hashes) out to be deleted: ${timedOutHashes.length}. Current hashes list: ${cSolvingHashes.length}`)
    if (timedOutSudokus.length > 0) { // if we have timed out, remove them from global lists
      cSolvingSudokus = cSolvingSudokus.filter(citem => !timedOutSudokus.some(timedOut => timedOut.id === citem.id))
    }
    if (timedOutHashes.length > 0) { // if we have timed out, remove them from global lists
      cSolvingHashes = timedOutHashes.filter(citem => !timedOutHashes.some(timedOut => timedOut.id === citem.id))
    }
  }, sudokutimeout)
}

function getSingleSudoku(userIdentifier) {
  const token = userIdentifier.split('___')[0]

  if (cSolvingSudokus.filter(citem => citem._id === token).length > maxSudokusPerUser) { // do not allow a single user to work on too many sudokus at a time
    throw new Error(JSON.stringify({ msg: 'user already has too many sudokus currently being solved (wait for expiration: 5min for reserved sudoku)' }))
  }

  if (sudokus.length > 0) { // If sudokus are not empty
    const tmpsudoku = sudokus.shift() // return first and remove first
    cSolvingSudokus.push({ sudokus: JSON.parse(JSON.stringify(tmpsudoku)), timestamp: Date.now(), userIdentifier: token }) // add to c solving
    tmpsudoku.template = tmpsudoku.masked
    return tmpsudoku
  }
  throw new Error(JSON.stringify({ msg: 'please wait for more sudokus to be generated' }))
}

function getMultipleSudokus(userIdentifier, bulklimit) {
  const token = userIdentifier.split('___')[0]

  if (cSolvingSudokus.filter(citem => citem.useridentifier === token).length + bulklimit > maxSudokusPerUser) { // do not allow a single user to work on too many sudokus at a time
    throw new Error(JSON.stringify({ msg: 'user already has too many sudokus currently being solved (wait for expiration: 5min for reserved sudoku)' }))
  }

  if (sudokus.length > bulklimit) { // If there are enough sudokus loaded, return them
    const batch = sudokus.slice(0, bulklimit) // get bulk
    sudokus.splice(0, bulklimit) // remove bulk

    batch.forEach(item => {
      cSolvingSudokus.push({ sudokus: JSON.parse(JSON.stringify(item)), timestamp: Date.now(), useridentifier: token }) // add to c solving
      item.template = item.masked
    })

    return batch
  }
  throw new Error(JSON.stringify({ msg: 'please wait for more sudokus to be generated' }))
}

function getMultipleSudokusHashed(userIdentifier, bulklimit) {
  const token = userIdentifier.split('___')[0]

  if (sudokus.length > bulklimit) { // If there are enough sudokus loaded, return them
    const batch = sudokus.slice(0, bulklimit) // get bulk
    sudokus.splice(0, bulklimit) // remove bulk

    const datatohash = {
      data: batch.map(({ masked, ...rest }) => rest)
    }
    const hash = crypto
      .createHash('sha1')
      .update(JSON.stringify(datatohash))
      .digest('hex')

    const newsolves = {
      id: batch[0].id,
      hash,
      amount: bulklimit
    }
    cSolvingHashes.push(newsolves)

    return batch
  }
  throw new Error(JSON.stringify({ msg: 'please wait for more sudokus to be generated' }))
}

async function checkSingleSudoku(userIdentifier, csudoku, userCollection) {
  const token = userIdentifier.split('___')[0]
  const user = await dbhelper.getUserFromUserId(token) // find the current user
  if (!user) {
    throw new Error(JSON.stringify({ msg: 'user does not exists' }))
  }

  // check if sudoku is in currently solving list and obtain the solution
  const foundSolution = cSolvingSudokus.find(citem => citem.sudokus.id === csudoku.id)
  if (!foundSolution) {
    throw new Error(JSON.stringify({ msg: `Sudoku ${csudoku.id} not found in the currently solving list. If your code is very quick, it might not have made it into RAM, maybe retry. Also, your format might have an error or the sudoku is out of date` }))
  }

  if (sudokuCompare(csudoku.template, foundSolution.sudokus.template)) { // check if mask checks out
    const s = await dbhelper.getSTime()
    const q = await dbhelper.getQTime()
    const solvedIndex = Math.floor((Date.now() - s.starttime) / q.qtime)

    user.solved[solvedIndex].count++ // add solved sudoku to user quantization
    user.numberSolved++

    await Promise.all([
      dbhelper.persistUserSolved(token, user, userCollection).catch(err => console.error('Error updating user:', err)),
      dbhelper.persistNewlySolved(solvedIndex)
    ])

    // filter out the id
    cSolvingSudokus = await cSolvingSudokus.filter(citem => citem.sudokus.id !== foundSolution.sudokus.id)

    return 'correct'
  }
  return 'wrong solution'
}

async function checkSudokuHashes(userIdentifier, hash, res) {
  const collections = await dbhelper.getPersistCollections() // reduce amount of needed await collection calls (especially for bulk)
  try {
    const results = await checkSudokuHashesWorker(userIdentifier, hash, collections.userCollection)
    return res.status(200).json(results)
  } catch (error) {
    return res.status(409).json({ msg: error.message })
  }
}

async function checkSudokuHashesWorker(userIdentifier, hash, userCollection) {
  const token = userIdentifier.split('___')[0]
  const user = await dbhelper.getUserFromUserId(token) // find the current user
  if (!user) {
    throw new Error(JSON.stringify({ msg: 'user does not exists' }))
  }

  // check if sudoku is in currently in hash list and get hash
  const foundHash = cSolvingHashes.find(citem => citem.hash === hash)
  if (!foundHash) {
    throw new Error(JSON.stringify({ msg: `Hash ${hash} not found in the current hash list.` }))
  }

  if (sudokuCompare(hash, foundHash.hash)) { // check if mask checks out
    const s = await dbhelper.getSTime()
    const q = await dbhelper.getQTime()
    const solvedIndex = Math.floor((Date.now() - s.starttime) / q.qtime)

    user.solved[solvedIndex].count = user.solved[solvedIndex].count + foundHash.amount // add solved sudoku to user quantization
    user.numberSolved = user.numberSolved + foundHash.amount

    await Promise.all([
      dbhelper.persistUserSolved(token, user, userCollection).catch(err => console.error('Error updating user:', err)),
      dbhelper.persistNewlySolved(solvedIndex)
    ])

    // filter out the id
    cSolvingHashes = await cSolvingHashes.filter(citem => citem.id !== foundHash.id)

    return 'correct'
  }
  return 'wrong solution'
}

function sudokuCompare(s1, s2) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (s1[i][j] !== s2[i][j]) {
        return false
      }
    }
  }
  return true // all match
}

async function checkSudokus(userIdentifier, allSudoku, res) {
  const collections = await dbhelper.getPersistCollections() // reduce amount of needed await collection calls (especially for bulk)
  try {
    const results = []
    for (const cSudoku of allSudoku) {
      results.push(await checkSingleSudoku(userIdentifier, cSudoku, collections.userCollection, collections.solvedCollection))
    }
    return res.status(200).json(results)
  } catch (error) {
    return res.status(409).json({ msg: error.message })
  }
}

async function getSolved(req, res) {
  const token = req.cookies.auth.split('___')[0]
  await dbhelper.getUserSolved(res, token)
}

async function getAllSolved(res) {
  await dbhelper.getAllSolved(res)
}

module.exports = {
  get bestUsers () {
    return dbhelper.bestUsers
  },
  get previouslyBest () {
    return dbhelper.previouslyBest
  },

  getSolved,
  getAllSolved,
  startLoading,
  checkSudokus,
  getSingleSudoku,
  printAmountSudokus,
  getMultipleSudokus,
  getMultipleSudokusHashed,
  checkSudokuTimeouts,
  checkSudokuHashes
}
