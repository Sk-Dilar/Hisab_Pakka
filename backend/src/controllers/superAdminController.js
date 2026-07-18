import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createPasswordResetToken } from "../utils/passwordReset.js";

// Login - single-owner credential check against env vars
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (
      email !== process.env.SUPERADMIN_EMAIL ||
      password !== process.env.SUPERADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ role: "superadmin", email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      admin: { email },
    });
  } catch (error) {
    console.error("SuperAdmin Login Error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// List all platform users with their pending-reset status
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "name email phone plan resetPasswordExpires createdAt",
    );

    const result = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      plan: user.plan,
      createdAt: user.createdAt,
      hasPendingReset: Boolean(
        user.resetPasswordExpires && user.resetPasswordExpires > Date.now(),
      ),
    }));

    res.status(200).json({ users: result });
  } catch (error) {
    console.error("SuperAdmin List Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// Generate a fresh reset link for a user, to be read out to them (e.g. over a call)
export const generateResetLink = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { resetLink, expiresAt } = await createPasswordResetToken(user);

    res.status(200).json({ resetLink, expiresAt });
  } catch (error) {
    console.error("SuperAdmin Generate Reset Link Error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate reset link", error: error.message });
  }
};
