const mongodb = require('mongodb')

async function deleteAll() {
  const mongoUrl = 'mongodb://127.0.0.1:27017'
  const client = await new mongodb.MongoClient(mongoUrl, {
    serverApi: {
      version: mongodb.ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  })

  const db = await client.db('sudoku')
  const users = await db.collection('users')
  const solved = await db.collection('solved')
  const stime = await db.collection('sTime')
  const etime = await db.collection('eTime')
  await users.deleteMany({})
  await solved.deleteMany({})
  await stime.deleteMany({})
  await etime.deleteMany({})

  await client.close()
}
deleteAll()
