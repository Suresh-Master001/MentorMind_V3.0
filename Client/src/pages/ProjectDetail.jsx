import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProjectById } from "../services/projectService";
import { getTasks, createTask, assignTask, autoAssignAll, getMatchPreview, deleteTask } from "../services/taskService";
import {
  ArrowLeft,
  Plus,
  Zap,
  Brain,
  CheckSquare,
  Clock,
  Trash2,
  X,
  ChevronDown,
  AlertCircle,
  Calendar,
  BarChart3,
  Target,
  ZapOff,
  Gauge,
  Timer,
  Users,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const colors = {
    pending: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    "in-progress": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    delayed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    unassigned: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

const DifficultyBadge = ({ difficulty }) => {
  const colors = {
    easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    hard: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    expert: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[difficulty] || "bg-gray-100 text-gray-700"}`}>
      {difficulty}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[priority] || "bg-gray-100 text-gray-700"}`}>
      {priority}
    </span>
  );
};

const ProgressBar = ({ value, size = "sm" }) => {
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  const color = value >= 75 ? "from-green-500 to-teal-500" : value >= 40 ? "from-yellow-500 to-orange-500" : "from-red-500 to-pink-500";
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${height}`}>
      <div className={`${height} rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
};

const TimelineBar = ({ task, projectStart, projectEnd }) => {
  const start = new Date(task.estimatedStartDate || task.createdAt || projectStart);
  const end = new Date(task.deadline || projectEnd);
  const totalDuration = projectEnd - projectStart;
  const taskDuration = end - start;
  const leftPercent = totalDuration > 0 ? ((start - projectStart) / totalDuration) * 100 : 0;
  const widthPercent = totalDuration > 0 ? (taskDuration / totalDuration) * 100 : 10;

  const statusColors = {
    completed: "bg-green-500",
    "in-progress": "bg-purple-500",
    pending: "bg-gray-400",
    delayed: "bg-red-500",
    unassigned: "bg-yellow-400",
  };

  return (
    <div className="relative h-8 flex items-center">
      <div
        className={`absolute h-3 rounded-full ${statusColors[task.status] || "bg-gray-400"} opacity-80 transition-all hover:opacity-100 hover:h-4 cursor-pointer`}
        style={{ left: `${Math.min(leftPercent, 95)}%`, width: `${Math.max(widthPercent, 2)}%` }}
        title={`${task.title}: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`}
      />
    </div>
  );
};

const MatchScoreCard = ({ scores, onAssign, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Match Preview — Score Breakdown</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </div>
      <div className="p-6 space-y-4">
        {scores.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No eligible members found</p>
        ) : (
          scores.map((s, i) => (
            <div key={i} className={`p-4 rounded-xl border ${s.skillScore > 0 ? "border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/10" : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{s.user.name}</span>
                <span className="text-xs text-gray-400 capitalize">{s.user.role}</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-700">
                  <p className="text-gray-400">Skill</p>
                  <p className="font-bold text-purple-600">{(s.skillScore * 100).toFixed(0)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-gray-700">
                  <p className="text-gray-400">Avail</p>
                  <p className="font-bold text-blue-600">{(s.availabilityScore * 100).toFixed(0)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-gray-700">
                  <p className="text-gray-400">Workload</p>
                  <p className="font-bold text-green-600">{(s.workloadScore * 100).toFixed(0)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-gray-700">
                  <p className="text-gray-400">Time Cap</p>
                  <p className="font-bold text-cyan-600">{(s.timeCapacityScore * 100).toFixed(0)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <p className="text-white/80">Final</p>
                  <p className="font-bold">{(s.finalScore * 100).toFixed(0)}%</p>
                </div>
              </div>
              {s.user.remainingCapacity !== undefined && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Timer size={10} />
                  <span>Capacity: {s.user.remainingCapacity}h/{s.user.workingHoursPerDay || 8}h remaining</span>
                  <span className="ml-auto">Utilization: {s.user.capacityUtilization || 0}%</span>
                </div>
              )}
              {s.skillScore > 0 && (
                <button
                  onClick={() => onAssign(s.user._id)}
                  className="mt-3 w-full py-2 text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Assign to {s.user.name}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdminOrTeamLead } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ 
    title: "", description: "", requiredSkills: "", priority: "medium", 
    deadline: "", estimatedHours: 4, difficulty: "medium" 
  });
  const [matchTaskId, setMatchTaskId] = useState(null);
  const [matchScores, setMatchScores] = useState([]);
  const [autoAssignMsg, setAutoAssignMsg] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([getProjectById(id), getTasks(id)]);
      setProject(p);
      setTasks(t || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Calculate project timeline stats
  const projectStats = tasks.length > 0 ? (() => {
    const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const completedHours = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const inProgressHours = tasks.filter(t => t.status === 'in-progress').reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = totalEstHours > 0 ? Math.round((completedHours / totalEstHours) * 100) : 0;
    
    // Find project date range for timeline
    const dates = tasks.map(t => new Date(t.deadline || project?.deadline)).filter(d => !isNaN(d));
    const startDates = tasks.map(t => new Date(t.estimatedStartDate || t.createdAt)).filter(d => !isNaN(d));
    const projectStart = startDates.length > 0 ? new Date(Math.min(...startDates)) : new Date();
    const projectEnd = dates.length > 0 ? new Date(Math.max(...dates)) : new Date(project?.deadline);
    
    return { totalEstHours, completedHours, inProgressHours, delayedTasks, completedTasks, progress, projectStart, projectEnd };
  })() : null;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        title: taskForm.title,
        description: taskForm.description,
        project: id,
        requiredSkills: taskForm.requiredSkills ? taskForm.requiredSkills.split(",").map((s) => s.trim()) : [],
        priority: taskForm.priority,
        deadline: taskForm.deadline || undefined,
        estimatedHours: taskForm.estimatedHours,
        difficulty: taskForm.difficulty,
      });
      setShowNewTask(false);
      setTaskForm({ title: "", description: "", requiredSkills: "", priority: "medium", deadline: "", estimatedHours: 4, difficulty: "medium" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowMatchPreview = async (taskId) => {
    try {
      const result = await getMatchPreview(taskId);
      setMatchScores(result.allScores || []);
      setMatchTaskId(taskId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualAssign = async (userId) => {
    if (!matchTaskId) return;
    try {
      await assignTask(matchTaskId, userId);
      setMatchTaskId(null);
      setMatchScores([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutoAssignAll = async () => {
    try {
      setAutoAssignMsg("Running AI assignment...");
      const result = await autoAssignAll(id);
      setAutoAssignMsg(`Assigned ${result.assignedCount} of ${result.totalTasks} tasks`);
      fetchData();
      setTimeout(() => setAutoAssignMsg(""), 3000);
    } catch (err) {
      setAutoAssignMsg("Auto-assignment failed");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">Project not found</p>
        <button onClick={() => navigate("/projects")} className="mt-4 text-purple-600 font-medium">Back to Projects</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate("/projects")} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
            <ArrowLeft size={16} /> Back to Projects
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            {project.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <StatusBadge status={project.status} />
            <span className="flex items-center gap-1"><Calendar size={14} /> Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Users size={14} /> {project.members?.length || 0} members</span>
          </div>
        </div>
      </div>

      {/* Project Stats Dashboard */}
      {projectStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Clock size={14} /> Total Effort
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectStats.totalEstHours}h</p>
            <p className="text-xs text-gray-400">{projectStats.completedHours}h completed</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <BarChart3 size={14} /> Progress
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectStats.progress}%</p>
            <ProgressBar value={projectStats.progress} size="sm" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <CheckSquare size={14} /> Tasks
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {projectStats.completedTasks}/{tasks.length}
            </p>
            <p className="text-xs text-gray-400">{projectStats.inProgressHours}h in progress</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <AlertCircle size={14} /> Delayed
            </div>
            <p className={`text-2xl font-bold ${projectStats.delayedTasks > 0 ? "text-red-500" : "text-green-500"}`}>
              {projectStats.delayedTasks}
            </p>
            <p className="text-xs text-gray-400">{projectStats.delayedTasks > 0 ? "Tasks behind schedule" : "On track"}</p>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {projectStats && tasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Target size={16} /> Project Timeline
            </h3>
            <span className="text-xs text-gray-400">
              {projectStats.projectStart.toLocaleDateString()} → {projectStats.projectEnd.toLocaleDateString()}
            </span>
          </div>
          <div className="space-y-1">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 truncate" title={task.title}>
                  {task.title}
                </span>
                <div className="flex-1">
                  <TimelineBar task={task} projectStart={projectStats.projectStart} projectEnd={projectStats.projectEnd} />
                </div>
                <span className="text-xs text-gray-400 w-16 text-right">{task.estimatedHours || 0}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-assign message */}
      {autoAssignMsg && (
        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <Brain size={16} /> {autoAssignMsg}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        {isAdminOrTeamLead() && (
          <>
            <button onClick={() => setShowNewTask(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700 transition-all">
              <Plus size={18} /> New Task
            </button>
            <button onClick={handleAutoAssignAll} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
              <Zap size={18} /> Auto-Assign All
            </button>
          </>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="text-center py-16">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No tasks yet</p>
          </div>
        )}
        {tasks.map((task) => (
          <div key={task._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  <DifficultyBadge difficulty={task.difficulty} />
                </div>
                {task.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                )}
              </div>
              {isAdminOrTeamLead() && (
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleShowMatchPreview(task._id)} title="Match Preview" className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all">
                    <Brain size={16} />
                  </button>
                  <button onClick={() => handleDeleteTask(task._id)} title="Delete" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Duration & Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <Timer size={12} /> Est: {task.estimatedHours || 0}h ({Math.ceil((task.estimatedHours || 0) / 8)} days)
                </span>
                {task.progress > 0 && <span>{task.progress}% complete</span>}
              </div>
              <ProgressBar value={task.progress || 0} size="sm" />
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
              {task.requiredSkills?.length > 0 && (
                <span className="flex items-center gap-1">
                  <ZapOff size={10} /> Skills: {task.requiredSkills.join(", ")}
                </span>
              )}
              {task.estimatedStartDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={10} /> Start: {new Date(task.estimatedStartDate).toLocaleDateString()}
                </span>
              )}
              {task.deadline && (
                <span className="flex items-center gap-1"><Clock size={12} /> Due: {new Date(task.deadline).toLocaleDateString()}</span>
              )}
              {task.assignedTo && (
                <span className="flex items-center gap-1">
                  Assigned to: {task.assignedTo.name || task.assignedTo}
                </span>
              )}
            </div>

            {/* AI Score Breakdown */}
            {task.skillScore > 0 && (
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span>Skill: {(task.skillScore * 100).toFixed(0)}%</span>
                <span>Avail: {(task.availabilityScore * 100).toFixed(0)}%</span>
                <span>Workload: {(task.workloadScore * 100).toFixed(0)}%</span>
                <span className="font-bold text-purple-600">Final: {(task.finalScore * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Task</h2>
              <button onClick={() => setShowNewTask(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" required
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Description" rows={2}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Estimated Hours</label>
                  <input type="number" min={0.5} max={160} step={0.5} value={taskForm.estimatedHours} 
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: parseFloat(e.target.value) || 4 })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Difficulty</label>
                  <select value={taskForm.difficulty} onChange={(e) => setTaskForm({ ...taskForm, difficulty: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <input type="text" value={taskForm.requiredSkills} onChange={(e) => setTaskForm({ ...taskForm, requiredSkills: e.target.value })} placeholder="Required skills (comma separated)"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              
              <div className="grid grid-cols-2 gap-3">
                <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700 transition-all">
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Match Preview Modal */}
      {matchTaskId && (
        <MatchScoreCard
          scores={matchScores}
          onAssign={handleManualAssign}
          onClose={() => { setMatchTaskId(null); setMatchScores([]); }}
        />
      )}
    </div>
  );
};

export default ProjectDetail;