// ======================================================
// IMPORTS
// ======================================================

import sanitizeHtml from "sanitize-html";

// ======================================================
// NOTE CONTENT HELPERS
// ======================================================

// ------------------------------------------------------
// Sanitize rich-text HTML
// ------------------------------------------------------
// Allows the formatting used by the Quill editor while
// removing potentially unsafe HTML.

const sanitizeNoteContent = (content = "") => {
  return sanitizeHtml(content, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "ol",
      "ul",
      "li",
      "a",
      "span",
      "img",
    ],

    allowedAttributes: {
      a: ["href", "target", "rel"],
      li: ["data-list"],
      span: ["class", "contenteditable"],
      img: ["src", "alt"],
    },

    allowedSchemes: ["http", "https", "mailto"],
  });
};

// ------------------------------------------------------
// Extract visible text
// ------------------------------------------------------
// Used for validation so HTML markup does not count
// toward the note's minimum text length.

const getPlainText = (html = "") => {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
};

// ------------------------------------------------------
// Create plain-text preview
// ------------------------------------------------------

const createNotePreview = (content = "") => {
  return content
    .replace(/<h[1-3][^>]*>/gi, "")
    .replace(/<\/h[1-3]>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*data-list="bullet"[^>]*>/gi, "• ")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ------------------------------------------------------
// Remove unused image attachments
// ------------------------------------------------------
// If an image is removed from the Quill document,
// remove its corresponding binary attachment from
// the Note document when the note is saved.

const removeUnusedAttachments = (note, content) => {
  const usedAttachmentIds = new Set();

  const imageRegex = /\/notes\/[^/]+\/attachments\/([a-fA-F0-9]{24})/g;

  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    usedAttachmentIds.add(match[1]);
  }

  note.attachments = note.attachments.filter((attachment) => {
    // Do not affect future non-image attachments.
    if (attachment.type !== "image") {
      return true;
    }

    return usedAttachmentIds.has(attachment._id.toString());
  });
};

// ======================================================
// EXPORTS
// ======================================================

export {
  sanitizeNoteContent,
  getPlainText,
  createNotePreview,
  removeUnusedAttachments,
};
