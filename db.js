require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_DB_CREDENTIAL;
const client = new MongoClient(uri);

const DB_NAME = "blog";
const COLLECTION_NAME = "blogs";

async function getCollection() {
  await client.connect();
  const db = client.db(DB_NAME);
  return db.collection(COLLECTION_NAME);
}

// POST
async function createBlog(blogData) {
  try {
    const collection = await getCollection();

    const result = await collection.insertOne({
      ...blogData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, insertedId: result.insertedId };
  } catch {
    console.error("Error in creating blog: ", error);
    return { success: false, error: error.message };
  } finally {
    client.close;
  }
}

// GET all
async function getAllBlogs() {
  try {
    const collection = await getCollection();
    const blogs = await collection.find({}).toArray();
    return { success: true, data: blogs };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { success: false, error: error.message };
  } finally {
    await client.close();
  }
}

// GET by ID
async function getBlogById(id) {
  try {
    const collection = await getCollection();
    const blog = await collection.findOne({ _id: new ObjectId(id) });
    if (!blog) {
      return { success: false, error: "Blog not found" };
    }
    return { success: true, data: blog };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return { success: false, error: error.message };
  } finally {
    await client.close();
  }
}

// UPDATE
async function updateBlog(id, updateData) {
  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Blog not found" };
    }

    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error("Error updating blog:", error);
    return { success: false, error: error.message };
  } finally {
    await client.close();
  }
}

// DELETE by ID
async function deleteBlog(id) {
  try {
    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return { success: false, error: "Blog not found" };
    }

    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return { success: false, error: error.message };
  } finally {
    await client.close();
  }
}

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
