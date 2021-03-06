/* eslint-disable no-undef */
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')

let token = ''

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  await User.insertMany(helper.testUser)
  const user = await User.findOne({})

  const blogs = [...helper.initialBlogs]

  blogs.forEach(element => {
    element.user = user._id
  })

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  await Blog.insertMany(helper.initialBlogs)

  token = jwt.sign(userForToken, process.env.SECRET)
})

describe('when there are blogs already in database', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('blog identifier is "id"', async () => {
    const blogs = await helper.blogsInDb()
    expect(blogs[0].id).toBeDefined()
  })
})

describe('adding new blogs', () => {
  test('succeeds with valid info', async () => {
    await api
      .post('/api/blogs')
      .set({ Authorization: `bearer ${token}` })
      .send(helper.oneBlog[0])
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(await helper.blogsInDb()).toHaveLength(helper.initialBlogs.length+1)
  })

  test('empty likes converts to 0 likes', async () => {
    const blog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
    }

    const addedBlog = await api
      .post('/api/blogs')
      .set({ Authorization: `bearer ${token}` })
      .send(blog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(addedBlog.body.likes).toBe(0)
  })

  test('fails with no url or/and title', async () => {
    const blog = {
      author: 'Edsger W. Dijkstra',
      likes: 12
    }

    await api
      .post('/api/blogs')
      .set({ Authorization: `bearer ${token}` })
      .send(blog)
      .expect(400)

  })

  test('fails with no token', async () => {
    const blog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
    }

    await api
      .post('/api/blogs')
      .send(blog)
      .expect(401)

  })
})

describe('deleting blogs', () => {
  test('succeeds if id is valid', async () => {
    const blogsBefore = await helper.blogsInDb()
    const sizeBefore = blogsBefore.length

    const blogToDelete=blogsBefore[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: `bearer ${token}` })
      .expect(204)

    const blogsAfter = await helper.blogsInDb()

    expect(blogsAfter).not.toContain(blogToDelete)

    expect(blogsAfter).toHaveLength(sizeBefore-1)
  })

  test('fails if id is not valid', async () => {
    await api
      .delete('/api/blogs/invalid')
      .set({ Authorization: `bearer ${token}` })
      .expect(400)
  })

  test('fails if blog is not found', async () => {
    const id = '5e8b15501609414e80185edb'

    await api
      .delete(`/api/blogs/${id}`)
      .set({ Authorization: `bearer ${token}` })
      .expect(404)
  })
})

describe('updating blogs', () => {
  const updateBlog = {
    id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string expansion',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 15
  }

  test('fails if id is not valid', async () => {
    await api
      .put('/api/blogs/invalid')
      .send(updateBlog)
      .expect(400)

    const blogsAfter = await helper.blogsInDb()

    expect(blogsAfter).not.toContainEqual(updateBlog)
  })

  test('fails if blog is not found', async () => {
    const id = '5a422a851b54a676254d17f7'

    await api
      .put(`/api/blogs/${id}`)
      .send(updateBlog)
      .expect(404)

    const blogsAfter = await helper.blogsInDb()

    expect(blogsAfter).not.toContainEqual(updateBlog)
  })

  test('succeeds if id is valid', async () => {
    await api
      .put(`/api/blogs/${updateBlog.id}`)
      .send(updateBlog)
      .expect(200)
  })
})

afterAll(() => {
  mongoose.connection.close()
})