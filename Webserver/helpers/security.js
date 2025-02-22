const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')

const dbhelper = require('./db')

// sec defines
const secretKey = 'SOMESECRET'
const saltRounds = 10

const userLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 10, // limit each IP to 10 requests per window
  message: JSON.stringify({ err: 'too many user information attempts, try again later.' })
})

const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // limit each IP to 10 requests per window
  message: JSON.stringify({ err: 'too many registration attempts, try again later.' })
})

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 5 requests per window
  message: JSON.stringify({ err: 'too many login attempts, try again later' })
})

const singleSudokuLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per minute for single sudoku access
  message: JSON.stringify({ err: 'you are accessing too many single sudokus at a time. use bulk for more sudokus at once. for this api, try again later' })
})

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

function authenticateJWT(req, res, next) {
  if (!req.cookies.auth) {
    return res.status(401).send('unauthorized')
  }
  const token = req.cookies.auth.split('___')[1] // Assuming the JWT is stored in cookies

  if (!token) {
    return res.status(401).send('unauthorized')
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send('Token has expired')
      }
      return res.status(403).send('Invalid token')
    }
    req.user = user // Store user info
    next()
  })
}

async function checkAdmin(req, res, next) {
  // check if user in req.user is in db and is admin
  const usersCollection = await dbhelper.getUsersCollection()
  const user = await usersCollection.findOne({ email: req.user.email }) // not good for bit collections since users is stored in memory
  if (user.admin) {
    next()
  } else {
    return res.status(401).send('unauthorized')
  }
}

function validateToken(req, res) {
  if (!req.cookies.auth) {
    return res.status(401).send('provid a token')
  }
  const token = req.cookies.auth.split('___')[1]
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).send('invalid token')
    }
    res.sendStatus(200) // Token is valid
  })
}

/*
async function activateMail(req, res) {
  const userEmail = req.query.email
  const activationCode = req.query.code

  try {
    const collection = await dbhelper.getCollection('users')
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

module.exports = {
  secretKey,
  saltRounds,
  userLimiter,
  loginLimiter,
  registerLimiter,
  singleSudokuLimiter,

  // activateMail,
  checkAdmin,
  hashPassword,
  validateToken,
  verifyPassword,
  authenticateJWT
}
