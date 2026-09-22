// ======================================================
// IMPORTS
// ======================================================

import express from "express";

import protectPage from "../middleware/pageAuthMiddleware.js";
import uploadImage from "../middleware/uploadMiddleware.js";

import {
  showHome,
  showLogin,
  showRegister,
  registerFromWebsite,
  loginFromWebsite,
  logoutFromWebsite,
  showDashboard,
  showCreateNote,
  createNoteFromWebsite,
  showNote,
  showEditNote,
  updateNoteFromWebsite,
  deleteNoteFromWebsite,
  publishNoteFromWebsite,
  showExplore,
  addContributionFromWebsite,
  uploadNoteImage,
  getNoteAttachment,
} from "../controllers/pageController.js";

// ======================================================
// ROUTER
// ======================================================

const router = express.Router();

// ======================================================
// PUBLIC PAGES
// ======================================================

router.get("/", showHome);

router.get("/login", showLogin);

router.post("/login", loginFromWebsite);

router.get("/register", showRegister);

router.post("/register", registerFromWebsite);

// ======================================================
// AUTHENTICATED PAGES
// ======================================================

router.get("/dashboard", protectPage, showDashboard);

router.get("/explore", protectPage, showExplore);

// ======================================================
// CREATE NOTE
// ======================================================

router.get("/notes/new", protectPage, showCreateNote);

router.post("/notes/new", protectPage, createNoteFromWebsite);

// ======================================================
// EDIT NOTE
// ======================================================

router.get("/notes/:id/edit", protectPage, showEditNote);

router.post("/notes/:id/edit", protectPage, updateNoteFromWebsite);

// ======================================================
// NOTE ACTIONS
// ======================================================

router.post("/notes/:id/publish", protectPage, publishNoteFromWebsite);

router.post(
  "/notes/:id/contributions",
  protectPage,
  addContributionFromWebsite,
);

router.post("/notes/:id/delete", protectPage, deleteNoteFromWebsite);

// ======================================================
// ATTACHMENTS
// ======================================================

router.post(
  "/notes/:id/attachments/images",
  protectPage,
  uploadImage.single("image"),
  uploadNoteImage,
);

router.get(
  "/notes/:noteId/attachments/:attachmentId",
  protectPage,
  getNoteAttachment,
);

// ======================================================
// VIEW NOTE
// ======================================================

router.get("/notes/:id", protectPage, showNote);

// ======================================================
// LOGOUT
// ======================================================

router.post("/logout", logoutFromWebsite);

export default router;
