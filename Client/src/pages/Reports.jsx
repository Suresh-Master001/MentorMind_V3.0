import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAnalyticsOverview, getAnalyticsMonthly, getTeamReport, getProjectReport, getMemberReport } from "../services/analyticsService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, Users, FolderKanban, TrendingUp, Calendar, CheckCircle, Clock, ChevronDown, ChevronUp, UserCircle2 } from "lucide-react";

const COLORS = {
  completed: "#10b981",
  "in-progress": "#8b5cf6",
  pending: "#f59e0b",
  delayed: "#ef4444",
  unassigned: "#6b7280",
};

const StatusBadge = ({ status }) => {
  const colors = {
    planning: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "in-progress": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    delayed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

const Reports = () => {
  const { user, isAdminOrTeamLead: isAdminOrManager } = useAuth();
  const canViewReports = isAdminOrManager();
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [teamReport, setTeamReport] = useState([]);
  const [projectReport, setProjectReport] = useState([]);
  const [memberLookup, setMemberLookup] = useState(null);
  const [expandedTeams, setExpandedTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    { id: "teams", label: "Team Report", icon: <Users size={16} /> },
    { id: "projects", label: "Project Report", icon: <FolderKanban size={16} /> },
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const [o, m, t, p] = await Promise.all([
          getAnalyticsOverview().catch(() => null),
          getAnalyticsMonthly().catch(() => []),
          canViewReports ? getTeamReport().catch(() => []) : [],
          canViewReports ? getProjectReport().catch(() => []) : [],
        ]);
        setOverview(o);
        setMonthly(m || []);
        setTeamReport(t || []);
        setProjectReport(p || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [canViewReports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const taskDistribution = overview?.tasks ? [
    { name: "Completed", value: overview.tasks.completed },
    { name: "In Progress", value: overview.tasks.inProgress },
    { name: "Pending", value: overview.tasks.pending },
    { name: "Delayed", value: overview.tasks.delayed },
  ].filter((d) => d.value > 0) : [];

  const handleMemberLookup = async (member) => {
    try {
      const report = await getMemberReport(member._id);
      setMemberLookup(report);
    } catch (error) {
      console.error(error);
      setMemberLookup(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {user?.role === 'admin' ? 'Organization-wide analytics and reports' : 'Project and task analytics'}
        </p>
      </div>

      {/* Tab Navigation */}
      {canViewReports && (
        <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Projects", value: overview?.projects ?? 0, color: "from-blue-500 to-cyan-500" },
              { label: "Total Tasks", value: overview?.tasks?.total ?? 0, color: "from-purple-500 to-pink-500" },
              { label: "Completed", value: overview?.tasks?.completed ?? 0, color: "from-green-500 to-teal-500" },
              { label: "Delayed", value: overview?.tasks?.delayed ?? 0, color: "from-red-500 to-orange-500" },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                <p className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-500" /> Monthly Created vs Completed
              </h2>
              {monthly.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                    <Legend />
                    <Bar dataKey="created" name="Created" fill="#8b5cf6" radius={[4,4,0,0]} />
                    <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Donut Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChartIcon size={18} className="text-purple-500" /> Task Distribution
              </h2>
              {taskDistribution.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No tasks yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {taskDistribution.map((entry, index) => (
                        <Cell key={index} fill={COLORS[entry.name.toLowerCase().replace(" ", "-")] || "#6b7280"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Project Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Project Status Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {overview?.projects !== undefined ? (
                <>
                  <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.projects}</p>
                    <p className="text-xs text-gray-500">Total Projects</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/10">
                    <p className="text-2xl font-bold text-green-600">{overview.tasks?.completed ?? 0}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10">
                    <p className="text-2xl font-bold text-purple-600">{overview.tasks?.inProgress ?? 0}</p>
                    <p className="text-xs text-gray-500">In Progress</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/10">
                    <p className="text-2xl font-bold text-red-600">{overview.tasks?.delayed ?? 0}</p>
                    <p className="text-xs text-gray-500">Delayed</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4 col-span-4">No data yet</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Team Report Tab */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          {teamReport.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No team data available yet</p>
            </div>
          ) : (
            teamReport.map((team, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Users size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{team.teamName}</h3>
                      <p className="text-xs text-gray-500">{team.members} member{team.members !== 1 ? 's' : ''} · {team.membersList?.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{team.totalTasks}</p>
                    <p className="text-xs text-gray-500">Total Tasks</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/10">
                    <p className="text-xl font-bold text-green-600">{team.completedTasks}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10">
                    <p className="text-xl font-bold text-purple-600">{team.inProgressTasks}</p>
                    <p className="text-xs text-gray-500">In Progress</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/10">
                    <p className="text-xl font-bold text-red-600">{team.delayedTasks}</p>
                    <p className="text-xs text-gray-500">Delayed</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Completion Rate</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {team.totalTasks > 0 ? Math.round((team.completedTasks / team.totalTasks) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500"
                      style={{ width: `${team.totalTasks > 0 ? (team.completedTasks / team.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedTeams((prev) => ({ ...prev, [team.teamName]: !prev[team.teamName] }))}
                    className="flex items-center gap-2 text-sm font-medium text-purple-600"
                  >
                    {expandedTeams[team.teamName] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {expandedTeams[team.teamName] ? "Hide members" : "View members"}
                  </button>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{team.memberBreakdown?.length || 0} contributors</div>
                </div>

                {expandedTeams[team.teamName] && (
                  <div className="mt-4 space-y-2">
                    {team.memberBreakdown?.map((member) => (
                      <div key={`${team.teamName}-${member.name}`} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-700/40">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.role} · {member.skills?.slice(0, 2).join(", ") || "No listed skills"}</p>
                        </div>
                        <button onClick={() => handleMemberLookup(member)} className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                          <UserCircle2 size={14} /> View report
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {memberLookup && (
                  <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50/70 p-4 dark:border-purple-900/30 dark:bg-purple-900/10">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">{memberLookup.user?.name || "Member report"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tasks completed {memberLookup.tasksCompleted} · on-time rate {memberLookup.onTimeRate}%</p>
                      </div>
                      <button onClick={() => setMemberLookup(null)} className="text-xs font-medium text-purple-700 dark:text-purple-300">Close</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Project Report Tab */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {projectReport.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
              <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No project data available yet</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Project</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Team Lead</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Members</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectReport.map((project) => (
                      <tr key={project._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{project.title}</td>
                        <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{project.createdBy}</td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{project.memberCount}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(project.deadline).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;