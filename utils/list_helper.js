const lodash = require('lodash');

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total+blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const index = likes.indexOf(Math.max(...likes))

  return index>-1 ? blogs[index] : null
}

const mostBlogs = (blogs) => {
  const amounts = lodash.countBy(blogs, blog => blog.author)

  let max = { author: '', blogs: 0 }
  for (let [key, value] of Object.entries(amounts)) {
    if(value>max.blogs){
      max.author = key
      max.blogs = value
    }
  }

  return max
}

const mostLikes = (blogs) => {
  const grouped_blogs = lodash.groupBy(blogs, blog => blog.author)

  let max = { author: '', likes: 0 }

  for (let [key, value] of Object.entries(grouped_blogs)) {
    const blog_list = [...value]
    const likes = blog_list.reduce((sum, blog) =>
      sum+blog.likes, 0)

    if(likes>max.likes){
      max.author=key
      max.likes=likes
    }
  }

  return max
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}