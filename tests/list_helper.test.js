const listHelper = require('../utils/list_helper')
const helper = require('./test_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const blogs = []

    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(helper.oneBlog)
    expect(result).toBe(helper.oneBlog[0].likes)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(helper.initialBlogs)
    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {
  test('of one blog', () => {
    const result = listHelper.favoriteBlog(helper.oneBlog)
    expect(result).toEqual(helper.oneBlog[0])
  })

  test('of many blogs', () => {
    const result = listHelper.favoriteBlog(helper.initialBlogs)
    expect(result).toEqual(helper.initialBlogs[2])
  })

  test('of no blogs', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toEqual(null)
  })
})

describe('most blogs', () => {
  test('of one author', () => {
    const result = listHelper.mostBlogs(helper.oneBlog)
    expect(result).toEqual({ author: 'Edsger W. Dijkstra', blogs: 1 })
  })

  test('of many authors', () => {
    const result = listHelper.mostBlogs(helper.initialBlogs)
    expect(result).toEqual({ author: 'Robert C. Martin', blogs: 3 })
  })

  test('of no authors', () => {
    const result = listHelper.mostBlogs([])
    expect(result).toEqual({ author: '', blogs: 0 })
  })
})

describe('most likes', () => {
  test('of one author', () => {
    const result = listHelper.mostLikes(helper.oneBlog)
    expect(result).toEqual({ author: 'Edsger W. Dijkstra', likes: 5 })
  })

  test('of many authors', () => {
    const result = listHelper.mostLikes(helper.initialBlogs)
    expect(result).toEqual({ author: 'Edsger W. Dijkstra', likes: 17 })
  })

  test('of no authors', () => {
    const result = listHelper.mostLikes([])
    expect(result).toEqual({ author: '', likes: 0 })
  })
})