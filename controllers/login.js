const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })

  const correctPassword = user !== null ?
    await bcrypt.compare(body.password, user.passwordHash) : false

  if(!(user && correctPassword)) {
    return response.status(401).json({
      error: 'invalid credentials'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // eslint-disable-next-line no-undef
  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter