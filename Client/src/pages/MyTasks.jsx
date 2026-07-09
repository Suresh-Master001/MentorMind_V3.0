import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks, confirmTask, completeTask, selfAssignTask, updateTask, getMatchPreview } from "../services/taskService";
import { CheckSquare, CheckCircle, Play, Clock, Timer, Calendar, FolderKanban, UserPlus, FileText, X, PencilLine, Brain } from "lucide-react";
import toast from "react-hot-toast";

const Logo = () => <img src="/logo.png" alt="MentorMind 3.0" className="h-8 w-auto" />;

const StatusBadge = ({ status }) => {
  const colors = {
    pending: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    "in-progress": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    delayed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    unassigned: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
};

const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [completionNote, setCompletionNote] = useState("");
  const [actualHours, setActualHours] = useState("");
  const [wentWell, setWentWell] = useState("");
  const [blockers, setBlockers] = useState("");
  const [completing, setCompleting] = useState(false);
  const [teamFilter, setTeamFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDraft, setTaskDraft] = useState({ title: "", status: "pending", priority: "medium" });
  const [savingTask, setSavingTask] = useState(false);
  const [matchPreview, setMatchPreview] = useState([]);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      let visible = (data || []).filter((task) => {
        if (user?.role === "member") {
          return task.assignedTo && (task.assignedTo._id === user?._id || task.assignedTo._id?.toString?.() === user?._id?.toString?.());
        }
        return true;
      });

      if (user?.role === "admin" && teamFilter !== "all") {
        visible = visible.filter((task) => task.assignedTo?.teamName === teamFilter || task.teamName === teamFilter);
      }

      setTasks(visible);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, teamFilter]);

  useEffect(() => {
    const handler = (e) => {
      const { type, task } = e.detail;
      if (type === "assigned" || type === "delayed" || type === "completed") {
        fetchTasks();
        toast.success(`Task "${task.title}" was ${type}`);
      }
    };
    window.addEventListener("mm:task-assigned", handler);
    window.addEventListener("mm:task-completed", handler);
    window.addEventListener("mm:task-delayed", handler);
    return () => {
      window.removeEventListener("mm:task-assigned", handler);
      window.removeEventListener("mm:task-completed", handler);
      window.removeEventListener("mm:task-delayed", handler);
    };
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSelfAssign = async (id) => {
    try {
      const result = await selfAssignTask(id);
      setTasks((prev) => prev.map((task) => (task._id === id ? { ...task, ...result.task, status: "pending" } : task)));
      toast.success("Task accepted and added to your pending list.");
    } catch (_error) {
      toast.error("Failed to accept task");
    }
  };

  const handleConfirm = async (id) => {
    const task = tasks.find((item) => item._id === id);
    if (!task) return;
    setTasks((prev) => prev.map((item) => (item._id === id ? { ...item, status: "in-progress" } : item)));
    try {
      await confirmTask(id);
      toast.success(`Task confirmed! You're now working on ${task.title}`);
    } catch (_error) {
      setTasks((prev) => prev.map((item) => (item._id === id ? { ...item, status: "pending" } : item)));
      toast.error("Failed to start task");
    }
  };

  const openCompleteForm = (id) => {
    setCompletingTaskId(id);
    setCompletionNote("");
    setActualHours("");
    setWentWell("");
    setBlockers("");
    setShowCompleteForm(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingTaskId) return;
    setTasks((prev) => prev.map((item) => (item._id === completingTaskId ? { ...item, status: "completed", progress: 100 } : item)));
    try {
      setCompleting(true);
      await completeTask(completingTaskId, {
        workSummary: completionNote,
        actualHours: Number(actualHours) || 0,
        wentWell,
        blockers,
      });
      toast.success("Task marked complete! Great work 🎉");
      setShowCompleteForm(false);
      setCompletingTaskId(null);
      setCompletionNote("");
      setActualHours("");
      setWentWell("");
      setBlockers("");
    } catch (_error) {
      setTasks((prev) => prev.map((item) => (item._id === completingTaskId ? { ...item, status: "in-progress" } : item)));
      toast.error("Failed to complete task");
    } finally {
      setCompleting(false);
    }
  };

  const closeCompleteForm = () => {
    setShowCompleteForm(false);
    setCompletingTaskId(null);
    setCompletionNote("");
    setActualHours("");
    setWentWell("");
    setBlockers("");
  };

  const openTaskDetails = async (task) => {
    setSelectedTask(task);
    setTaskDraft({ title: task.title, status: task.status, priority: task.priority || "medium" });
    try {
      const result = await getMatchPreview(task._id);
      setMatchPreview(result.allScores || []);
    } catch (_error) {
      setMatchPreview([]);
    }
  };

  const saveTaskDetails = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      setSavingTask(true);
      const updated = await updateTask(selectedTask._id, { title: taskDraft.title, status: taskDraft.status, priority: taskDraft.priority });
      setTasks((prev) => prev.map((task) => (task._id === selectedTask._id ? { ...task, ...updated } : task)));
      toast.success("Task updated");
      setSelectedTask(null);
    } catch (_error) {
      toast.error("Failed to update task");
    } finally {
      setSavingTask(false);
    }
  };

  const groupByProject = (taskList) => {
    const groups = {};
    taskList.forEach((task) => {
      const projectId = task.project?._id || "unknown";
      const projectTitle = task.project?.title || "Unknown Project";
      if (!groups[projectId]) {
        groups[projectId] = { title: projectTitle, tasks: [] };
      }
      groups[projectId].tasks.push(task);
    });
    return groups;
  };

  const getTaskStats = () => {
    const scope = tasks.filter((task) => task.assignedTo && (task.assignedTo._id === user?._id || task.assignedTo._id?.toString?.() === user?._id?.toString?.()));
    const pendingCount = scope.filter((task) => task.status === "pending" || task.status === "unassigned").length;
    const inProgressCount = scope.filter((task) => task.status === "in-progress").length;
    const completedCount = scope.filter((task) => task.status === "completed").length;
    const completionRate = scope.length ? Math.round((completedCount / scope.length) * 100) : 0;
    return { total: scope.length, pendingCount, inProgressCount, completedCount, completionRate };
  };

  const stats = getTaskStats();
  const pendingTasks = tasks.filter((task) => task.status === "pending" || task.status === "unassigned");
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const unassignedTasks = tasks.filter((task) => !task.assignedTo && task.status !== "completed");
  const teams = [...new Set((tasks || []).filter((task) => task.assignedTo?.teamName).map((task) => task.assignedTo.teamName))];
  const visibleTasks = activeTab === "pending" ? pendingTasks : activeTab === "in-progress" ? inProgressTasks : completedTasks;
  const visibleGroups = groupByProject(visibleTasks);

  const tabConfig = [
    { key: "pending", label: "Pending Confirmation", count: pendingTasks.length, accent: "gray" },
    { key: "in-progress", label: "In Progress", count: inProgressTasks.length, accent: "purple" },
    { key: "completed", label: "Completed", count: completedTasks.length, accent: "green" },
  ];

  const renderProjectGroup = (projectGroups) => (
    <div className="grid gap-4">
      {Object.entries(projectGroups).map(([projectId, group]) => (
        <div key={projectId} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/50 dark:bg-gray-800/50">
          <div className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
            <FolderKanban size={16} className="text-purple-500" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">{group.title}</h3>
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-400 dark:bg-gray-700">{group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid gap-3">
            {group.tasks.map((task) => {
              const isAssignedToMe = task.assignedTo && (task.assignedTo._id === user?._id || task.assignedTo._id?.toString?.() === user?._id?.toString?.());
              return (
              <TaskCard
                  key={task._id}
                  task={task}
                  role={user?.role}
                  onConfirm={isAssignedToMe && task.status === "pending" ? handleConfirm : undefined}
                  onSelfAssign={user?.role === "member" && !task.assignedTo ? handleSelfAssign : undefined}
                  onOpenCompleteForm={isAssignedToMe ? openCompleteForm : undefined}
                  onOpenDetails={user?.role !== "member" ? openTaskDetails : undefined}
                  user={user}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const StatCard = ({ label, value, color, bgColor, borderColor }) => (
    <div className={`${bgColor} ${borderColor} rounded-2xl border p-4`}>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className={`mt-0.5 text-xs font-medium ${color} opacity-80`}>{label}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">My Tasks</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Track, manage, and complete your assigned tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <Logo />
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <CheckSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Overall Progress</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {user?.role === "admin" && teams.length > 0 && (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Filter by Team</label>
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Assigned" value={stats.total} color="text-gray-700 dark:text-gray-300" bgColor="bg-gray-50 dark:bg-gray-800" borderColor="border-gray-200 dark:border-gray-700" />
          <StatCard label="Pending" value={stats.pendingCount} color="text-amber-700 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-900/20" borderColor="border-amber-200 dark:border-amber-800" />
          <StatCard label="In Progress" value={stats.inProgressCount} color="text-purple-700 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-900/20" borderColor="border-purple-200 dark:border-purple-800" />
          <StatCard label="Completed" value={stats.completedCount} color="text-green-700 dark:text-green-400" bgColor="bg-green-50 dark:bg-green-900/20" borderColor="border-green-200 dark:border-green-800" />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabConfig.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
            {tab.label} <span className="ml-1 text-xs opacity-80">{tab.count}</span>
          </button>
        ))}
      </div>

      {Object.keys(visibleGroups).length > 0 ? renderProjectGroup(visibleGroups) : <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-400 dark:border-gray-700 dark:bg-gray-800">No tasks in this view.</div>}

      {user?.role === "member" && unassignedTasks.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Unassigned Tasks</h2>
          <div className="grid gap-3">
            {unassignedTasks.map((task) => (
              <div key={task._id} className="flex flex-wrap items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{task.project?.title || "Project"} • {task.requiredSkills?.join(", ") || "No specific skills"} • {task.estimatedHours || 0}h • {task.difficulty}</p>
                </div>
                <button onClick={() => handleSelfAssign(task._id)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white"><UserPlus size={14} /> Accept Task</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCompleteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex items-center justify-between rounded-t-3xl border-b border-gray-100 bg-gradient-to-r from-green-50 to-teal-50 p-6 dark:border-gray-700 dark:from-green-900/20 dark:to-teal-900/20">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-2 dark:bg-green-900/50"><FileText size={20} className="text-green-600 dark:text-green-400" /></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit Work Report</h2>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Document the work before marking the task complete</p>
                </div>
              </div>
              <button onClick={closeCompleteForm} className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleCompleteSubmit} className="space-y-5 p-6">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Work Summary Required</p>
                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">Describe what you accomplished, the key outcomes, and any blockers you faced.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Work Summary <span className="text-red-500">*</span></label>
                <textarea value={completionNote} onChange={(e) => setCompletionNote(e.target.value)} rows={6} required className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50" placeholder="Describe your completed work and outcomes..." />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Actual Hours Spent</label>
                  <input type="number" min="0" step="0.5" value={actualHours} onChange={(e) => setActualHours(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">What went well?</label>
                  <textarea value={wentWell} onChange={(e) => setWentWell(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Any blockers faced?</label>
                <textarea value={blockers} onChange={(e) => setBlockers(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeCompleteForm} className="flex-1 rounded-xl bg-gray-100 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" disabled={completing || !completionNote.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:from-green-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-50">{completing ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Submitting...</> : <><CheckCircle size={18} />Submit Work Report</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Edit task status and review AI match suggestions</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"><X size={20} /></button>
            </div>
            <form onSubmit={saveTaskDetails} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Title</label>
                <input value={taskDraft.title} onChange={(e) => setTaskDraft({ ...taskDraft, title: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                  <select value={taskDraft.status} onChange={(e) => setTaskDraft({ ...taskDraft, status: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</label>
                  <select value={taskDraft.priority} onChange={(e) => setTaskDraft({ ...taskDraft, priority: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20">
                <div className="mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300"><Brain size={16} /> Match Preview</div>
                {matchPreview.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No match preview yet</p> : matchPreview.slice(0, 3).map((score) => <p key={score.user?._id || score.user?.name} className="text-sm text-gray-700 dark:text-gray-200">{score.user?.name} • {(score.finalScore * 100).toFixed(0)}%</p>)}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedTask(null)} className="flex-1 rounded-xl bg-gray-100 py-3 font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" disabled={savingTask} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white">{savingTask ? "Saving..." : <><PencilLine size={16} />Save Changes</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, role, onConfirm, onSelfAssign, onOpenCompleteForm, onOpenDetails, user }) => {
  const isAssigned = task.assignedTo && (task.assignedTo._id === user?._id || task.assignedTo._id?.toString?.() === user?._id?.toString?.());
  const canConfirm = (role === "member" || role === "Team Lead") && task.status === "pending" && onConfirm;
  const canComplete = (role === "member" || role === "Team Lead") && isAssigned && onOpenCompleteForm;
  const canSelfAssign = role === "member" && !task.assignedTo && onSelfAssign;
  const canViewDetails = role !== "member" && onOpenDetails;

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-md transition-all duration-300 hover:border-purple-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900 dark:text-white">{task.title}</h3>
            <StatusBadge status={task.status} />
            {!task.assignedTo && <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Unassigned</span>}
          </div>
          {task.description && <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{task.description}</p>}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {task.project?.title && <span className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 dark:bg-gray-700/50"><FolderKanban size={12} /> {task.project.title}</span>}
            {task.requiredSkills?.length > 0 && <span>Skills: {task.requiredSkills.slice(0, 3).join(", ")}{task.requiredSkills.length > 3 ? ` +${task.requiredSkills.length - 3}` : ""}</span>}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {canSelfAssign && <button onClick={() => onSelfAssign(task._id)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:from-blue-600 hover:to-cyan-600"><UserPlus size={14} /> Accept</button>}
          {canConfirm && <button onClick={() => onConfirm(task._id)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-pink-700"><Play size={14} /> Confirm & Start</button>}
          {canComplete && <button onClick={() => onOpenCompleteForm(task._id)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:from-green-600 hover:to-teal-600"><FileText size={14} /> Mark Complete</button>}
          {canViewDetails && <button onClick={() => onOpenDetails(task)} className="flex items-center gap-1.5 rounded-xl border border-purple-200 px-4 py-2 text-xs font-semibold text-purple-600 dark:border-purple-700 dark:text-purple-400"><PencilLine size={14} /> View Details</button>}
        </div>
      </div>
      {(task.estimatedHours || task.deadline || task.difficulty) && (
        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {task.estimatedHours && <span className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 dark:bg-gray-700/30"><Timer size={12} className="text-purple-500" /> Est: {task.estimatedHours}h ({Math.ceil(task.estimatedHours / 8)} days)</span>}
            {task.deadline && <span className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 dark:bg-gray-700/30"><Calendar size={12} className="text-pink-500" /> Due: {new Date(task.deadline).toLocaleDateString()}</span>}
            {task.difficulty && <span className={`rounded-lg px-2 py-1 font-medium ${task.difficulty === "easy" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : task.difficulty === "hard" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" : task.difficulty === "expert" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"}`}>{task.difficulty.toUpperCase()}</span>}
          </div>
        </div>
      )}
      {task.skillScore > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-full rounded-full bg-blue-500" style={{ width: `${task.skillScore * 100}%` }} /></div><span className="text-gray-500 dark:text-gray-400">Skill {(task.skillScore * 100).toFixed(0)}%</span></div>
            <div className="flex items-center gap-1.5"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${task.availabilityScore * 100}%` }} /></div><span className="text-gray-500 dark:text-gray-400">Avail {(task.availabilityScore * 100).toFixed(0)}%</span></div>
            <div className="flex items-center gap-1.5"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-full rounded-full bg-purple-500" style={{ width: `${task.workloadScore * 100}%` }} /></div><span className="text-gray-500 dark:text-gray-400">Load {(task.workloadScore * 100).toFixed(0)}%</span></div>
            <span className="ml-auto font-bold text-purple-600 dark:text-purple-400">Match {(task.finalScore * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;