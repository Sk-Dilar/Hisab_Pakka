const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  authController.resetPassword,
);
router.post("/update-profile", protect, authController.updateProfile);

module.exports = router;
