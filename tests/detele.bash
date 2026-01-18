# delete by id
curl -X DELETE http://localhost:3000/blogs/{BLOG_ID}

# invalid id format (fail)
curl -X DELETE http://localhost:3000/blogs/invalid-id

# with non-existent valid ID (404)
curl -X DELETE http://localhost:3000/blogs/123456789012345678901234