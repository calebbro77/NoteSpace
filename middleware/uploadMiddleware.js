// ======================================================
// IMPORTS
// ======================================================

import multer from "multer";

// ======================================================
// STORAGE
// ======================================================

// Store uploaded files in memory so they can be saved
// directly to MongoDB rather than the local filesystem.

const storage = multer.memoryStorage();

// ======================================================
// FILE TYPE VALIDATION
// ======================================================

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const fileFilter = (req, file, callback) => {
  if (allowedImageTypes.includes(file.mimetype)) {
    return callback(null, true);
  }

  return callback(
    new Error("Only JPEG, PNG, WebP, and GIF images are allowed."),
    false,
  );
};

// ======================================================
// IMAGE UPLOAD
// ======================================================

const uploadImage = multer({
  storage,
  fileFilter,

  limits: {
    // Maximum image size: 2 MB
    fileSize: 2 * 1024 * 1024,

    // Only one image may be uploaded per request.
    files: 1,
  },
});

export default uploadImage;
