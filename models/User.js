// ======================================================
// IMPORTS
// ======================================================

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ======================================================
// USER SCHEMA
// ======================================================

const userSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // Username
    // --------------------------------------------------

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [50, "Username must be at most 50 characters long"],
    },

    // --------------------------------------------------
    // Email
    // --------------------------------------------------

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [5, "Email must be at least 5 characters long"],
      maxlength: [100, "Email must be at most 100 characters long"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    // --------------------------------------------------
    // Password
    // --------------------------------------------------

    password: {
      type: String,
      required: [true, "Password is required"],

      validate: {
        validator: function (value) {
          return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
        },

        message:
          "Password must be at least 8 characters long and contain at least one letter and one number",
      },
    },

    // --------------------------------------------------
    // Account Status
    // --------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ======================================================
// PASSWORD HASHING
// ======================================================

// Hash the password before saving a new password.
// Existing passwords are not re-hashed when unrelated
// user fields are changed.

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// ======================================================
// MODEL
// ======================================================

const User = mongoose.model("User", userSchema);

export default User;
