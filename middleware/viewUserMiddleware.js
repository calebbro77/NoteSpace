// ======================================================
// IMPORTS
// ======================================================

import jwt from "jsonwebtoken";

// ======================================================
// VIEW USER MIDDLEWARE
// ======================================================

// Makes the authenticated user available to all
// EJS views through res.locals.user.

const setViewUser = (req, res, next) => {
  res.locals.user = null;

  const token = req.cookies.token;

  // Visitors without a token are treated
  // as unauthenticated users.
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.locals.user = decoded;
  } catch (error) {
    // Remove invalid or expired authentication cookies.
    res.clearCookie("token");
  }

  next();
};

export default setViewUser;
