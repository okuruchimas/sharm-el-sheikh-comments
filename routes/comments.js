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

    const newComment = {
      _id: new ObjectId().toString(),
      rating,
      text,
      email,
      date: new Date(),
    };

    let place = await placesCollection.findOne({ placeId });

    let newAverageRating;
    let newTotalComments;

    if (place) {
      const existingCommentIndex = place.comments.findIndex(
        (comment) => comment.email === email,
      );

      if (existingCommentIndex !== -1) {
        place.comments[existingCommentIndex] = newComment;
      } else {
        place.comments.push(newComment);
      }

      newTotalComments = place.comments.length;
      const totalRating = place.comments.reduce(
        (sum, comment) => sum + comment.rating,
        0,
      );
      newAverageRating = totalRating / newTotalComments;
    } else {
      newTotalComments = 1;
      newAverageRating = rating;
      place = {
        placeId,
        comments: [newComment],
      };
    }

    await placesCollection.updateOne(
      { placeId },
      {
        $setOnInsert: { placeId },
        $set: {
          comments: place.comments,
          averageRating: newAverageRating,
          totalComments: newTotalComments,
        },
      },
      { upsert: true },
    );

    const updatedPlace = await placesCollection.findOne(
      { placeId },
      { projection: { comments: 1 } },
    );

    const commentsWithoutEmail = updatedPlace.comments.map(
      ({ email, ...rest }) => rest,
    );

    res.status(201).json({
      comments: commentsWithoutEmail,
      averageRating: newAverageRating,
      totalComments: newTotalComments,
    });
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
      { projection: { comments: 1, averageRating: 1, totalComments: 1 } },
    );

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    const commentsWithoutEmail = place.comments.map(
      ({ email, ...rest }) => rest,
    );

    res.status(200).json({
      comments: commentsWithoutEmail,
      averageRating: place.averageRating,
      totalComments: place.totalComments,
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ error: "Failed to get comments" });
  }
});

module.exports = router;
