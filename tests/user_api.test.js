const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
})

describe('user creation', () => {
  test('succeeds with valid information', async () => {
    const user = {
      username: 'test',
      name: 'Testi Testi',
      password: 'sekret'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('fails with not unique username', async () => {
    const user = {
      username: 'test',
      name: 'Hoi',
      password: 'sekret'
    }

    await api
      .post('/api/users')
      .send(user)

    const notAddedUser = await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(notAddedUser.body.error).toContain('User validation failed')
  })

  test('fails with too short password', async () => {
    const user = {
      username: 'testi',
      name: 'Hoi',
      password: 'se'
    }

    const failedUser = await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(failedUser.body.error).toMatch('password is invalid or doesn\'t exist')
  })

  test('fails with too short username', async () => {
    const user = {
      username: 'te',
      name: 'Hoi',
      password: 'sekret'
    }

    const failedUser = await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(failedUser.body.error).toContain('User validation failed')
  })

  test('fails with no password', async () => {
    const user = {
      username: 'test',
      name: 'Hoi'
    }

    const failedUser = await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(failedUser.body.error).toMatch('password is invalid or doesn\'t exist')
  })

  test('fails with no username', async () => {
    const user = {
      name: 'Hoi',
      password: 'sekret'
    }

    const failedUser = await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(failedUser.body.error).toContain('Path `username` is required.')
  })
})

afterAll(() => {
  mongoose.connection.close()
})