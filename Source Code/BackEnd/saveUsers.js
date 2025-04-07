const mongoose = require("mongoose");
const users = require("./Usersdata.json");

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/myNewDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  status: { type: String, default: "active" },
  type: { type: String, required: true },
  password: { type: String, required: true },
});

// Create Model
const User = mongoose.model("User", userSchema);

// Insert Users
async function pushUsersToMongoDB() {
  try {
    await User.deleteMany({}); // Optional: clear existing users
    const result = await User.insertMany(users);
    console.log(`Inserted ${result.length} users successfully`);
    const count = await User.countDocuments();
    console.log(`Total Documents in "users" Collection: ${count}`);
  } catch (error) {
    console.error("Error inserting users:", error);
  } finally {
    mongoose.connection.close(); // Close DB connection
  }
}

pushUsersToMongoDB();