import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiMail, FiLock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { forgotPasswordAsync, resetPasswordAsync, clearError, clearSuccessMessage } from "../store/slices/authSlice";
import logo from "../assets/HIsab_logo.png";

const perks = ["Secure password reset", "Email verification required", "Get back to billing fast"];
const Spinner = () => (<svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>);

function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const isResetMode = !!token;

  const [formData, setFormData] = useState({ email: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { loading, error, isAuthenticated, successMessage } = useSelector((s) => s.auth);

  useEffect(() => { if (isAuthenticated) navigate("/app/dashboard"); }, [isAuthenticated, navigate]);
  useEffect(() => () => { dispatch(clearError()); dispatch(clearSuccessMessage()); }, [dispatch]);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setValidationError(""); };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!formData.email) { setValidationError("Please enter your email address"); return; }
    const result = await dispatch(forgotPasswordAsync({ email: formData.email }));
    if (forgotPasswordAsync.fulfilled.match(result)) setFormData({ ...formData, email: "" });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token) { setValidationError("Invalid reset link"); return; }
    if (formData.newPassword !== formData.confirmPassword) { setValidationError("Passwords do not match"); return; }
    if (formData.newPassword.length < 6) { setValidationError("Password must be at least 6 characters"); return; }
    const result = await dispatch(resetPasswordAsync({ token, newPassword: formData.newPassword }));
    if (resetPasswordAsync.fulfilled.match(result)) setTimeout(() => navigate("/login"), 2000);
  };

  const inputCls = "w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all";

  return (
    <div className="min-h-screen flex bg-[#e3e4e6]">

      {/* ── Left panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#1a1f36] relative overflow-hidden flex-col">
        <div className="absolute top-[-80px] left-[-60px] w-72 h-72 rounded-full bg-[#a9fd6e]/10 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-40px] w-96 h-96 rounded-full bg-[#2e4ed2]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* logo — full size, natural colors on dark bg */}
          <Link to="/">
            <img src={logo} alt="Hisab Pakka" className="h-14 w-auto" />
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <span className="bg-[#a9fd6e]/20 text-[#a9fd6e] text-xs font-semibold px-3 py-1 rounded-full tracking-wide inline-flex w-fit mb-3">
              Account recovery
            </span>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              {isResetMode ? "Reset Your\nPassword" : "Forgot\nPassword?"}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
              {isResetMode
                ? "Create a new secure password for your account."
                : "No worries! Enter your email and we'll send you a reset link."}
            </p>
            <ul className="space-y-3">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#a9fd6e]/20 flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle size={13} className="text-[#a9fd6e]" />
                  </span>
                  <span className="text-white/75 text-sm">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-white/10 pt-6 flex gap-8">
            {[['256-bit','Encryption'],['< 2 min','Reset time'],['24/7','Support']].map(([v, l]) => (
              <div key={l}><p className="text-white font-bold text-lg">{v}</p><p className="text-white/40 text-xs">{l}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/">
              <img src={logo} alt="Hisab Pakka" className="h-10 w-auto" />
            </Link>
          </div>

          {/* white form card */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[#1a1f36]">
                {isResetMode ? "Reset Password" : "Forgot Password"}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {isResetMode ? "Enter your new password below" : "Enter your email to receive a reset link"}
              </p>
            </div>

            {/* alerts */}
            {(error || validationError) && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                <FiAlertCircle size={15} /> {validationError || error}
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5">
                <FiCheckCircle size={15} /> {successMessage}
              </div>
            )}

            {isResetMode ? (
              /* ── Reset mode ── */
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                    <input type={showPassword ? "text" : "password"} name="newPassword" value={formData.newPassword}
                      onChange={handleChange} required placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <FaEyeSlash size={15}/> : <FaEye size={15}/>}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword}
                      onChange={handleChange} required placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all"/>
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <FaEyeSlash size={15}/> : <FaEye size={15}/>}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm">
                  {loading ? <><Spinner/> Resetting...</> : "Reset Password"}
                </button>
              </form>
            ) : (
              /* ── Forgot mode ── */
              <form onSubmit={handleSendResetLink} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      required placeholder="you@example.com" className={inputCls}/>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm">
                  {loading ? <><Spinner/> Sending...</> : "Send Reset Link"}
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-sm text-slate-400">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-[#2e4ed2] hover:underline">Back to Login</Link>
            </p>
          </div>
          {/* end white card */}

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
