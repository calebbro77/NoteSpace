// ======================================================
// IMPORTS
// ======================================================

import mongoose from "mongoose";

// ======================================================
// DATABASE CONNECTION
// ======================================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);

    // Stop the application if the database
    // connection cannot be established.
    process.exit(1);
  }
};

export default connectDB;
