import crypto from "crypto";

// Generates a fresh password reset token for a user, persists it, and
// returns the values needed to build a reset link (1 hour expiry).
export const createPasswordResetToken = async (user) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000);

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = expiresAt;
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/forgot-password?token=${resetToken}`;

  return { resetToken, resetLink, expiresAt };
};
