import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Building2, Mail, Lock, Eye, EyeOff, User as UserIcon, Briefcase, FileText } from "lucide-react";

const OrgSetup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { orgSetup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await orgSetup(name, email, password, companyName, companyEmail, description);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Organization setup failed");
      }
    } catch (_err) {
      setError("Organization setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 p-4 text-white">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold">Create your organization</h1>
          <p className="text-slate-300 mt-2">Set up the admin account and company profile in one step.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                <Building2 className="h-8 w-8 text-emerald-300" />
              </div>
              <h2 className="text-2xl font-semibold">{companyName || "Your organization"} is ready</h2>
              <p className="text-slate-300">
                Your admin account is ready. Login to get started.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white shadow-lg shadow-purple-500/30"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">Admin Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@company.com"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-10 pr-12 text-sm text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-10 pr-12 text-sm text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Inc"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">Company Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="hello@company.com"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Company Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us a little about the company"
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
              >
                {loading ? "Creating organization..." : "Create Organization & Admin Account"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            <Link to="/login" className="text-purple-300 hover:text-purple-200">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgSetup;
