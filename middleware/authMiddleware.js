// ======================================================
// IMPORTS
// ======================================================

import jwt from "jsonwebtoken";

// ======================================================
// API AUTHENTICATION
// ======================================================

const protect = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    // Require an Authorization header.
    if (!authorizationHeader) {
      return res.status(401).json({
        message: "Not authorized. No token provided.",
      });
    }

    // Expected format:
    // Authorization: Bearer <token>
    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Not authorized. Invalid token format.",
      });
    }

    // Verify the JWT and attach its payload
    // to the request for protected API routes.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("JWT verification error:", error.message);

    return res.status(401).json({
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

export default protect;
