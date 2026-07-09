import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/userService";
import { User, Mail, Shield, X, Plus, Save, Clock, Calendar, BarChart3, Building2, Users, Award, TrendingUp } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState(user?.workingHoursPerDay || 8);
  const [maxTasksPerDay, setMaxTasksPerDay] = useState(user?.maxTasksPerDay || 5);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateUserProfile({ name, skills, workingHoursPerDay, maxTasksPerDay });
      setMessage("Profile updated successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (_err) {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getWorkloadColor = (value) => {
    if (value >= 80) return "text-red-600 bg-red-50 dark:bg-red-900/20";
    if (value >= 50) return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
    return "text-green-600 bg-green-50 dark:bg-green-900/20";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="relative h-32 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="flex items-end -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-white dark:border-gray-800 shadow-xl">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
            </div>
            <div className="ml-6 mb-2 flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {message && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <Award size={18} />
              {message}
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-blue-600" />
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Email</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.email}</p>
            </div>
            {user?.companyName && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-100 dark:border-purple-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-purple-600" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Company</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.companyName}</p>
              </div>
            )}
            {user?.teamName && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border border-green-100 dark:border-green-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-green-600" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Team</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.teamName}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <User size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update your basic details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
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
          </div>
        </div>

        {/* Time Management */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Clock size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Time Management</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Set your work preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Working Hours / Day
              </label>
              <input
                type="number"
                min={1}
                max={16}
                value={workingHoursPerDay}
                onChange={(e) => setWorkingHoursPerDay(parseInt(e.target.value) || 8)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Tasks / Day
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxTasksPerDay}
                onChange={(e) => setMaxTasksPerDay(parseInt(e.target.value) || 5)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <p className="text-xs text-gray-400 italic">
              These values help the AI engine distribute tasks based on your daily capacity.
            </p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance Overview</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your current workload and availability</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border ${getWorkloadColor(user?.availability || 100)}`}>
              <p className="text-xs font-medium opacity-80 mb-1">Availability</p>
              <p className="text-2xl font-bold">{user?.availability ?? 100}%</p>
            </div>
            <div className={`p-4 rounded-xl border ${getWorkloadColor(user?.currentWorkload || 0)}`}>
              <p className="text-xs font-medium opacity-80 mb-1">Workload</p>
              <p className="text-2xl font-bold">{user?.currentWorkload ?? 0}%</p>
            </div>
            {user?.remainingCapacity !== undefined && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border border-cyan-200 dark:border-cyan-800/50">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Remaining Capacity</p>
                <p className="text-2xl font-bold text-cyan-600">{user.remainingCapacity}h</p>
                <p className="text-xs text-gray-500 mt-1">of {user.workingHoursPerDay || 8}h</p>
              </div>
            )}
            {user?.capacityUtilization !== undefined && (
              <div className={`p-4 rounded-xl border ${getWorkloadColor(user.capacityUtilization)}`}>
                <p className="text-xs font-medium opacity-80 mb-1">Utilization</p>
                <p className="text-2xl font-bold">{user.capacityUtilization || 0}%</p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {user?.capacityUtilization !== undefined && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Daily Capacity</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{user.capacityUtilization || 0}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (user.capacityUtilization || 0) >= 80 ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                    (user.capacityUtilization || 0) >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                    'bg-gradient-to-r from-green-500 to-teal-500'
                  }`}
                  style={{ width: `${Math.min(user.capacityUtilization || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
