import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Heart, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate network request for premium feel
    setTimeout(() => {
      // For this phase, any non-empty credentials are correct
      login(username);
      navigate("/");
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Left Column - Branding (Hidden on mobile) */}
      <div 
        className="hidden lg:flex w-[45%] relative bg-[#0b1f3a] text-white overflow-hidden flex-col justify-between p-12 bg-cover bg-center"
        style={{ backgroundImage: "url('/professional_doctors_bg.png')" }}
      >
        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f3a] via-[#0b1f3a]/80 to-[#0b1f3a]/40 pointer-events-none z-0"></div>

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="bg-white px-5 py-3 rounded-xl inline-flex items-center gap-4 shadow-xl h-20">
            <img 
              src="/cmk_caresuit_logo.png" 
              alt="CMK CareSuite Logo" 
              className="h-full w-auto object-contain" 
            />
            <div className="flex flex-col border-l border-slate-200 pl-4 py-1">
              <span className="text-2xl font-extrabold tracking-tight text-[#0b1f3a] leading-none">CMK CareSuite</span>
              <span className="text-[10px] font-bold text-teal-600 mt-1 uppercase tracking-[0.2em]">Enterprise</span>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-6 max-w-lg mt-auto mb-12">
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight drop-shadow-lg">
            The next generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-300">Healthcare Management.</span>
          </h1>
          <p className="text-lg text-blue-50 leading-relaxed font-light drop-shadow-md">
            Streamline patient registrations, manage wards intelligently, and generate reports with unprecedented speed and precision.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-4 text-sm text-blue-200/60 font-medium">
          <p>&copy; {new Date().getFullYear()} CMK Healthcare Pvt. Ltd.</p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-slate-50/80 overflow-hidden">
        
        {/* Soft Modern Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative w-full max-w-[440px] space-y-8 z-10 bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white">
          
          {/* Mobile Logo (Only visible on small screens) */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-white px-5 py-3 rounded-xl inline-flex items-center gap-4 shadow-xl h-20">
              <img 
                src="/cmk_caresuit_logo.png" 
                alt="CMK CareSuite Logo" 
                className="h-full w-auto object-contain" 
              />
              <div className="flex flex-col border-l border-slate-200 pl-4 py-1 text-left">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0b1f3a] leading-none">CMK CareSuite</span>
                <span className="text-[10px] font-bold text-teal-600 mt-1 uppercase tracking-[0.2em]">Enterprise</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-center lg:text-left relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h2>
            <p className="text-slate-500 font-medium">Please enter your credentials to access the system.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input 
                    type="text" 
                    placeholder="Enter your username" 
                    className="pl-12 h-12 bg-white/90 border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 shadow-sm rounded-xl text-base transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <a href="#" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className="pl-12 pr-12 h-12 bg-white/90 border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 shadow-sm rounded-xl text-base transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center font-medium shadow-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 mt-4 bg-gradient-to-r from-[#0b1f3a] to-[#1a365d] hover:from-[#0a182d] hover:to-[#122847] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
            
            {/* Secure Login Indicator */}
            <div className="pt-2 flex justify-center items-center gap-2 text-slate-400">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span className="text-xs font-semibold tracking-wider uppercase">Secure & Encrypted Connection</span>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
