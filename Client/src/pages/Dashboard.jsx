import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProjects } from "../services/projectService";
import { getTasks } from "../services/taskService";
import { getUsers } from "../services/userService";
import { getNotifications } from "../services/notificationService";
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Clock,
  Play,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: StatCardIcon, label, value, change, changeType, gradient }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
    <div className="mb-4 flex items-center justify-between">
      <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3`}>
        <StatCardIcon className="h-6 w-6 text-white" />
      </div>
      <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${changeType === "increase" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
        {changeType === "increase" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
      </span>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    "On Track": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "At Risk": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Delayed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "Not Started": "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    planning: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "in-progress": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    delayed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  const color = colors[status] || "bg-gray-100 text-gray-700";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{status}</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, t, m, n] = await Promise.all([
          getProjects().catch(() => []),
          getTasks().catch(() => []),
          getUsers().catch(() => []),
          getNotifications().catch(() => []),
        ]);
        setProjects(p || []);
        setTasks(t || []);
        setMembers(m || []);
        setNotifications(n || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const activeProjects = projects.filter((p) => p.status === "in-progress").length;
  const recentProjects = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const role = user?.role;
  const myProjects = projects.filter((project) => project.createdBy?._id === user?._id || project.createdBy === user?._id);
  const assignedMyTasks = tasks.filter((task) => task.assignedTo && (task.assignedTo._id === user?._id || task.assignedTo._id?.toString?.() === user?._id?.toString?.()));
  const pendingConfirmation = assignedMyTasks.filter((task) => task.status === "pending").length;
  const inProgressTasks = assignedMyTasks.filter((task) => task.status === "in-progress").length;
  const completedMemberTasks = assignedMyTasks.filter((task) => task.status === "completed").length;
  const teamCompletionRate = assignedMyTasks.length > 0 ? Math.round((completedMemberTasks / assignedMyTasks.length) * 100) : 0;
  const overdueTasks = tasks.filter((task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed").length;
  const recentCompletedTasks = [...tasks.filter((task) => task.status === "completed")].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);
  const myTaskSummary = [...assignedMyTasks].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 3);

  const stats =
    role === "admin"
      ? [
          { icon: Users, label: "Total Members", value: members.length.toString(), change: "Monitoring", changeType: "increase", gradient: "from-blue-500 to-cyan-500" },
          { icon: FolderKanban, label: "Active Projects", value: activeProjects.toString(), change: "Read-only", changeType: "increase", gradient: "from-purple-500 to-pink-500" },
          { icon: CheckSquare, label: "Tasks Completed", value: completedTasks.toString(), change: "Overview", changeType: "increase", gradient: "from-green-500 to-teal-500" },
          { icon: Clock, label: "Pending Confirmation", value: pendingConfirmation.toString(), change: "Monitor", changeType: "increase", gradient: "from-amber-500 to-orange-500" },
        ]
      : role === "Team Lead"
      ? [
          { icon: FolderKanban, label: "My Projects", value: myProjects.length.toString(), change: "+4.0%", changeType: "increase", gradient: "from-purple-500 to-pink-500" },
          { icon: CheckSquare, label: "Tasks Assigned", value: assignedMyTasks.length.toString(), change: "+2.1%", changeType: "increase", gradient: "from-green-500 to-teal-500" },
          { icon: BarChart3, label: "Team Completion Rate", value: `${teamCompletionRate}%`, change: "+2.8%", changeType: "increase", gradient: "from-blue-500 to-cyan-500" },
          { icon: Calendar, label: "Overdue Tasks", value: overdueTasks.toString(), change: overdueTasks > 0 ? "Action needed" : "Clear", changeType: overdueTasks > 0 ? "decrease" : "increase", gradient: "from-orange-500 to-red-500" },
        ]
      : [
          { icon: CheckSquare, label: "My Assigned Tasks", value: assignedMyTasks.length.toString(), change: "+1.1%", changeType: "increase", gradient: "from-purple-500 to-pink-500" },
          { icon: Clock, label: "Pending Confirmation", value: pendingConfirmation.toString(), change: "+0.8%", changeType: "increase", gradient: "from-amber-500 to-orange-500" },
          { icon: Play, label: "In Progress", value: inProgressTasks.toString(), change: "+0.4%", changeType: "increase", gradient: "from-blue-500 to-cyan-500" },
          { icon: CheckCircle2, label: "Completed", value: completedMemberTasks.toString(), change: "+1.9%", changeType: "increase", gradient: "from-green-500 to-teal-500" },
        ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">Dashboard</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Welcome back, {user?.name || "User"}!</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{role === "member" ? "My Recent Projects" : "Recent Projects"}</h2>
              {role !== "member" && (
                <Link to="/projects" className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
                  View All
                </Link>
              )}
            </div>
            {recentProjects.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No projects yet</p>
            ) : (
              <div className="space-y-4">
                {recentProjects.filter((project) => (role === "member" ? project.members?.some((member) => member?._id === user?._id || member === user?._id) : true)).map((project) => (
                  <Link key={project._id} to={`/projects/${project._id}`} className="block rounded-xl p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">{project.title}</h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="mb-2 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={12} />{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {role === "admin" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Team Activity Feed</h2>
                <Link to="/admin" className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">Go to Admin Panel</Link>
              </div>
              <div className="space-y-3">
                {recentCompletedTasks.length === 0 ? <p className="text-sm text-gray-400">No completions yet.</p> : recentCompletedTasks.map((task) => (
                  <div key={task._id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed by {task.assignedTo?.name || "a teammate"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {role === "Team Lead" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Team Members</h2>
                <Link to="/projects" className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30">Create New Project</Link>
              </div>
              {members.length === 0 ? <p className="py-8 text-center text-sm text-gray-400">No team members</p> : (
                <div className="space-y-4">
                  {members.slice(0, 6).map((member) => (
                    <div key={member._id} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">{member.name?.charAt(0)?.toUpperCase() || "?"}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                      <span className="text-xs text-gray-400">{member.availability ?? 100}% free</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {role === "member" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Tasks Summary</h2>
                <Link to="/tasks" className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">View All</Link>
              </div>
              <div className="space-y-3">
                {myTaskSummary.length === 0 ? <p className="text-sm text-gray-400">No tasks yet.</p> : myTaskSummary.map((task) => (
                  <div key={task._id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{task.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{task.project?.title || "Project"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {role === "member" ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Latest Notifications</h2>
              <div className="space-y-3">
                {notifications.length === 0 ? <p className="text-sm text-gray-400">No notifications yet.</p> : notifications.slice(0, 5).map((item) => (
                  <div key={item._id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-700 dark:text-gray-200">{item.message}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Team Members</h2>
              {members.length === 0 ? <p className="py-8 text-center text-sm text-gray-400">No team members</p> : (
                <div className="space-y-4">
                  {members.slice(0, 6).map((member) => (
                    <div key={member._id} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">{member.name?.charAt(0)?.toUpperCase() || "?"}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                      <span className="text-xs text-gray-400">{member.availability ?? 100}% free</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;