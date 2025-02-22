const dbhelper = require('./db')

const users = []
users.push({ name: 'organizer', email: 'some.mail@gmail.com', hash: 'TOADD', solved: [], numberSolved: 0, admin: true })

users.push({ name: 'BGL', email: 'bgl@fh-salzburg.ac.at', hash: '$2b$10$4bCYH35D9hW9rPMZMfOCVelEhwuEtB86PX.zOiEWRJU8DfZcmwFJ.', solved: [], numberSolved: 0 }) // pw: 34o5i34t34io34
users.push({ name: 'Skill Issue', email: 'skillissue@fh-salzburg.ac.at', hash: '$2b$10$.WKUK2H5HRNKPfyllglHweL47tFaiAuA28Gt0QJnYjPBx/pj7Z/GW', solved: [], numberSolved: 0 }) // pw: 9435h987hf73iu
users.push({ name: 'Abendessen ... Mhmmm lecker schmecker', email: 'abendessen@fh-salzburg.ac.at', hash: '$2b$10$BFKoTVNsf6SPfSOmMPCtV.1KXizlRgrqCs4udmrDX6iyEGpTCNmxG', solved: [], numberSolved: 0 }) // pw: oi395488394hfn0
users.push({ name: 'Tiegerenten', email: 'tiegerenten@fh-salzburg.ac.at', hash: '$2b$10$37bes2prPyl6bupXNl0cJOGMbbzf9trgI.ZZxdcBTd.HuA4x2wvS.', solved: [], numberSolved: 0 }) // pw: 3490jnf923f8
users.push({ name: 'Py Thonic', email: 'pythonic@fh-salzburg.ac.at', hash: '$2b$10$yR4sLFroRX6G8Vu1M5AV8uJUynKg0z4soVRMmLvrOEJXJP6yPwjxe', solved: [], numberSolved: 0 }) // pw: 45j08j803f938

users.push({ name: 'Snuggly Butterfly', email: 'guest1@fh-salzburg.ac.at', hash: '$2b$10$yT/DrCWCqDag8Ts6qYMegu4Bgu8yA/ldOvdBrXEfMcI6lz/2xCFNO', solved: [], numberSolved: 0 }) // pw: 3fe49gh7
users.push({ name: 'Squishy Kiwi', email: 'guest2@fh-salzburg.ac.at', hash: '$2b$10$Fa7BYLK.e09Xe0bNW1Vk8On7/J4SpqCulzwcHKXHNUmXmK1iVsY96', solved: [], numberSolved: 0 }) // pw: 34f89sf34
users.push({ name: 'Mushy Koala', email: 'guest3@fh-salzburg.ac.at', hash: '$2b$10$wNBJHlFl5Cj5uxhrIaWGaeG6qayDy/U4rs7fqKgqiaSmgGbJeadPO', solved: [], numberSolved: 0 }) // e8w79r5hg89

users.push({ name: 'Sketchy Frog', email: 'aaa.aaa@gmail.com', hash: '...___...', solved: [1, 2, 3, 4, 5], numberSolved: 5 })
users.push({ name: 'Puzzled Lobster', email: 'bbb.bbb@gmail.com', hash: '...___...', solved: [6, 7], numberSolved: 2 })
users.push({ name: 'Flashy Raven', email: 'ccc.ccc@gmail.com', hash: '...___...', solved: [8], numberSolved: 1 })
users.push({ name: 'Feisty Brisket', email: 'ddd.ddd@gmail.com', hash: '...___...', solved: [9], numberSolved: 1 })
users.push({ name: 'Sassy Bean', email: 'eee.eee@gmail.com', hash: '...___...', solved: [10, 11, 12, 13, 14], numberSolved: 5 })
users.push({ name: 'Tiny Meerkat', email: 'fff.fff@gmail.com', hash: '...___...', solved: [15], numberSolved: 1 })
users.push({ name: 'Spicy Gremlin', email: 'ggg.ggg@gmail.com', hash: '...___...', solved: [16, 17, 18], numberSolved: 3 })
users.push({ name: 'Wacky Duckling', email: 'hhh.hhh@gmail.com', hash: '...___...', solved: [19], numberSolved: 1 })
users.push({ name: 'Whirly Heron', email: 'iii.iii@gmail.com', hash: '...___...', solved: [61], numberSolved: 1 })
users.push({ name: 'Breezy Weasel', email: 'jjj.jjj@gmail.com', hash: '...___...', solved: [62], numberSolved: 1 })
users.push({ name: 'Shaky Fawn', email: 'kkk.kkk@gmail.com', hash: '...___...', solved: [63], numberSolved: 1 })
users.push({ name: 'Huffy Raven', email: 'lll.lll@gmail.com', hash: '...___...', solved: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], numberSolved: 11 })
users.push({ name: 'Whimsical Butterfly', email: 'mmm.mmm@gmail.com', hash: '...___...', solved: [31], numberSolved: 1 })
users.push({ name: 'Rusty Sloth', email: 'nnn.nnn@gmail.com', hash: '...___...', solved: [32, 33, 34], numberSolved: 3 })
users.push({ name: 'Sleepy Otterpop', email: 'ooo.ooo@gmail.com', hash: '...___...', solved: [35, 36], numberSolved: 2 })
users.push({ name: 'Shifty Carrot', email: 'xxx.xxx@gmail.com', hash: '...___...', solved: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60], numberSolved: 24 })

async function initUsersCollection(initialisedSolved) {
  if (await dbhelper.getUserCount() > 0) {
    return JSON.stringify({ msg: 'users collection already initialised' })
  }

  // reuse of initialisedSolved for simple quantization
  initialisedSolved.forEach(element => {
    element.count = 0
  })

  users.forEach(cUser => {
    const tmpSolved = JSON.parse(JSON.stringify(cUser.solved))
    cUser.solved = JSON.parse(JSON.stringify(initialisedSolved))
    cUser.solved[0].count = tmpSolved.length
  })

  const usersCollection = await dbhelper.getUsersCollection()
  await usersCollection.insertMany(users)
}

async function initSolutionsCollection(solved) {
  for (const user of users) {
    for (const cSolved of user.solved) {
      solved[0].count++ // since [0] is the first timestamp, and we quntize here, just increment timestamp 0
    }
  }
  return solved
}

async function initSolutionsAuxiliaryCollections(challengeTimeframe, timeQuantization) {
  const stime = await dbhelper.getSTime()
  const etime = await dbhelper.getETime()
  const qtime = await dbhelper.getQTime()
  if (stime && etime && qtime) { // if start and endtime are defined, skip
    return JSON.stringify({ msg: 'solutions collection already initialised' })
  }

  const timeNow = Date.now()
  const endTime = timeNow + challengeTimeframe
  await dbhelper.setStartTimestamp(timeNow)
  await dbhelper.setEndTimestamp(timeNow + challengeTimeframe)
  await dbhelper.setQuantizationTimestamp(timeQuantization)

  const solvedCollection = await dbhelper.getSolvedCollection()

  let initialisedSolved = []
  // init db solutions quantization
  let startingTime = timeNow
  let index = 0
  while (startingTime <= endTime) {
    let endingTime = startingTime + timeQuantization

    initialisedSolved.push({ startingTime, endingTime, index, count: 0 })

    index++
    startingTime = endingTime
  }

  // after we are done, init the demo users solutions
  initialisedSolved = await initSolutionsCollection(initialisedSolved)

  // push init do db
  await solvedCollection.insertMany(initialisedSolved)

  return initialisedSolved
}

async function initDB(challengeTimeframe, timeQuantization) {
  // first, init auxiliaries, then solutions collection
  const initialisedSolved = await initSolutionsAuxiliaryCollections(challengeTimeframe, timeQuantization)

  // init demo users
  await initUsersCollection(initialisedSolved)
}

module.exports = {
  initDB
}
