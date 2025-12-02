import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Building2, Lock, Mail, ChevronRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form.emailOrUsername, form.password);
      navigate("/profile");
    } catch (error) {
      alert("Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2  from-white/10 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1200/1600')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* <Building2 className="w-10 h-10" /> */}
              <div>
                <h1 className="text-3xl font-light tracking-tight">SAIMR</h1>
                <p className="text-sm text-white/60 tracking-widest">GROUPS</p>
              </div>
            </div>
          </div>

          {/* Middle Content */}
          <div className="space-y-6 max-w-lg">
            <div className="space-y-2">
              <div className="w-16 h-px bg-white/30" />
              <h2 className="text-4xl xl:text-5xl font-light leading-tight">
                Your Gateway to<br />Premium Real Estate
              </h2>
            </div>
            <p className="text-white/70 text-lg leading-relaxed">
              Access exclusive property listings, manage your investments, 
              and connect with Bengaluru's most trusted real estate partner.
            </p>

            {/* Features */}
            <div className="space-y-3 pt-4">
              {[
                "Exclusive Property Access",
                "Investment Portfolio Management",
                "Real-time Market Updates",
                "Dedicated Support Team"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="text-white/50 text-sm">
            <p>Premium Real Estate Solutions</p>
            <p className="text-white/30">Bengaluru, Karnataka</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <Building2 className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-light tracking-tight">SAIMR GROUPS</h1>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl lg:text-4xl font-light">Welcome Back</h2>
            <p className="text-white/60">Sign in to access your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Field */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  name="emailOrUsername"
                  placeholder="Enter your email or username"
                  onChange={handleChange}
                  value={form.emailOrUsername}
                  className="w-full bg-white/5 border border-white/10 rounded-none px-12 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  value={form.password}
                  className="w-full bg-white/5 border border-white/10 rounded-none px-12 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  required
                />
              </div>
            </div>

       
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full bg-white text-black py-4 rounded-none hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                "Signing In..."
              ) : (
                <>
                  Sign In
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black px-4 text-white/50">
                  New to SAIMR Groups?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <button
              type="button"
               onClick={() => navigate("/register")}
              className="w-full border border-white/20 text-white py-4 rounded-none hover:bg-white/5 transition-all duration-300 font-medium"
            >
              Create an Account
            </button>
          </form>

          {/* Footer Links */}

        </div>
      </div>
    </div>
  );
}