// ======================================================
// IMPORTS
// ======================================================

import jwt from "jsonwebtoken";

// ======================================================
// PAGE AUTHENTICATION
// ======================================================

// Protects website routes that require authentication.
// Unlike the API middleware, website authentication
// uses the JWT stored in the token cookie.

const protectPage = (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Redirect unauthenticated visitors to login.
    if (!token) {
      return res.redirect("/login");
    }

    // Verify the JWT and make the authenticated
    // user available to protected page controllers.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    // Remove an invalid or expired token before
    // returning the visitor to the login page.
    res.clearCookie("token");

    return res.redirect("/login");
  }
};

export default protectPage;
