import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiMail, FiLock, FiUser, FiCheckCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { registerAsync, clearError } from "../store/slices/authSlice";
import logo from "../assets/HIsab_logo.png";

const perks = ["Unlimited clients & projects","Smart invoicing with auto-billing","Real-time balance tracking","Free 14-day trial"];
const Spinner = () => (<svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>);

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name:"", email:"", password:"", confirmPassword:"" });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => { if (isAuthenticated) navigate("/app/dashboard"); }, [isAuthenticated, navigate]);
  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setValidationError(""); };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setValidationError("Passwords do not match"); return; }
    if (formData.password.length < 6) { setValidationError("Password must be at least 6 characters"); return; }
    dispatch(registerAsync({ name: formData.name, email: formData.email, password: formData.password }));
  };

  const inp = "w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all";

  return (
    <div className="min-h-screen flex bg-[#e3e4e6]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#1a1f36] relative overflow-hidden flex-col">
        <div className="absolute top-[-80px] left-[-60px] w-72 h-72 rounded-full bg-[#a9fd6e]/10 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-40px] w-96 h-96 rounded-full bg-[#2e4ed2]/20 blur-3xl" />
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <Link to="/">
            <img src={logo} alt="Hisab Pakka" className="h-14 w-auto" />
          </Link>
          <div className="flex-1 flex flex-col justify-center">
            <span className="bg-[#a9fd6e]/20 text-[#a9fd6e] text-xs font-semibold px-3 py-1 rounded-full tracking-wide inline-flex w-fit mb-3">Free to start</span>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">Start Billing<br/>Smarter Today</h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">Join thousands of freelancers who trust Hisab Pakka for their billing needs.</p>
            <ul className="space-y-3">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#a9fd6e]/20 flex items-center justify-center flex-shrink-0"><FiCheckCircle size={13} className="text-[#a9fd6e]"/></span>
                  <span className="text-white/75 text-sm">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-white/10 pt-6 flex gap-8">
            {[['10k+','Users'],['₹50Cr+','Invoiced'],['4.9★','Rating']].map(([v,l]) => (
              <div key={l}><p className="text-white font-bold text-lg">{v}</p><p className="text-white/40 text-xs">{l}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/">
              <img src={logo} alt="Hisab Pakka" className="h-10 w-auto" />
            </Link>
          </div>

          {/* white card */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[#1a1f36]">Create your account</h2>
              <p className="text-slate-400 text-sm mt-1">Get started for free, no credit card required</p>
            </div>

            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{validationError || error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label:"Full Name", name:"name", type:"text", icon:FiUser, placeholder:"John Doe" },
                { label:"Email Address", name:"email", type:"email", icon:FiMail, placeholder:"you@example.com" },
              ].map(({ label, name, type, icon: Icon, placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                    <input type={type} name={name} value={formData[name]} onChange={handleChange} required placeholder={placeholder} className={inp}/>
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required placeholder="Min. 6 characters" className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#2e4ed2]/30 focus:border-[#2e4ed2] transition-all"/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <FaEyeSlash size={15}/> : <FaEye size={15}/>}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" className={inp}/>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#2e4ed2]"/>
                <span className="text-sm text-slate-500">I agree to the <a href="#" className="text-[#2e4ed2] font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-[#2e4ed2] font-semibold hover:underline">Privacy Policy</a></span>
              </label>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm">
                {loading ? <><Spinner/> Creating account...</> : 'Create Account'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#2e4ed2] hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
