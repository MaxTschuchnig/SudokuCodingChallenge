const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const validator = require('express-validator')

const dbhelper = require('./db')
const mailer = require('./mailer')
const security = require('./security')

const adjectives = [
  'Wobbly', 'Sassy', 'Jumpy', 'Sneaky', 'Chunky', 'Zesty', 'Fluffy', 'Drowsy',
  'Spicy', 'Giggly', 'Mysterious', 'Slippery', 'Grumpy', 'Nervous', 'Redundant',
  'Bouncy', 'Clumsy', 'Crispy', 'Fuzzy', 'Noisy', 'Puzzled', 'Quirky', 'Wacky',
  'Raspy', 'Squeaky', 'Tipsy', 'Whimsical', 'Whiny', 'Lazy', 'Fidgety', 'Loopy',
  'Frisky', 'Goofy', 'Dizzy', 'Odd', 'Zany', 'Wacky', 'Bossy', 'Greedy',
  'Plucky', 'Prickly', 'Scrawny', 'Tiny', 'Pompous', 'Mighty', 'Shifty', 'Glum',
  'Silly', 'Rusty', 'Cheeky', 'Feisty', 'Scruffy', 'Peculiar', 'Quaint',
  'Bashful', 'Rowdy', 'Huffy', 'Flashy', 'Icy', 'Nifty', 'Tacky', 'Sleepy',
  'Cuddly', 'Soggy', 'Cranky', 'Witty', 'Peppy', 'Breezy', 'Sketchy', 'Zippy',
  'Twitchy', 'Groggy', 'Scratchy', 'Snappy', 'Snooty', 'Gloomy', 'Spritely',
  'Topsy-Turvy', 'Gigantic', 'Weird', 'Frothy', 'Stuffy', 'Puffy', 'Tipsy',
  'Mushy', 'Bumpy', 'Jolly', 'Nutty', 'Smudgy', 'Shaky', 'Swirly', 'Quivery',
  'Frumpy', 'Squishy', 'Knobbly', 'Knotted', 'Fumbling', 'Tangled', 'Drifty',
  'Frantic', 'Whirly', 'Hazy', 'Snuggly', 'Creaky', 'Dapper'
]

const nouns = [
  'Otter', 'Pickle', 'Banana', 'Pirate', 'Cactus', 'Duckling', 'Hedgehog',
  'Pancake', 'Wizard', 'Taco', 'Ninja', 'Pigeon', 'Lobster', 'Cupcake', 'Sock',
  'Walrus', 'Muffin', 'Hamster', 'Platypus', 'Butterfly', 'Koala', 'Peanut',
  'Meerkat', 'Marshmallow', 'Squirrel', 'Doughnut', 'Puffin', 'Sloth', 'Unicorn',
  'Pelican', 'Penguin', 'Mongoose', 'Raccoon', 'Squid', 'Crab', 'Toad', 'Newt',
  'Giraffe', 'Marmoset', 'Kangaroo', 'Parrot', 'Marmalade', 'Chinchilla', 'Llama',
  'Beetle', 'Tortoise', 'Blobfish', 'Octopus', 'Cabbage', 'Zebra', 'Carrot',
  'Chipmunk', 'Gnome', 'Pixie', 'Gremlin', 'Frog', 'Walnut', 'Salamander', 'AI',
  'Jellybean', 'Crumpet', 'Alpaca', 'Kiwi', 'Puffball', 'Guppy', 'Squash', 'Al',
  'Bean', 'Mole', 'Woodpecker', 'Hummingbird', 'Seahorse', 'Tadpole', 'Beaver',
  'Mule', 'Goose', 'Peacock', 'Parakeet', 'Ferret', 'Truffle', 'Turnip', 'Raven',
  'Scarecrow', 'Fawn', 'Heron', 'Badger', 'Weasel', 'Otterpop', 'Churro', 'Brisket',
  'Tarantula', 'Gecko', 'Stingray', 'Seaweed', 'Crayfish', 'Puffin',
  'Rutabaga', 'Tortilla', 'Sprout', 'Dumpling', 'Pudding', 'Salmon', 'Clam',
  'Oyster', 'Tuna', 'Fritter', 'Pretzel', 'Scone'
]

async function register(req, res) {
  // validate errors
  const validationErrors = validator.validationResult(req)
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ validationErrors: validationErrors.array() })
  }
  try {
    const collection = await dbhelper.getUsersCollection()

    const userpwhash = await security.hashPassword(req.body.password) // generate pw hash
    // const activationCode = crypto.randomBytes(32).toString('hex') // generate mail activation code
    // const activationLink = `http://localhost:3000/activate?email=${req.body.email}&code=${activationCode}` // generate mail activation link
    const testdoc = { name: getRandomName(), email: req.body.email, hash: userpwhash, solved: await dbhelper.getInitSolvedFromDb(), numberSolved: 0 }

    // check if user already exists
    const user = await collection.findOne({ email: req.body.email })
    if (user) {
      return res.status(409).send('email already taken') // if it is, not allowed to register
    }
    const insertResult = await collection.insertOne(testdoc)
    /* try { // send activation email
      await mailer.sendActivationEmail(testdoc.email, activationLink)
    } catch (emailError) {
      console.error('error sending activation email:', emailError)
      return res.status(500).send('error sending activation email, please try again later.')
    } */
    console.log(`registered new user with _id: ${insertResult.insertedId}`)
    return res.status(201).send('user registered successfully')
  } catch (error) {
    console.error(error)
    return res.status(500).send('internal server error')
  }
}

async function login(req, res) {
  // validate errors
  const validationErrors = validator.validationResult(req)
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ validationErrors: validationErrors.array() })
  }

  try {
    const collection = await dbhelper.getUsersCollection()
    const user = await collection.findOne({ email: req.body.email })

    // if there is no user, unauthorized
    if (!user) {
      return res.status(401).send('unauthorized (user not found)')
    }

    const isMatch = await security.verifyPassword(req.body.password, user.hash)
    if (isMatch) {
      let token = jwt.sign({ email: user.email }, security.secretKey, { expiresIn: '120h' })
      token = `${user._id}___${token}`
      res.cookie('auth', token, {
        httpOnly: true,
        // secure: true, // later for https
        path: '/',
        sameSite: 'Lax'
      })
      // res.cookie('auth', token, { httpOnly: true, secure: true }) // for later https
      return res.send('ok')
    } else {
      return res.status(401).send('unauthorized (password does not match)')
    }
  } catch (error) {
    console.error(error)
    return res.status(500).send('internal server error')
  }
}

/*
async function activateMail(req, res) {
  const userEmail = req.query.email
  const activationCode = req.query.code

  try {
    const collection = await dbhelper.getUsersCollection()
    const user = await collection.findOne({ email: userEmail })

    // Check if user exists
    if (!user) {
      return res.status(404).send('User not found')
    }

    // Verify the activation code
    if (user.activationCode !== activationCode) {
      return res.status(400).send('Invalid activation code')
    }

    // Update user to set activated to true
    await collection.updateOne(
      { email: userEmail },
      { $set: { activated: true, activationCode: null } } // Clear activation code after use
    )

    return res.redirect('/index.html')
  } catch (error) {
    console.error(error)
    return res.status(500).send('internal server error')
  }
}
*/

function logout(req, res) {
  // clear the JWT cookie by setting it to expired
  res.cookie('auth', '', { httpOnly: true, expires: new Date(0), path: '/' })
  // Respond with a message or redirect
  res.send('Logged out successfully')
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomName() {
  return `${getRandomElement(adjectives)} ${getRandomElement(nouns)}`
}

function getUser(req, res) {
  return dbhelper.getUser(req, res)
}

function updateUser(req, res) {
  return dbhelper.updateUser(req, res)
}

module.exports = {
  // activateMail,
  updateUser,
  register,
  getUser,
  logout,
  login
}
