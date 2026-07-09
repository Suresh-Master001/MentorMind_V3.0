import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../services/userService";
import { getAnalyticsOverview, getAnalyticsMonthly, getTeamReport, getProjectReport, getMemberReport } from "../services/analyticsService";
import { Users, ShieldCheck, FolderKanban, BarChart3, Search, Sparkles, UserCircle2, Activity } from "lucide-react";

const tabs = [
  { id: "members", label: "Members", icon: <Users size={16} /> },
  { id: "teams", label: "Teams Overview", icon: <ShieldCheck size={16} /> },
  { id: "organization", label: "Organization Overview", icon: <BarChart3 size={16} /> },
];

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberReport, setMemberReport] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberData, overviewData, monthlyData, teamData, projectData] = await Promise.all([
          getUsers(),
          getAnalyticsOverview(),
          getAnalyticsMonthly(),
          getTeamReport(),
          getProjectReport(),
        ]);

        setMembers(memberData || []);
        setOverview(overviewData || null);
        setMonthly(monthlyData || []);
        setTeams(teamData || []);
        setProjects(projectData || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.toLowerCase();
    return members.filter((member) => {
      return [member.name, member.email, member.role, member.teamName].filter(Boolean).some((value) => value.toString().toLowerCase().includes(query));
    });
  }, [members, search]);

  const openMemberReport = async (member) => {
    setSelectedMember(member);
    try {
      const data = await getMemberReport(member._id);
      setMemberReport(data);
    } catch (error) {
      console.error(error);
      setMemberReport(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-500">Admin Panel</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Run your organization from a single workspace</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Monitor team performance, review delivery health, and oversee workflows for {user?.companyName || "your organization"}.</p>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-700 dark:border-purple-900/40 dark:bg-purple-900/20 dark:text-purple-300">
            <div className="flex items-center gap-2 font-semibold"><Sparkles size={16} /> Live overview</div>
            <div className="mt-1 text-xs opacity-80">{members.length} members · {projects.length} projects</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${activeTab === tab.id ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "members" && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Organization members</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inspect people, roles, and team assignments.</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-400">
                <Search size={16} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members" className="bg-transparent outline-none" />
              </div>
            </div>

            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <button key={member._id} onClick={() => openMemberReport(member)} className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left transition hover:border-purple-200 hover:bg-purple-50/60 dark:border-gray-700 dark:bg-gray-700/40 dark:hover:border-purple-700/50 dark:hover:bg-purple-900/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-semibold text-white">
                      {member.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">{member.role}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.teamName || "Unassigned"}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {selectedMember ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-semibold text-white">
                    {selectedMember.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedMember.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMember.teamName || "Unassigned team"}</p>
                  </div>
                </div>

                {memberReport ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tasks completed</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{memberReport.tasksCompleted}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Hours logged</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{memberReport.hoursLogged}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/40">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"><Activity size={16} /> Recent performance</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Completion rate {memberReport.onTimeRate}% · average completion {memberReport.avgCompletionDays} days</div>
                    </div>

                    {memberReport.skillDistribution?.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Top skills</p>
                        <div className="flex flex-wrap gap-2">
                          {memberReport.skillDistribution.map((skill) => (
                            <span key={skill.skill} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">{skill.skill} · {skill.count}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">Select a member to inspect their report.</div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">Choose a member from the list to view their contribution report.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "teams" && (
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.teamName} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.teamName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{team.members} member{team.members !== 1 ? "s" : ""} · {team.membersList?.join(", ")}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
                  Completion {team.totalTasks ? Math.round((team.completedTasks / team.totalTasks) * 100) : 0}%
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-700/50"><p className="text-xs text-gray-500">Total tasks</p><p className="text-xl font-semibold text-gray-900 dark:text-white">{team.totalTasks}</p></div>
                <div className="rounded-2xl bg-green-50 p-3 dark:bg-green-900/10"><p className="text-xs text-green-700">Completed</p><p className="text-xl font-semibold text-green-700">{team.completedTasks}</p></div>
                <div className="rounded-2xl bg-purple-50 p-3 dark:bg-purple-900/10"><p className="text-xs text-purple-700">In progress</p><p className="text-xl font-semibold text-purple-700">{team.inProgressTasks}</p></div>
                <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-900/10"><p className="text-xs text-red-700">Delayed</p><p className="text-xl font-semibold text-red-700">{team.delayedTasks}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "organization" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"><BarChart3 size={18} className="text-purple-500" /> Organization health</div>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50"><p className="text-xs text-gray-500">Projects</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{overview?.projects ?? 0}</p></div>
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50"><p className="text-xs text-gray-500">Tasks</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{overview?.tasks?.total ?? 0}</p></div>
              <div className="rounded-2xl bg-green-50 p-4 dark:bg-green-900/10"><p className="text-xs text-green-700">Completed</p><p className="text-2xl font-semibold text-green-700">{overview?.tasks?.completed ?? 0}</p></div>
              <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-900/10"><p className="text-xs text-red-700">Delayed</p><p className="text-2xl font-semibold text-red-700">{overview?.tasks?.delayed ?? 0}</p></div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
              <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Monthly trend</h4>
              <div className="space-y-2">
                {monthly.map((entry) => (
                  <div key={entry.key} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700/50">
                    <span>{entry.month}</span>
                    <span className="text-gray-600 dark:text-gray-300">{entry.created} created · {entry.completed} completed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"><FolderKanban size={18} className="text-purple-500" /> Project snapshot</div>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/40">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{project.title}</p>
                    <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">{project.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{project.memberCount} members · {project.taskCount} tasks · {project.delayedTasks} delayed</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
