const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");

const app = express();
const port = 3000;

// MongoDB Atlas connection string
const atlasConnectionStr =
  "mongodb+srv://admin:Password123@rajat.cjlygcr.mongodb.net/?retryWrites=true&w=majority";
// MongoDB Setup
mongoose.connect(atlasConnectionStr, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Note Schema
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Note = mongoose.model("Note", noteSchema);

app.use(bodyParser.json());

// Basic Authentication
const users = { admin: "Password123" };
app.use(basicAuth({ users, challenge: true }));

// Create Note
app.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Title and content are required fields" });
    }

    const note = new Note({ title, content });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Retrieve Notes
app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Retrieve Single Note
app.get("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Note
app.put("/notes/:id", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Title and content are required fields" });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, updatedAt: Date.now() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Note
app.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server and return the server object for testing purposes
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Gracefully shut down the server
const closeServer = () => {
  server.close(() => {
    console.log("Server is gracefully shutting down");
    process.exit(0);
  });
};

// Handle process termination signals
process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);

module.exports = { app, server };
