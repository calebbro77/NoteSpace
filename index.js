// ======================================================
// IMPORTS
// ======================================================

// Packages
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Database
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";

// Middleware
import setViewUser from "./middleware/viewUserMiddleware.js";
import errorHandler from "./middleware/errorHandler.js";

// ======================================================
// ENVIRONMENT & DATABASE
// ======================================================

dotenv.config();

connectDB();

// ======================================================
// EXPRESS APP
// ======================================================

const app = express();

const PORT = process.env.PORT || 5000;

// ======================================================
// VIEW ENGINE
// ======================================================

app.set("view engine", "ejs");

// ======================================================
// MIDDLEWARE
// ======================================================

// Request logging
app.use(morgan("dev"));

// Parse JSON request bodies
app.use(express.json());

// Parse HTML form submissions
app.use(
  express.urlencoded({
    extended: true,
  }),
);

// Parse cookies
app.use(cookieParser());

// Make authenticated user information
// available to EJS views.
app.use(setViewUser);

// Serve static files from /public
app.use(express.static("public"));

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// ======================================================
// WEBSITE ROUTES
// ======================================================

app.use("/", pageRoutes);

// ======================================================
// 404 - ROUTE NOT FOUND
// ======================================================

// Requests that reach this point did not
// match any registered route.
app.use((req, res, next) => {
  const error = new Error("Page not found.");
  error.status = 404;

  next(error);
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

// Error handling must remain after all routes.
app.use(errorHandler);

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
