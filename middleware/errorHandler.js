// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

const errorHandler = (error, req, res, next) => {
  // Log the full error for development/debugging.
  console.error(error);

  // Determine whether this request belongs to the API.
  const isApiRequest = req.originalUrl.startsWith("/api/");


  // ====================================================
  // FILE UPLOAD ERRORS
  // ====================================================

  // Multer uses this error code when a file exceeds
  // the configured upload size limit.
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message:
        "Image is too large. Maximum file size is 2 MB.",
    });
  }

  // Handles rejected file types from uploadMiddleware.js.
  if (
    error.message ===
    "Only JPEG, PNG, WebP, and GIF images are allowed."
  ) {
    return res.status(400).json({
      message:
        "Only JPEG, PNG, WebP, and GIF images are allowed.",
    });
  }


  // ====================================================
  // MONGOOSE VALIDATION ERRORS
  // ====================================================

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",

      errors: Object.values(
        error.errors
      ).map(
        (validationError) =>
          validationError.message
      ),
    });
  }


  // ====================================================
  // INVALID MONGODB OBJECT ID
  // ====================================================

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }


  // ====================================================
  // DETERMINE STATUS CODE
  // ====================================================

  const statusCode =
    error.status || error.statusCode || 500;


  // ====================================================
  // API ERROR RESPONSE
  // ====================================================

  if (isApiRequest) {
    return res.status(statusCode).json({
      message:
        statusCode === 500
          ? "Internal server error"
          : error.message,
    });
  }


  // ====================================================
  // WEBSITE ERROR RESPONSE
  // ====================================================

  return res.status(statusCode).render("error", {
    message:
      statusCode === 500
        ? "Something went wrong."
        : error.message,
  });
};

export default errorHandler;