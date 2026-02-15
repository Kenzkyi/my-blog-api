const mongoose = require("mongoose");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

async function connectToDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to db", error);
  }
}

module.exports = connectToDB;
