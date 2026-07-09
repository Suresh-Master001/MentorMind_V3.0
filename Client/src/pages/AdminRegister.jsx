import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Mail, Lock, User as UserIcon, Building2, Shield, Users, Sparkles, ChevronDown } from "lucide-react";

const Logo = () => (
  <div className="flex items-center justify-center gap-3 mb-2">
    <img src="/MentorMind_Logo.png" alt="MentorMind 3.0" className="h-14 w-auto" />
    <div className="text-left">
      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent block leading-tight">
        MentorMind
      </span>
      <span className="text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase font-semibold">
        AI-Powered Platform
      </span>
    </div>
  </div>
);

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { orgSetup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await orgSetup(name, email, password, companyName, companyEmail, description);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Organization setup failed");
      }
    } catch (_err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-purple-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-gradient-to-bl from-pink-300/30 to-pink-500/20 rounded-full blur-[128px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-t from-purple-200/10 to-pink-200/5 rounded-full blur-[100px]" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.5) 1px, transparent 0)", backgroundSize: "30px 30px" }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
          <Logo />
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-medium">
            <Building2 className="w-3.5 h-3.5" />
            Setup your organization
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-500/10 p-8 border border-white/50 dark:border-gray-700/50 animate-in fade-in zoom-in duration-500">
          {/* Decorative top gradient line */}
          <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full" style={{ marginTop: "-0.5px" }} />

          {error && (
            <div className="mb-5 p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Admin Section */}
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-500" />
                Admin Details
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Admin Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="relative w-full pl-11 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Admin Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@company.com"
                      required
                      className="relative w-full pl-11 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      className="relative w-full pl-11 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Section */}
            <div className="pt-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                Organization Details
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Company Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Inc."
                      required
                      className="relative w-full pl-11 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Company Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="info@company.com"
                      required
                      className="relative w-full pl-11 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of your organization..."
                      rows={3}
                      className="relative w-full px-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={18} />
                  Create Organization
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/80 dark:bg-gray-800/80 px-4 text-gray-400 dark:text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="block w-full py-3 px-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 font-semibold text-sm transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md"
            >
              Sign In Instead
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-gray-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} MentorMind. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;