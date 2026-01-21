require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Validation middleware
function validateData(req, res, next) {
  const { title, body } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Title is required and cannot be empty",
    });
  }

  if (!body || body.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Body is required and cannot be empty",
    });
  }

  next();
}

// POST /blogs
app.post("/blogs", validateData, async (req, res) => {
  try {
    const { title, body, author = "Anonymous" } = req.body;

    const blogData = {
      title: title.trim(),
      body: body.trim(),
      author: author.trim(),
    };

    const result = await createBlog(blogData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: { id: result.insertedId },
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create blog",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("Error in POST /blogs:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /blogs
app.get("/blogs", async (req, res) => {
  try {
    const result = await getAllBlogs();

    if (result.success) {
      res.status(200).json({
        success: true,
        count: result.data.length,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to fetch blogs",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("Error in GET /blogs:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /blogs/:id
app.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid blog ID format",
      });
    }

    const result = await getBlogById(id);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
      });
    } else if (result.error === "Blog not found") {
      res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to fetch blog",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("Error in GET /blogs/:id:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// PUT /blogs/:id
app.put("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, author } = req.body;

    // ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid blog ID format",
      });
    }

    const updateData = {};
    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Title cannot be empty",
        });
      }
      updateData.title = title.trim();
    }
    if (body !== undefined) {
      if (body.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Body cannot be empty",
        });
      }
      updateData.body = body.trim();
    }
    if (author !== undefined) {
      updateData.author = author.trim();
    }

    // check if no update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields to update",
      });
    }

    const result = await updateBlog(id, updateData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        modifiedCount: result.modifiedCount,
      });
    } else if (result.error === "Blog not found") {
      res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to update blog",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("Error in PUT /blogs/:id:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// DELETE /blogs/:id
app.delete("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid blog ID format",
      });
    }

    const result = await deleteBlog(id);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
        deletedCount: result.deletedCount,
      });
    } else if (result.error === "Blog not found") {
      res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to delete blog",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("Error in DELETE /blogs/:id:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
