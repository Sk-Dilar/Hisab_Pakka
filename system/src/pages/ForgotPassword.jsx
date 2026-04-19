import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPasswordAsync,
  resetPasswordAsync,
  clearError,
  clearSuccessMessage,
} from "../store/slices/authSlice";

function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { loading, error, isAuthenticated, successMessage } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError("");
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.email) {
      setValidationError("Please enter your email address");
      return;
    }

    const result = await dispatch(
      forgotPasswordAsync({ email: formData.email }),
    );

    if (forgotPasswordAsync.fulfilled.match(result)) {
      setFormData({ ...formData, email: "" });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!token) {
      setValidationError("Invalid reset link");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    const result = await dispatch(
      resetPasswordAsync({
        token,
        newPassword: formData.newPassword,
      }),
    );

    if (resetPasswordAsync.fulfilled.match(result)) {
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  // If token is present in URL, show reset password form
  const isResetMode = !!token;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-success relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">HP</span>
            </div>
            <span className="text-2xl font-bold">Hisab Pakka</span>
          </Link>
          <h1 className="text-5xl font-bold mb-6">
            {isResetMode ? "Reset Your Password" : "Forgot Password?"}
          </h1>
          <p className="text-xl text-white/90 mb-8">
            {isResetMode
              ? "Create a new secure password for your account."
              : "No worries! Enter your email and we'll send you a link to reset your password."}
          </p>
          <ul className="space-y-4">
            {[
              "Secure password reset",
              "Email verification required",
              "Get back to billing fast",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-accent flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">HP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Hisab Pakka
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isResetMode ? "Reset Password" : "Forgot Password"}
            </h2>
            <p className="text-gray-600">
              {isResetMode
                ? "Enter your new password"
                : "Enter your email to receive a reset link"}
            </p>
          </div>

          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {validationError || error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
              {successMessage}
            </div>
          )}

          {isResetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendResetLink} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending Reset Link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
