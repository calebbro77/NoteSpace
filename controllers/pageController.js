// ======================================================
// IMPORTS
// ======================================================

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import Note from "../models/Note.js";

import {
  sanitizeNoteContent,
  getPlainText,
  createNotePreview,
  removeUnusedAttachments,
} from "../utils/noteHelpers.js";

// ======================================================
// PUBLIC PAGES
// ======================================================

const showHome = (req, res) => {
  res.render("index");
};

const showLogin = (req, res) => {
  res.render("login");
};

const showRegister = (req, res) => {
  res.render("register");
};

// ======================================================
// AUTHENTICATION
// ======================================================

// ------------------------------------------------------
// Register
// ------------------------------------------------------

const registerFromWebsite = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).render("register", {
        error: "Username or email already in use",
      });
    }

    await User.create({
      username,
      email,
      password,
    });

    return res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------
// Login
// ------------------------------------------------------

const loginFromWebsite = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(401).render("login", {
        error: "Invalid username or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).render("login", {
        error: "Invalid username or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).render("login", {
        error: "User account is inactive",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------
// Logout
// ------------------------------------------------------

const logoutFromWebsite = (req, res) => {
  res.clearCookie("token");

  return res.redirect("/");
};

// ======================================================
// DASHBOARD
// ======================================================

const showDashboard = async (req, res, next) => {
  try {
    const notes = await Note.find({
      owner: req.user.userId,
    }).sort({
      updatedAt: -1,
    });

    const notesWithPreviews = notes.map((note) => ({
      ...note.toObject(),

      preview: createNotePreview(note.content),
    }));

    res.render("dashboard", {
      username: req.user.username,
      notes: notesWithPreviews,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// CREATE NOTE
// ======================================================

// ------------------------------------------------------
// Show Create Note page
// ------------------------------------------------------

const showCreateNote = (req, res) => {
  res.render("createNote", {
    error: null,

    formData: {
      title: "",
      content: "",
    },
  });
};

// ------------------------------------------------------
// Create Note
// ------------------------------------------------------

const createNoteFromWebsite = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const sanitizedContent = sanitizeNoteContent(content);

    const plainTextContent = getPlainText(sanitizedContent);

    // Validate the text the user can actually see,
    // rather than counting HTML markup.
    if (plainTextContent.length < 10) {
      return res.status(400).render("createNote", {
        error: "Note content must contain at least 10 characters of text.",

        formData: {
          title,
          content: sanitizedContent,
        },
      });
    }

    await Note.create({
      title,
      content: sanitizedContent,
      owner: req.user.userId,
    });

    return res.redirect("/dashboard");
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (validationError) => validationError.message,
      );

      return res.status(400).render("createNote", {
        error: messages.join(", "),

        formData: {
          title: req.body.title || "",

          // Never send unsanitized HTML
          // back into the rich-text editor.
          content: sanitizeNoteContent(req.body.content || ""),
        },
      });
    }

    next(error);
  }
};

// ======================================================
// VIEW NOTE
// ======================================================

const showNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("owner", "username")
      .populate("contributions.contributor", "username");

    if (!note) {
      return res.status(404).render("error", {
        message: "Note not found",
      });
    }

    const isOwner = note.owner._id.toString() === req.user.userId;

    if (!isOwner && !note.isPublished) {
      return res.status(403).render("error", {
        message: "You do not have permission to view this note",
      });
    }

    res.render("note", {
      note,
      isOwner,
      username: req.user.username,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// EDIT / UPDATE NOTE
// ======================================================

// ------------------------------------------------------
// Show Edit page
// ------------------------------------------------------

const showEditNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).render("error", {
        message: "Note not found",
      });
    }

    if (note.owner.toString() !== req.user.userId) {
      return res.status(403).render("error", {
        message: "You are not authorized to edit this note",
      });
    }

    res.render("editNote", {
      note,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------
// Update Note
// ------------------------------------------------------

const updateNoteFromWebsite = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).render("error", {
        message: "Note not found",
      });
    }

    if (note.owner.toString() !== req.user.userId) {
      return res.status(403).render("error", {
        message: "You are not authorized to edit this note",
      });
    }

    // Sanitize the submitted Quill HTML.
    const sanitizedContent = sanitizeNoteContent(req.body.content);

    // Validate visible text instead of HTML length.
    const plainTextContent = getPlainText(sanitizedContent);

    if (plainTextContent.length < 10) {
      return res.status(400).render("editNote", {
        note: {
          ...note.toObject(),

          title: req.body.title || "",

          content: sanitizedContent,
        },

        error: "Note content must contain at least 10 characters of text.",
      });
    }

    // Update the actual note.
    note.title = req.body.title;
    note.content = sanitizedContent;

    // Remove images that are no longer referenced
    // by the saved rich-text content.
    removeUnusedAttachments(note, sanitizedContent);

    await note.save();

    return res.redirect(`/notes/${note._id}`);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).render("editNote", {
        note: {
          _id: req.params.id,

          title: req.body.title || "",

          content: sanitizeNoteContent(req.body.content || ""),
        },

        error: Object.values(error.errors)
          .map((validationError) => validationError.message)
          .join(". "),
      });
    }

    next(error);
  }
};

// ======================================================
// DELETE NOTE
// ======================================================

const deleteNoteFromWebsite = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).render("error", {
        message: "Note not found",
      });
    }

    if (note.owner.toString() !== req.user.userId) {
      return res.status(403).render("error", {
        message: "You are not authorized to delete this note",
      });
    }

    // Attachments are embedded inside the Note,
    // so deleting the Note removes them as well.
    await note.deleteOne();

    return res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

// ======================================================
// PUBLISHING / COMMUNITY
// ======================================================

// ------------------------------------------------------
// Publish Note
// ------------------------------------------------------

const publishNoteFromWebsite = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).render("error", {
        message: "Note not found",
      });
    }

    if (note.owner.toString() !== req.user.userId) {
      return res.status(403).render("error", {
        message: "You are not authorized to publish this note",
      });
    }

    note.isPublished = true;

    await note.save();

    return res.redirect(`/notes/${note._id}`);
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------
// Explore Published Notes
// ------------------------------------------------------

const showExplore = async (req, res, next) => {
  try {
    const notes = await Note.find({
      isPublished: true,
    })
      .populate("owner", "username")
      .sort({
        updatedAt: -1,
      });

    const notesWithPreviews = notes.map((note) => ({
      ...note.toObject(),

      preview: createNotePreview(note.content),
    }));

    res.render("explore", {
      notes: notesWithPreviews,
      username: req.user.username,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// CONTRIBUTIONS
// ======================================================

const addContributionFromWebsite = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).render("error", {
        message: "Note not found",
      });
    }

    if (!note.isPublished) {
      return res.status(403).render("error", {
        message: "Contributions can only be added to published notes",
      });
    }

    note.contributions.push({
      contributor: req.user.userId,
      content: req.body.content,
    });

    await note.save();

    return res.redirect(`/notes/${note._id}`);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).render("error", {
        message: Object.values(error.errors)
          .map((validationError) => validationError.message)
          .join(". "),
      });
    }

    next(error);
  }
};

// ======================================================
// IMAGE ATTACHMENTS
// ======================================================

// ------------------------------------------------------
// Upload image
// ------------------------------------------------------

const uploadNoteImage = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // Only the owner can add images to the
    // original note.
    if (note.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only add images to your own notes",
      });
    }

    // Limit each note to five image attachments.
    const imageCount = note.attachments.filter(
      (attachment) => attachment.type === "image",
    ).length;

    if (imageCount >= 5) {
      return res.status(400).json({
        message: "A note can contain a maximum of 5 images.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    note.attachments.push({
      type: "image",

      filename: req.file.originalname,

      mimeType: req.file.mimetype,

      size: req.file.size,

      data: req.file.buffer,
    });

    await note.save();

    const attachment = note.attachments[note.attachments.length - 1];

    return res.status(201).json({
      message: "Image uploaded successfully",

      attachmentId: attachment._id,

      url: `/notes/${note._id}/attachments/${attachment._id}`,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------
// Retrieve protected attachment
// ------------------------------------------------------

const getNoteAttachment = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return res.status(404).send("Note not found");
    }

    const isOwner = note.owner.toString() === req.user.userId;

    // Private attachments are only accessible
    // to the note owner.
    if (!isOwner && !note.isPublished) {
      return res.status(403).send("You do not have access to this attachment");
    }

    const attachment = note.attachments.id(req.params.attachmentId);

    if (!attachment) {
      return res.status(404).send("Attachment not found");
    }

    if (attachment.type !== "image") {
      return res.status(400).send("Attachment is not an image");
    }

    // Tell the browser what kind of image
    // is being returned.
    res.set("Content-Type", attachment.mimeType);

    res.set("Content-Length", attachment.size);

    return res.send(attachment.data);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// EXPORTS
// ======================================================

export {
  // Public pages
  showHome,
  showLogin,
  showRegister,

  // Authentication
  registerFromWebsite,
  loginFromWebsite,
  logoutFromWebsite,

  // Dashboard
  showDashboard,

  // Notes
  showCreateNote,
  createNoteFromWebsite,
  showNote,
  showEditNote,
  updateNoteFromWebsite,
  deleteNoteFromWebsite,

  // Publishing / community
  publishNoteFromWebsite,
  showExplore,

  // Contributions
  addContributionFromWebsite,

  // Attachments
  uploadNoteImage,
  getNoteAttachment,
};
