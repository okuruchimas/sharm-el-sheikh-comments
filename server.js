const express = require("express");
const cors = require("cors");
const app = express();
const commentsRouter = require("./routes/comments");

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/comments", commentsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
