/* eslint-disable no-undef */
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if(!request.token){
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if(!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user._id,
    likes: body.likes ? body.likes : 0
  })

  const savedBlog = await (await blog.save())
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  const returnBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 })

  console.log(returnBlog)

  response.status(201).json(returnBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {
  const blogToRemove = await Blog.findById(request.params.id)
  if(!blogToRemove){
    return response.status(404).end()
  }

  const creator = blogToRemove.user.toString()

  if(!request.token){
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if(!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const currentUser = await (await User.findById(decodedToken.id))._id.toString()

  if(currentUser===creator){
    await Blog.findByIdAndRemove(request.params.id)

    response.status(204).end()
  }
  else{
    response.status(403).json({ error: 'Only creator can delete blogs' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const id = request.params.id

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
    .populate('user', { username: 1, name: 1 })
  if(updatedBlog){
    response.json(updatedBlog.toJSON())
  }
  else{
    response.status(404).end()
  }
})

module.exports = blogsRouter