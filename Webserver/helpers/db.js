const mongodb = require('mongodb')

const mongoUrl = 'mongodb://127.0.0.1:27017'
const client = new mongodb.MongoClient(mongoUrl, {
  serverApi: {
    version: mongodb.ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

let bestUsers = []
let previouslyBest = []
let allSolved = []
let stime
let etime
let qtime

let db
let users
let solved
let startTimestamp
let endTimestamp
let quantizationTimestamp
client.connect().then(() => {
  db = client.db('sudoku')
  console.log('connected to mongodb')

  sortBestUsers() // sort user once (resort after server breakdown)
  loadAllSolutions()
}).catch((err) => {
  console.error('failed to connect to mongodb', err)
})

setInterval(() => sortBestUsers(), 1000 * 60 * 1) // sort every minute
setInterval(() => loadAllSolutions(), 1000 * 60 * 1) // sort all minute

async function getUsersCollection() {
  if (!users) {
    if (!db) {
      db = await client.db('sudoku')
    }
    users = await db.collection('users')
  }
  return users
}

async function getSolvedCollection() {
  if (!solved) {
    if (!db) {
      db = client.db('sudoku')
    }
    solved = await db.collection('solved')
  }
  return solved
}

async function getUserCount() {
  try {
    const collection = await getUsersCollection()
    const count = await collection.countDocuments()
    return count
  } catch (err) {
    console.error(JSON.stringify({ err: `Error fetching user collection count: ${err}` }))
    throw err
  }
}

async function getSTime() {
  if (!stime) {
    stime = await getStartTimestamp()
  }
  return stime
}

async function getETime() {
  if (!etime) {
    etime = await getEndTimestamp()
  }
  return etime
}

async function getQTime() {
  if (!qtime) {
    qtime = await getQuantTimestamps()
  }
  return qtime
}

async function getUserFromUserId(objectId) {
  const collection = await getUsersCollection()
  const user = await collection.findOne({ _id: new mongodb.ObjectId(objectId) }) // find the current user
  return user
}

async function getPersistCollections() {
  const userCollection = await getUsersCollection()
  const solvedCollection = await getSolvedCollection()
  return { userCollection, solvedCollection }
}

async function persistUserSolved(userIdentifier, user, userCollection) {
  try {
    return userCollection.updateOne( // return the Promise here
      { _id: new mongodb.ObjectId(userIdentifier) },
      { $set: { solved: user.solved, numberSolved: user.numberSolved } }
    )
  } catch (err) {
    throw new Error(`Error updating user: ${err}`)
  }
}

async function persistNewlySolved(index) {
  try {
    const collection = await getSolvedCollection()
    return collection.updateOne(
      { index },
      { $inc: { count: 1 } } // Increment operation
    ) // return the Promise here
  } catch (err) {
    throw new Error(`Error solved: ${err}`)
  }
}

async function getUserSolved(res, userIdentifier) {
  try {
    const collection = await getUsersCollection()
    const data = await collection.findOne({ _id: new mongodb.ObjectId(userIdentifier) })
    return res.status(200).send(data.solved)
  } catch (err) {
    return res.status(500).send(err)
  }
}

function getAllSolved(res) {
  return res.status(200).send(allSolved)
}

async function sortBestUsers() {
  /*
  * function that 1) takes the best previous users and puts them in previous best
  * and 2) iterates over all users and takes the best into currently best
  */
  const collection = await getUsersCollection()
  const allUsers = await collection.find({}, { projection: { name: 1, numberSolved: 1 } }).toArray()

  previouslyBest = bestUsers
  allUsers.sort((a, b) => b.numberSolved - a.numberSolved)
  // bestUsers = allUsers.slice(0, n)
  bestUsers = allUsers // slicing actually is useless here
}

async function loadAllSolutions() {
  try {
    const collection = await getSolvedCollection()
    const data = await collection.find({}).toArray()
    allSolved = data
  } catch (err) {
    console.error(`error occurred in getsolvedCollection :${err}`)
  }
}

async function getStartTimestampCollection() {
  if (!startTimestamp) {
    if (!db) {
      db = client.db('sudoku')
    }
    startTimestamp = await db.collection('sTime')
  }
  return startTimestamp
}

async function getEndTimestampCollection() {
  if (!endTimestamp) {
    if (!db) {
      db = client.db('sudoku')
    }
    endTimestamp = await db.collection('eTime')
  }
  return endTimestamp
}

async function getQuantizationTimestampCollection() {
  if (!quantizationTimestamp) {
    if (!db) {
      db = client.db('sudoku')
    }
    quantizationTimestamp = await db.collection('qTime')
  }
  return quantizationTimestamp
}

async function setStartTimestamp(timestamp) {
  try {
    const collection = await getStartTimestampCollection()
    await collection.insertOne({ starttime: timestamp })
  } catch (error) {
    console.error('Error setting start timestamp:', error)
  }
}

async function setEndTimestamp(timestamp) {
  try {
    const collection = await getEndTimestampCollection()
    await collection.insertOne({ endtime: timestamp })
  } catch (error) {
    console.error('Error setting end timestamp:', error)
  }
}

async function setQuantizationTimestamp(timestamp) {
  try {
    const collection = await getQuantizationTimestampCollection()
    await collection.insertOne({ qtime: timestamp })
  } catch (error) {
    console.error('Error setting quantization timestamp:', error)
  }
}

async function getStartTimestamp() {
  const collection = await getStartTimestampCollection()
  const items = await collection.find({}).toArray()
  return items[0]
}

async function getEndTimestamp() {
  const collection = await getEndTimestampCollection()
  const items = await collection.find({}).toArray()
  return items[0]
}

async function getQuantTimestamps() {
  const collection = await getQuantizationTimestampCollection()
  const items = await collection.find({}).toArray()
  return items[0]
}

async function getInitSolvedFromDb() {
  const collection = await getSolvedCollection()
  const allData = await collection.find({}).toArray()
  allData.forEach(element => {
    element.count = 0
  })
  return allData
}

async function getUser(req, res) {
  try {
    const collection = await getUsersCollection()
    const userIdentifier = req.cookies.auth.split('___')[0]

    const data = await collection.findOne({ _id: new mongodb.ObjectId(userIdentifier) })
    return res.status(200).send({ _id: userIdentifier, name: data.name })
  } catch (err) {
    return res.status(500).send(err)
  }
}

async function updateUser(req, res) {
  try {
    const collection = await getUsersCollection()
    const userIdentifier = req.cookies.auth.split('___')[0]

    // update the user document
    const updateResult = await collection.updateOne(
      { _id: new mongodb.ObjectId(userIdentifier) },
      { $set: { name: req.body.name } }
    )

    // Check if the update was successful
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // fetch the updated user to return the updated data
    const updatedUser = await collection.findOne({ _id: new mongodb.ObjectId(userIdentifier) })

    return res.status(200).json(updatedUser)
  } catch (err) {
    return res.status(500).json({ err })
  }
}

module.exports = {
  get bestUsers() {
    return bestUsers
  },
  get previouslyBest() {
    return previouslyBest
  },

  setQuantizationTimestamp,
  getPersistCollections,
  getInitSolvedFromDb,
  getSolvedCollection,
  getUsersCollection,
  persistNewlySolved,
  getUserFromUserId,
  persistUserSolved,
  setStartTimestamp,
  setEndTimestamp,
  getUserSolved,
  getUserCount,
  getAllSolved,
  updateUser,
  getSTime,
  getETime,
  getQTime,
  getUser
}
