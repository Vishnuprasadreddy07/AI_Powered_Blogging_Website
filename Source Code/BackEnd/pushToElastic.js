const mongoose = require("mongoose");
const data = require("./Postsdata.json");

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/myNewDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Schema
const postSchema = new mongoose.Schema({
  //id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: String, required: true },
  topic: { type: String, required: true },
  comments: [
    {
      id: { type: Number, required: true },
      text: { type: String, required: true },
      author: { type: String, required: true },
    },
  ],
  date: { type: Date, default: Date.now },
});

// Create Model
const Post = mongoose.model("Post", postSchema);

async function pushToMongoDB() {
  try {
    // Clear existing collection to prevent duplicates
    await Post.deleteMany({});
    
    // Insert Data in Bulk
    const bulkResponse = await Post.insertMany(data);
    console.log(`Inserted ${bulkResponse.length} documents successfully`);

    // Count documents in the collection
    const count = await Post.countDocuments();
    console.log(`Total Documents in "posts" Collection: ${count}`);
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    mongoose.connection.close(); // Close connection after operation
  }
}

// Run the function
pushToMongoDB();
