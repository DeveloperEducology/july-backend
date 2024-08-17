if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database connection
const uri = "mongodb+srv://vijaymarka:admin123@cluster0.ivjiolu.mongodb.net/JuneTutor?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Routes
require("./src/config/database");
const my_routes = require("./src/routes");

app.get("/", (req, res) => {
  res.send("Hello, Express");
});

app.get("/collections", async (req, res) => {
  try {
    const categories = db.collection("categories").find().toArray();
    const classes = db.collection("classes").find().toArray();
    const subjects = db.collection("subjects").find().toArray();
    const cities = db.collection("cities").find().toArray();
    const locations = db.collection("locations").find().toArray();

    const results = await Promise.all([categories, classes, subjects, cities, locations]);

    res.json({
      categories: results[0],
      classes: results[1],
      subjects: results[2],
      cities: results[3],
      locations: results[4],
    });
  } catch (error) {
    res.status(500).send({ error: "An error occurred while fetching the collections" });
  }
});

app.use("/", my_routes);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
