import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProjects, createProject, deleteProject } from "../services/projectService";
import { getUsers } from "../services/userService";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  FolderKanban,
  Plus,
  Grid3X3,
  List,
  Search,
  X,
  Calendar,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  BarChart3,
  Trash2,
} from "lucide-react";

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

const ProgressBar = ({ value }) => {
  const color = value >= 75 ? "from-green-500 to-teal-500" : value >= 40 ? "from-yellow-500 to-orange-500" : "from-red-500 to-pink-500";
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div className={`h-2 rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
};

const Projects = () => {
  const { isAdminOrTeamLead } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", members: [] });
  const [requiredTasks, setRequiredTasks] = useState([]);
  const [taskInput, setTaskInput] = useState({ title: "", requiredSkills: "" });
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [p, u] = await Promise.all([getProjects(), getUsers()]);
        setProjects(p || []);
        setUsers(u || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAiLoading(true);
    setAiResult(null);
    try {
      const data = await createProject({
        title: form.title,
        description: form.description,
        deadline: form.deadline,
        members: form.members,
        requiredTasks: requiredTasks
      });
      setAiResult(data);
      setAiLoading(false);
    } catch (err) {
      console.error(err);
      setAiLoading(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    navigate(`/projects/${aiResult?.project?._id}`);
  };

  const addTask = () => {
    const t = taskInput.title.trim();
    const skills = taskInput.requiredSkills.split(",").map(s => s.trim()).filter(s => s);
    if (t && !requiredTasks.some(task => task.title === t)) {
      setRequiredTasks([...requiredTasks, { title: t, requiredSkills: skills }]);
      setTaskInput({ title: "", requiredSkills: "" });
    }
  };

  const removeTask = (title) => {
    setRequiredTasks(requiredTasks.filter(t => t.title !== title));
  };

  const toggleMember = (id) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
    }));
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProject(deleteId);
      setProjects(projects.filter(p => p._id !== deleteId));
      toast.success('Project deleted successfully');
    } catch (_err) {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Projects
        </h1>
        {isAdminOrTeamLead() && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/30 transition-all"
          >
            <Plus size={18} />
            New Project
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="delayed">Delayed</option>
        </select>
        <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${viewMode === "list" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No projects found</p>
          {isAdminOrTeamLead() && (
            <button onClick={() => setShowModal(true)} className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
              Create your first project
            </button>
          )}
        </div>
      )}

      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div key={project._id} className="relative group">
              <Link
                to={`/projects/${project._id}`}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 block"
              >
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={project.status} />
                  {isAdminOrTeamLead() && (
                    <button
                      onClick={(e) => handleDelete(project._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={12} />{new Date(project.deadline).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users size={12} />{project.members?.length || 0}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {viewMode === "list" && filtered.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {filtered.map((project) => (
            <div key={project._id} className="relative group">
              <Link
                to={`/projects/${project._id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{project.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={project.status} />
                  <span className="text-xs text-gray-400">{new Date(project.deadline).toLocaleDateString()}</span>
                  {isAdminOrTeamLead() && (
                    <button
                      onClick={(e) => handleDelete(project._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Project</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this project? All associated tasks and data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Project</h2>
              <button onClick={() => { setShowModal(false); setAiResult(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            {!aiResult ? (
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Members</label>
                  <div className="max-h-60 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-600 rounded-xl p-2">
                    {users.map((u) => (
                      <label key={u._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                        <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)}
                          className="rounded accent-purple-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <span className="text-xs text-gray-500 capitalize">{u.role}</span>
                        {u.skills?.length > 0 && (
                          <span className="text-xs text-purple-600 dark:text-purple-400">{u.skills.length} skills</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required Tasks (Optional)</label>
                 <div className="flex gap-2">
                   <input
                     type="text"
                     value={taskInput.title}
                     onChange={(e) => setTaskInput({ ...taskInput, title: e.target.value })}
                     placeholder="Task title"
                     className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                   />
                   <button
                     type="button"
                     onClick={addTask}
                     className="px-3 py-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50"
                   >
                     <Plus size={16} />
                   </button>
                 </div>
                 <input
                   type="text"
                   value={taskInput.requiredSkills}
                   onChange={(e) => setTaskInput({ ...taskInput, requiredSkills: e.target.value })}
                   placeholder="Skills (comma separated)"
                   className="w-full mt-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                 />
                 {requiredTasks.length > 0 && (
                   <div className="flex flex-col gap-1 mt-2 max-h-32 overflow-y-auto">
                     {requiredTasks.map((task, idx) => (
                       <div key={idx} className="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                         <div>
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{task.title}</span>
                           {task.requiredSkills.length > 0 && (
                             <span className="text-xs text-gray-500 ml-2">({task.requiredSkills.join(', ')})</span>
                           )}
                         </div>
                         <button type="button" onClick={() => removeTask(task.title)} className="text-gray-400 hover:text-red-500">
                           <X size={14} />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
                <button type="submit" disabled={submitting}
                 className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50">
                {submitting ? "Creating..." : "Create Project"}
              </button>
            </form>
            ) : aiLoading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Generating tasks with AI...</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {aiResult.tasksGenerated?.length || 0} tasks generated and auto-assigned
                  </h3>
                </div>
                {showSummary && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button onClick={() => setShowSummary(false)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignment Summary</span>
                      <ChevronUp size={16} />
                    </button>
                    <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                      {(aiResult.assignments || []).map((a, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{a.task}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {a.assignedTo ? `Assigned to: ${a.assignedTo}` : 'Unassigned'} | Score: {Math.round((a.finalScore || 0) * 100)}%
                          </p>
                          {a.estimatedHours && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <Clock size={10} className="inline mr-1" />
                              Est: {a.estimatedHours}h | Difficulty: {a.difficulty || 'medium'}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!showSummary && (
                  <button onClick={() => setShowSummary(true)} className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700">
                    <ChevronDown size={16} /> Show assignment summary
                  </button>
                )}
                <button type="button" onClick={handleCloseSummary}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 transition-all">
                  Go to Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;