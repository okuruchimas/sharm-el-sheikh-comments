require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

// const uri = process.env.MONGO_URI;
const uri =
  "mongodb+srv://sharmeshsheikh:hFdI9E1ygZuh2LZG@comments.sf27a.mongodb.net/?retryWrites=true&w=majority&appName=Comments";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

module.exports = { connectToDatabase };
