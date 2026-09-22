// ======================================================
// IMPORTS
// ======================================================

import express from "express";

import { registerUser, loginUser } from "../controllers/authController.js";

// ======================================================
// ROUTER
// ======================================================

const router = express.Router();

// ======================================================
// AUTH ROUTES
// ======================================================

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

export default router;
