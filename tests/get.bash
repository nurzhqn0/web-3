# all blogs
curl -X GET http://localhost:3000/blogs

# by blog id
curl -X GET http://localhost:3000/blogs/{blog_id}

# invalid ID format (fail)
curl -X GET http://localhost:3000/blogs/invalid-id

# non-existent valid ID (404)
curl -X GET http://localhost:3000/blogs/123456789012345678901234