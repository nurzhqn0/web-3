# upadate all
curl -X PUT http://localhost:3000/blogs/{blog_id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Blog Title",
    "body": "This is the updated content of the blog post.",
    "author": "Jane Smith"
  }'

# update only title
curl -X PUT http://localhost:3000/blogs/{blog_id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Only Title Updated"
  }'

# update only body
curl -X PUT http://localhost:3000/blogs/{blog_id} \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Only the body content has been updated here."
  }'

# empty title (fail)
curl -X PUT http://localhost:3000/blogs/{blog_id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": ""
  }'

# with non-existent ID (404)
curl -X PUT http://localhost:3000/blogs/123456789012345678901234 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "This blog does not exist"
  }'