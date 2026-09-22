// ======================================================
// IMPORTS
// ======================================================

import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getNotes,
  getNoteById,
  getPublishedNotes,
  createNote,
  updateNote,
  deleteNote,
  publishNote,
  addContribution,
} from "../controllers/noteController.js";

// ======================================================
// ROUTER
// ======================================================

const router = express.Router();

// ======================================================
// NOTE COLLECTION ROUTES
// ======================================================

// GET /api/notes
router.get("/", protect, getNotes);

// POST /api/notes
router.post("/", protect, createNote);

// ======================================================
// PUBLISHED NOTES
// ======================================================

// GET /api/notes/published
router.get("/published", protect, getPublishedNotes);

// ======================================================
// NOTE ACTIONS
// ======================================================

// PATCH /api/notes/:id/publish
router.patch("/:id/publish", protect, publishNote);

// POST /api/notes/:id/contributions
router.post("/:id/contributions", protect, addContribution);

// ======================================================
// INDIVIDUAL NOTE ROUTES
// ======================================================

// GET /api/notes/:id
router.get("/:id", protect, getNoteById);

// PUT /api/notes/:id
router.put("/:id", protect, updateNote);

// DELETE /api/notes/:id
router.delete("/:id", protect, deleteNote);

export default router;
