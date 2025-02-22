const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const validator = require('express-validator')

const init = require('./helpers/init')
const security = require('./helpers/security')
const sudokuLoader = require('./helpers/sudokuloader')
const authentification = require('./helpers/authentification')

// web app defines
const port = 3000
const app = express()

app.use(express.static(path.join(__dirname, 'registration')))

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.ico'))
})

app.use(express.urlencoded({ extended: true })) // for json bodies
app.use(express.json())
app.use(cookieParser())
app.use('/hidden', security.authenticateJWT, express.static(path.join(__dirname, 'hidden')))
app.use('/admin', security.authenticateJWT, security.checkAdmin, express.static(path.join(__dirname, 'admin')))
app.use(express.static(path.join(__dirname, 'public')))

// starts dataloader and sudoku loader defines
const bulkLimit = 100
const bigbulkLimit = 3
setInterval(sudokuLoader.printAmountSudokus, 1000 * 60 * 15)
sudokuLoader.startLoading()
sudokuLoader.checkSudokuTimeouts()

// init db if empty
const challengeTime = 1000 * 60 * 60 * 60 // challenge time set for 60h
const timeQuantization = 1000 * 60 * 60 // time quantization set to 1 hour
init.initDB(challengeTime, timeQuantization)

const roundrobin = false
const roundrobintime = 3
const finale = false
//const currentlyAllowed = 'bgl@fh-salzburg.ac.at'
//const currentlyAllowed = 'skillissue@fh-salzburg.ac.at'
//const currentlyAllowed = 'abendessen@fh-salzburg.ac.at'
//const currentlyAllowed = 'tiegerenten@fh-salzburg.ac.at'
//const currentlyAllowed = 'pythonic@fh-salzburg.ac.at'
let roundrobinindex = 0
const roundrobinarray = ['pythonic@fh-salzburg.ac.at', 'bgl@fh-salzburg.ac.at', 'abendessen@fh-salzburg.ac.at', 'tiegerenten@fh-salzburg.ac.at', 'skillissue@fh-salzburg.ac.at']

// handles sudoku endpoints
app.get('/sudoku', security.singleSudokuLimiter, security.authenticateJWT, async (req, res) => {
  try {
    if (finale && currentlyAllowed !== req.user.email) {
      return res.status(401).send('currently not allowed, wait your turn!')
    }

    if (roundrobin && roundrobinarray[roundrobinindex] !== req.user.email) {
      return res.status(401).send(`currently not allowed, wait your turn. Currently its: ${roundrobinarray[roundrobinindex]} turn. Round Lobin List: ${JSON.stringify(roundrobinarray)}`)
    }

    const sudoku = await sudokuLoader.getSingleSudoku(req.cookies.auth) // await for error handling
    return res.json(sudoku)
  } catch (error) {
    return res.status(409).send(error.message)
  }
})

app.get('/sudokus', security.authenticateJWT, async (req, res) => {
  try {
    if (finale && currentlyAllowed !== req.user.email) {
      return res.status(401).send('currently not allowed, wait your turn!')
    }

    if (roundrobin && roundrobinarray[roundrobinindex] !== req.user.email) {
      return res.status(401).send(`currently not allowed, wait your turn. Currently its: ${roundrobinarray[roundrobinindex]} turn. Round Lobin List: ${JSON.stringify(roundrobinarray)}`)
    }

    const sudokus = await sudokuLoader.getMultipleSudokus(req.cookies.auth, bulkLimit) // await for error handling
    return res.json(sudokus)
  } catch (error) {
    return res.status(409).send(error.message)
  }
})

app.get('/hashsudokus', security.authenticateJWT, async (req, res) => {
  try {
    if (finale && currentlyAllowed !== req.user.email) {
      return res.status(401).send('currently not allowed, wait your turn!')
    }

    if (roundrobin && roundrobinarray[roundrobinindex] !== req.user.email) {
      return res.status(401).send(`currently not allowed, wait your turn. Currently its: ${roundrobinarray[roundrobinindex]} turn. Round Lobin List: ${JSON.stringify(roundrobinarray)}`)
    }

    const sudokus = await sudokuLoader.getMultipleSudokusHashed(req.cookies.auth, bigbulkLimit) // await for error handling
    return res.json(sudokus)
  } catch (error) {
    return res.status(409).send(error.message)
  }
})

app.post('/validate-sudokus', security.authenticateJWT, [
  validator.body('data').isArray().withMessage('Data must be an array of sudokus'),
  validator.body('data.*.id').isInt().withMessage('ID must be an integer'),
  validator.body('data.*.template').isArray({ min: 9, max: 9 }).withMessage('template must be a 9x9 array'),
  validator.body('data.*.template.*').isArray({ min: 9, max: 9 }).withMessage('each row in the template must have 9 elements')
], (req, res) => {
  if (finale && currentlyAllowed !== req.user.email) {
    return res.status(401).send('currently not allowed, wait your turn!')
  }

  if (roundrobin && roundrobinarray[roundrobinindex] !== req.user.email) {
    return res.status(401).send(`currently not allowed, wait your turn. Currently its: ${roundrobinarray[roundrobinindex]} turn. Round Lobin List: ${JSON.stringify(roundrobinarray)}`)
  }

  const errors = validator.validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  sudokuLoader.checkSudokus(req.cookies.auth, req.body.data, res)
})

app.post('/validate-sudokus-hash', security.authenticateJWT, [
  validator.body('data').isString().withMessage('Data must be a string of hashed sudokus'),
], (req, res) => {
  try {
    if (finale && currentlyAllowed !== req.user.email) {
      return res.status(401).send('currently not allowed, wait your turn!')
    }

    if (roundrobin && roundrobinarray[roundrobinindex] !== req.user.email) {
      return res.status(401).send(`currently not allowed, wait your turn. Currently its: ${roundrobinarray[roundrobinindex]} turn. Round Lobin List: ${JSON.stringify(roundrobinarray)}`)
    }

    const errors = validator.validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    sudokuLoader.checkSudokuHashes(req.cookies.auth, req.body.data, res)
  } catch (error) {
    return res.status(400).send(error.message)
  }
})

// token validation
app.post('/validate-token', (req, res) => security.validateToken(req, res))

// authentification endpoints
app.post('/register', security.registerLimiter, [
  validator.body('email').isEmail().withMessage('please use a valid email').trim().escape(),
  validator.body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters')
], async (req, res) => authentification.register(req, res))
app.post('/login', security.loginLimiter, [
  validator.body('email').isEmail().withMessage('please use a valid email').trim().escape(),
  validator.body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters')
], async (req, res) => authentification.login(req, res))
app.get('/activate', async (req, res) => authentification.activateMail(req, res))
app.post('/logout', security.authenticateJWT, (req, res) => authentification.logout(req, res))

app.get('/solved', security.authenticateJWT, async (req, res) => {
  try {
    if (finale && currentlyAllowed !== req.user.email) {
      return res.status(401).send('currently not allowed, wait your turn!')
    }

    if (roundrobin && roundrobinarray[roundrobinindex] !== req.user.email) {
      return res.status(401).send(`currently not allowed, wait your turn. Currently its: ${roundrobinarray[roundrobinindex]} turn. Round Lobin List: ${JSON.stringify(roundrobinarray)}`)
    }

    await sudokuLoader.getSolved(req, res)
  } catch (error) {
    return res.status(500).json({ message: 'error retrieving solved sudokus', error })
  }
})

app.get('/allsolved', security.authenticateJWT, async (req, res) => {
  try {
    if (finale && currentlyAllowed !== req.user.email) {
      return res.status(401).send('currently not allowed, wait your turn!')
    }

    if (roundrobin && roundrobinarray[roundrobinindex] !== req.user.email) {
      return res.status(401).send(`currently not allowed, wait your turn. Currently its: ${roundrobinarray[roundrobinindex]} turn. Round Lobin List: ${JSON.stringify(roundrobinarray)}`)
    }

    await sudokuLoader.getAllSolved(res)
  } catch (error) {
    return res.status(500).json({ message: 'error retrieving all sudokus', error })
  }
})

app.get('/user', security.userLimiter, security.authenticateJWT, (req, res) => {
  return authentification.getUser(req, res)
})

app.put('/user', security.userLimiter, security.authenticateJWT, (req, res) => {
  return authentification.updateUser(req, res)
})

app.get('/bestusers', security.authenticateJWT, (req, res) => {
  return res.json({ bestUsers: sudokuLoader.bestUsers, previouslyBest: sudokuLoader.previouslyBest })
})

setInterval(() => {
  roundrobinindex = (roundrobinindex + 1) % roundrobinarray.length
}, 60 * roundrobintime * 1000)

app.listen(port, () => {
  console.log(`server started on http://localhost:${port}`)
})
