import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Mail, Lock, User as UserIcon, X, Plus, Users, Building2, Shield, Sparkles } from "lucide-react";

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

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [companyName, setCompanyName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (skills.length === 0) {
      setError("Please add at least one skill");
      return;
    }
    setLoading(true);

    try {
      const result = await register(name, email, password, skills, teamName, companyName, role);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Registration failed");
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
            <Sparkles className="w-3.5 h-3.5" />
            Join MentorMind today — it's free!
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
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Full Name
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
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  placeholder="Your Company"
                  required
                  className="relative w-full pl-11 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Your Role
              </label>
              <div className="relative group">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="relative w-full pl-11 pr-10 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="member">Team Member</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {role === "admin" ? "Full system access" : role === "Team Lead" ? "Can manage projects and tasks" : "Can view and work on assigned tasks"}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Team Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Frontend Team, Backend Team"
                  className="relative w-full pl-11 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Skills
              </label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="e.g. React"
                    className="relative w-full px-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-3.5 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md shadow-purple-500/20"
                >
                  <Plus size={18} />
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200/50 dark:border-purple-800/50"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                  <UserPlus size={18} />
                  Create Account
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

export default Register;