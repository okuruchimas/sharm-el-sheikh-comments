// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const commentsRouter = require("./routes/comments");

app.use(cors());
app.use(express.json());
app.use("/comments", commentsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
