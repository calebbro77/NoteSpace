// ======================================================
// IMPORTS
// ======================================================

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../models/User.js";

// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check whether the username or email
    // is already associated with an account.
    const existingUser = await User.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already in use",
      });
    }

    // Password hashing is handled by the
    // pre-save middleware in the User model.
    const user = await User.create({
      username,
      email,
      password,
    });

    return res.status(201).json({
      message: "User registered successfully",

      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find the user by username.
    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Compare the submitted password with
    // the hashed password stored in MongoDB.
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Prevent inactive accounts from logging in.
    if (!user.isActive) {
      return res.status(403).json({
        message: "User account is inactive",
      });
    }

    // Create a JWT for authenticated API requests.
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

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// EXPORTS
// ======================================================

export { registerUser, loginUser };
