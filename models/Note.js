// ======================================================
// IMPORTS
// ======================================================

import mongoose from "mongoose";

// ======================================================
// CONTRIBUTION SCHEMA
// ======================================================

const contributionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Contribution content is required"],
      trim: true,
      minlength: [3, "Contribution must be at least 3 characters long"],
      maxlength: [5000, "Contribution must be at most 5000 characters long"],
    },

    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Contribution author is required"],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

// ======================================================
// ATTACHMENT SCHEMA
// ======================================================

const attachmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "audio"],
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    data: {
      type: Buffer,
      required: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

// ======================================================
// NOTE SCHEMA
// ======================================================

const noteSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // Note Content
    // --------------------------------------------------

    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      minlength: [3, "Note title must be at least 3 characters long"],
      maxlength: [150, "Note title must be at most 150 characters long"],
    },

    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
      minlength: [10, "Note content must be at least 10 characters long"],
      maxlength: [5000, "Note content must be at most 5000 characters long"],
    },

    // --------------------------------------------------
    // Ownership
    // --------------------------------------------------

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Note owner is required"],
    },

    // --------------------------------------------------
    // Publishing
    // --------------------------------------------------

    isPublished: {
      type: Boolean,
      default: false,
    },

    // --------------------------------------------------
    // Community Contributions
    // --------------------------------------------------

    contributions: [contributionSchema],

    // --------------------------------------------------
    // Attachments
    // --------------------------------------------------

    attachments: [attachmentSchema],
  },
  {
    timestamps: true,
  },
);

// ======================================================
// MODEL
// ======================================================

const Note = mongoose.model("Note", noteSchema);

export default Note;
