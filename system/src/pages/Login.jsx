import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiMail, FiLock, FiCheckCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, clearError } from "../store/slices/authSlice";
import logo from "../assets/HIsab_logo.png";

const features = [
  "Check client balances",
  "Send new invoices",
  "Record payments",
  "View reports",
];

const Spinner = () => (
  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

function Login() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => { if (isAuthenticated) navigate("/app/dashboard"); }, [isAuthenticated, navigate]);
  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const handleChange  = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit  = (e) => { e.preventDefault(); dispatch(loginAsync(formData)); };

  return (
    <div className="min-h-screen flex bg-[#e3e4e6]">

      {/* ── Left panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#1a1f36] relative overflow-hidden flex-col">
        {/* decorative blobs */}
        <div className="absolute top-[-80px] left-[-60px] w-72 h-72 rounded-full bg-[#a9fd6e]/10 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-40px] w-96 h-96 rounded-full bg-[#2e4ed2]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* logo — full size, natural colors on dark bg */}
          <Link to="/">
            <img src={logo} alt="Hisab Pakka" className="h-20 w-auto" />
          </Link>

          {/* main copy */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-2 inline-flex">
              <span className="bg-[#a9fd6e]/20 text-[#a9fd6e] text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
                Your billing partner
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mt-3 mb-4">
              Welcome<br />Back!
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
              Your clients and invoices are waiting. Let's get you back to work.
            </p>

            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#a9fd6e]/20 flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle size={13} className="text-[#a9fd6e]" />
                  </span>
                  <span className="text-white/75 text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* bottom stat strip */}
          <div className="border-t border-white/10 pt-6 flex gap-8">
            {[['10k+', 'Freelancers'], ['₹50Cr+', 'Invoiced'], ['99.9%', 'Uptime']].map(([val, label]) => (
              <div key={label}>
                <p className="text-white font-bold text-lg">{val}</p>
                <p className="text-white/40 text-xs">{label}</p>
              </div>
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
              <h2 className="text-2xl font-extrabold text-[#1a1f36]">Sign in to your account</h2>
              <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all"
                  />
                </div>
              </div>

              {/* password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={formData.password}
                    onChange={handleChange} required placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>

              {/* remember / forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-[#2e4ed2]" />
                  <span className="text-sm text-slate-500">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold text-[#2e4ed2] hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* submit */}
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm mt-2"
              >
                {loading ? <><Spinner /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-[#2e4ed2] hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
          {/* end white card */}

        </div>
      </div>
    </div>
  );
}

export default Login;
