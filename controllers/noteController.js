// ======================================================
// IMPORTS
// ======================================================

import Note from "../models/Note.js";

import {
  sanitizeNoteContent,
  getPlainText,
  removeUnusedAttachments,
} from "../utils/noteHelpers.js";

// ======================================================
// RESPONSE HELPERS
// ======================================================

// Remove binary attachment data from API responses.
// Images are served separately through attachment routes.

const prepareNoteResponse = (note) => {
  const noteObject = note.toObject();

  noteObject.attachments = noteObject.attachments.map((attachment) => {
    const { data, ...attachmentWithoutData } = attachment;

    return attachmentWithoutData;
  });

  return noteObject;
};

// ======================================================
// GET USER'S NOTES
// ======================================================

const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({
      owner: req.user.userId,
    })
      .select("-attachments.data")
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET NOTE BY ID
// ======================================================

const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).select("-attachments.data");

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    const isOwner = note.owner.toString() === req.user.userId;

    if (!isOwner && !note.isPublished) {
      return res.status(403).json({
        message: "You are not authorized to access this note",
      });
    }

    return res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// CREATE NOTE
// ======================================================

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // Use the same sanitization as the website.
    const sanitizedContent = sanitizeNoteContent(content);

    const plainTextContent = getPlainText(sanitizedContent);

    // Validate visible content rather than HTML length.
    if (plainTextContent.length < 10) {
      return res.status(400).json({
        message: "Note content must contain at least 10 characters of text.",
      });
    }

    const note = await Note.create({
      title,
      content: sanitizedContent,
      owner: req.user.userId,
    });

    return res.status(201).json(prepareNoteResponse(note));
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE NOTE
// ======================================================

const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (note.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to update this note",
      });
    }

    const { title, content } = req.body;

    const sanitizedContent = sanitizeNoteContent(content);

    const plainTextContent = getPlainText(sanitizedContent);

    if (plainTextContent.length < 10) {
      return res.status(400).json({
        message: "Note content must contain at least 10 characters of text.",
      });
    }

    note.title = title;
    note.content = sanitizedContent;

    // Keep attachment cleanup consistent with
    // updates made through the website.
    removeUnusedAttachments(note, sanitizedContent);

    await note.save();

    return res.status(200).json(prepareNoteResponse(note));
  } catch (error) {
    next(error);
  }
};

// ======================================================
// DELETE NOTE
// ======================================================

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (note.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this note",
      });
    }

    await note.deleteOne();

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// PUBLISH NOTE
// ======================================================

const publishNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (note.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to publish this note",
      });
    }

    note.isPublished = true;

    await note.save();

    return res.status(200).json({
      message: "Note published successfully",
      note: prepareNoteResponse(note),
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET PUBLISHED NOTES
// ======================================================

const getPublishedNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({
      isPublished: true,
    })
      .select("-attachments.data")
      .populate("owner", "username")
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADD CONTRIBUTION
// ======================================================

const addContribution = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (!note.isPublished) {
      return res.status(403).json({
        message: "You can only contribute to published notes",
      });
    }

    const { content } = req.body;

    note.contributions.push({
      content,
      contributor: req.user.userId,
    });

    await note.save();

    return res.status(201).json({
      message: "Contribution added successfully",
      note: prepareNoteResponse(note),
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// EXPORTS
// ======================================================

export {
  getNotes,
  getNoteById,
  getPublishedNotes,
  createNote,
  updateNote,
  deleteNote,
  publishNote,
  addContribution,
};
