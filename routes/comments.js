const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { connectToDatabase } = require("../lib/database");

router.post("/", async (req, res) => {
  const { rating, text, placeId, email } = req.body;

  if (!rating || !text || !placeId || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("commentsDB");
    const placesCollection = db.collection("companies");

    const comment = {
      _id: new ObjectId().toString(),
      rating,
      text,
      email,
      date: new Date(),
    };

    const result = await placesCollection.updateOne(
      { placeId },
      {
        $setOnInsert: { placeId },
        $push: { comments: comment },
      },
      { upsert: true },
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.get("/:placeId", async (req, res) => {
  const { placeId } = req.params;

  try {
    const client = await connectToDatabase();
    const db = client.db("commentsDB");
    const placesCollection = db.collection("companies");

    const place = await placesCollection.findOne(
      { placeId },
      { projection: { comments: 1 } },
    );

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.status(200).json(place.comments);
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ error: "Failed to get comments" });
  }
});

module.exports = router;
