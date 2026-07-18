import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiMail, FiLock } from "react-icons/fi";
import { useLoginMutation } from "../store/api/adminApiSlice";
import logo from "../assets/HIsab_logo.png";

const Spinner = () => (
  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login(formData).unwrap();
      localStorage.setItem("adminToken", result.token);
      localStorage.setItem("adminUser", JSON.stringify(result.admin));
      navigate("/");
    } catch (err) {
      setError(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e3e4e6] px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <img src={logo} alt="Hisab Pakka" className="h-12 w-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-[#1a1f36]">Superadmin Login</h2>
            <p className="text-slate-400 text-sm mt-1">Platform management access</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all"
                />
              </div>
            </div>

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

            <button
              type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm mt-2"
            >
              {isLoading ? <><Spinner /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
