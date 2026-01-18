# with author
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "body": "This is the content of my first blog post. It contains interesting information about Node.js and MongoDB.",
    "author": "Ali Qazybai"
  }'

# without author (anonymos)
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Belgisiz post",
    "body": "This post has no author specified."
  }'

# missing title (fail)
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "body": "This has no title"
  }'

# missing body (fail)
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "No Body Post"
  }'

# empty file (fail)
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "body": "This has empty title"
  }'


  