import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, User, Mail, Lock, Phone, 
  UserCircle, ChevronRight, Briefcase, Shield 
} from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const recaptchaRef = useRef();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    lastName: "",
    userType: "buyer",
    phoneNumber: "",
    gmail: "",
    password: "",
  });

  const [captchaToken, setCaptchaToken] = useState("");

  // Check if reCAPTCHA is loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.grecaptcha) {
        setCaptchaLoaded(true);
        console.log("reCAPTCHA loaded successfully");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (captchaError) setCaptchaError("");
  };

  const onCaptchaChange = (token) => {
    console.log("Captcha token received:", token);
    setCaptchaToken(token);
    if (captchaError) setCaptchaError("");
  };

  const onCaptchaExpired = () => {
    console.log("Captcha expired");
    setCaptchaToken("");
    setCaptchaError("Captcha expired. Please verify again.");
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

 // In your Register component, update the handleSubmit:

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  if (!formData.username || !formData.name || !formData.gmail || !formData.password) {
    alert("Please fill all required fields");
    return;
  }

  // Validate password length
  if (formData.password.length < 8) {
    alert("Password must be at least 8 characters long");
    return;
  }

  // Validate captcha
  if (!captchaToken) {
    setCaptchaError("Please complete the 'I'm not a robot' verification");
    return;
  }

  setIsLoading(true);
  setCaptchaError("");

  try {
    console.log("Registering with:", {
      username: formData.username,
      captchaTokenPresent: !!captchaToken
    });
    
    // Prepare registration data - all in one object
    const registrationData = {
      ...formData,
      captchaToken: captchaToken // This is crucial - include captchaToken in the object
    };
    
    // Call register with the single object
    const result = await register(registrationData);
    
    console.log("✅ Registration result:", result);
    
    alert("Registration successful! Redirecting to profile...");
    navigate("/profile");
  } catch (error) {
    console.error("Registration error details:", error);
    
    // Reset captcha on error
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setCaptchaToken("");
    }
    
    // Show specific error messages
    const errorMsg = error.message || "Registration failed";
    
    if (errorMsg.toLowerCase().includes("captcha") || 
        errorMsg.includes("robot") ||
        errorMsg.includes("security") ||
        errorMsg.includes("verification")) {
      setCaptchaError(errorMsg);
    } else {
      alert(errorMsg);
    }
  } finally {
    setIsLoading(false);
  }
};



  const userTypes = [
    { value: "buyer", label: "Buyer" },
    { value: "seller", label: "Seller" },
    { value: "builder", label: "Builder" },
    { value: "developer", label: "Developer" },
    { value: "agent", label: "Agent" },
    { value: "investor", label: "Investor" }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-white/10 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-black opacity-30" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-10 h-10 text-white" />
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
                Join India's Most<br />Trusted Real Estate<br />Network
              </h2>
            </div>
            <p className="text-white/70 text-lg leading-relaxed">
              Create your account to access premium property listings, exclusive investment 
              opportunities, and connect with verified buyers, sellers, and developers.
            </p>

            {/* Benefits */}
            <div className="space-y-4 pt-4">
              <p className="text-white/50 text-sm tracking-wider">WHY JOIN US</p>
              {[
                "Access to 10M+ Sq.Ft of Premium Properties",
                "Verified Listings & Secure Transactions",
                "Direct Connect with Developers & Builders",
                "Expert Investment Advisory"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="text-white/50 text-sm">
            <p>25+ Years of Excellence</p>
            <p className="text-white/30">Bengaluru, Karnataka</p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl space-y-8 py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <Building2 className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-light tracking-tight">SAIMR GROUPS</h1>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl lg:text-4xl font-light">Create Account</h2>
            <p className="text-white/60">Start your real estate journey with us</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide">Username *</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  name="username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-none px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Name Fields - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70 tracking-wide">First Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="name"
                    placeholder="First name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-none px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70 tracking-wide">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-none px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* User Type */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide">I am a *</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-none px-12 py-3.5 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                >
                  {userTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-black">
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70 tracking-wide">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="phoneNumber"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-none px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70 tracking-wide">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="gmail"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.gmail}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-none px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide">Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  name="password"
                  type="password"
                  placeholder="Create a strong password (min 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-none px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  required
                  minLength="8"
                />
              </div>
              <p className="text-xs text-white/40 mt-1">
                Must be at least 8 characters long with letters and numbers
              </p>
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 mt-1 bg-white/5 border border-white/20 rounded-sm flex-shrink-0 checked:bg-white checked:text-black"
                required
              />
              <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
                  className="text-white underline hover:text-white/80 transition-colors"
                >
                  Terms & Conditions
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => navigate("/privacy")}
                  className="text-white underline hover:text-white/80 transition-colors"
                >
                  Privacy Policy
                </button>
              </span>
            </label>

            {/* reCAPTCHA v2 Tickbox */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Shield className="w-4 h-4" />
                <span>Security Verification *</span>
                {!captchaLoaded && (
                  <span className="text-xs text-yellow-400 ml-2">
                    (Loading...)
                  </span>
                )}
              </div>
              
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LfNKx8sAAAAAN1BwpjlcY5iU5iS9JmNEaYHewXs"
                onChange={onCaptchaChange}
                onExpired={onCaptchaExpired}
                onErrored={() => {
                  console.error("reCAPTCHA error");
                  setCaptchaError("Security verification error. Please reload page.");
                }}
                theme="dark"
                className="[&>div>div]:mx-auto"
                size="normal"
              />
              
              {captchaError && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {captchaError}
                </p>
              )}
              
              <p className="text-xs text-white/40">
                This helps us prevent automated account creation. Please check "I'm not a robot"
              </p>
              
              {/* DEBUG: Show captcha token status */}
              <div className="text-xs text-white/30">
                Captcha status: {captchaToken ? "✅ Verified" : "❌ Not verified"}
                {captchaToken && ` (Token: ${captchaToken.substring(0, 10)}...)`}
              </div>
            </div>

            {/* DEBUG BUTTON - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-2 border border-yellow-500/30 p-3 rounded">
                <p className="text-yellow-400 text-sm font-medium">Debug Tools</p>
                <button
                  type="button"
                  onClick={testDirectRegistration}
                  className="w-full border border-yellow-500 text-yellow-500 py-2 text-sm hover:bg-yellow-500/10"
                >
                  🔍 Test Captcha Directly
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log("Form Data:", formData);
                    console.log("Captcha Token:", captchaToken);
                    alert("Check browser console for details");
                  }}
                  className="w-full border border-gray-500 text-gray-400 py-2 text-sm hover:bg-gray-500/10"
                >
                  📋 Log Form Data
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !captchaToken}
              className="group w-full bg-white text-black py-4 rounded-none hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
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
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full border border-white/20 text-white py-4 rounded-none hover:bg-white/5 transition-all duration-300 font-medium"
            >
              Sign In to Existing Account
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 border border-white/10 bg-white/5 rounded-sm">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-white/60 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Account Security</p>
                <p className="text-xs text-white/50 mt-1">
                  Your account is protected with industry-standard security measures. 
                  We never share your personal information with third parties.
                  All communications are encrypted and secured.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}