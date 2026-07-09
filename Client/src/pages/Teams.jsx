import { useState, useEffect } from "react";
import { getUsers } from "../services/userService";
import { Users, Zap, Wifi } from "lucide-react";

const Teams = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getUsers();
        setMembers(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = members.filter((m) => {
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    if (search && !m.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Team Members
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {members.length} team member{members.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="Team Lead">Team Lead</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No members found</p>
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((member) => (
          <div
            key={member._id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                {member.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">{member.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{member.role}</p>
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
              </div>
            </div>

            {/* Skills */}
            {member.skills?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {member.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1 text-gray-400">
                  <Wifi size={12} /> Availability
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {member.availability ?? 100}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${
                    (member.availability ?? 100) > 60
                      ? "from-green-500 to-teal-500"
                      : (member.availability ?? 100) > 30
                      ? "from-yellow-500 to-orange-500"
                      : "from-red-500 to-pink-500"
                  }`}
                  style={{ width: `${member.availability ?? 100}%` }}
                />
              </div>
            </div>

            {/* Workload */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1 text-gray-400">
                  <Zap size={12} /> Workload
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {member.currentWorkload ?? 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${
                    (member.currentWorkload ?? 0) < 40
                      ? "from-green-500 to-teal-500"
                      : (member.currentWorkload ?? 0) < 70
                      ? "from-yellow-500 to-orange-500"
                      : "from-red-500 to-pink-500"
                  }`}
                  style={{ width: `${member.currentWorkload ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;