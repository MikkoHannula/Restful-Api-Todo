const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Todo = require("./Todo");
const app = express();

const port = 3000;

// Enable CORS
app.use(cors());

// MongoDB connection with better error handling
mongoose
  .connect("mongodb://127.0.0.1:27017/todolist", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    console.log("Database URL:", mongoose.connection.host);
    console.log("Database Port:", mongoose.connection.port);
    console.log("Database Name:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware
app.use(bodyParser.json());

// Welcome page
app.get("/", (req, res) => {
  res.send(`
    <h1>Todo List API</h1>
    <h2>Available Endpoints:</h2>
    <ul>
      <li><code>GET /todos</code> - Get all todos</li>
      <li><code>POST /todos</code> - Create a new todo</li>
      <li><code>PUT /todos/:id</code> - Update a todo</li>
      <li><code>DELETE /todos/:id</code> - Delete a todo</li>
    </ul>
    <p>Current time: ${new Date().toLocaleString()}</p>
  `);
});

// Create todo
app.post("/todos", async (req, res) => {
  const { task } = req.body;
  try {
    const newTodo = new Todo({ task });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all todos
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update todo
app.put("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Task not found" });
    todo.completed = req.body.completed;
    await todo.save();
    res.status(200).json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ message: "Task not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});