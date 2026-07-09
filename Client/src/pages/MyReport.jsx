import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyReportStats, getStandupNotes, saveStandupNote } from "../services/analyticsService";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Clock3, Sparkles, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className="rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const MyReport = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [standupNotes, setStandupNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [todayUpdate, setTodayUpdate] = useState("");
  const [blockers, setBlockers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchData = async () => {
    try {
      const [reportStats, notes] = await Promise.all([getMyReportStats(), getStandupNotes()]);
      setStats(reportStats);
      setStandupNotes(notes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredHistory = useMemo(() => {
    if (!stats?.taskHistory) return [];
    if (filter === "all") return stats.taskHistory;
    return stats.taskHistory.filter((task) => task.status === filter);
  }, [filter, stats]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!todayUpdate.trim()) return;
    try {
      setSubmitting(true);
      const note = await saveStandupNote({ todayUpdate, blockers, date: new Date().toISOString().slice(0, 10) });
      setStandupNotes((prev) => [note, ...prev].slice(0, 7));
      setTodayUpdate("");
      setBlockers("");
      toast.success("Standup note saved");
    } catch (_error) {
      toast.error("Could not save standup note");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">My Report</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A personal view of your completed work, recent updates, and growth.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tasks Completed" value={stats?.tasksCompleted ?? 0} icon={CheckCircle2} />
        <StatCard label="Hours Logged" value={`${stats?.hoursLogged ?? 0}h`} icon={Clock3} />
        <StatCard label="Avg Completion Time" value={`${stats?.avgCompletionDays ?? 0}d`} icon={TrendingUp} />
        <StatCard label="On-Time Rate" value={`${stats?.onTimeRate ?? 0}%`} icon={Sparkles} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task History</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="pb-3 font-medium">Task</th>
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Est.</th>
                  <th className="pb-3 font-medium">Actual</th>
                  <th className="pb-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr><td colSpan="6" className="py-6 text-center text-gray-400">No task history yet.</td></tr>
                ) : filteredHistory.map((task) => (
                  <tr key={task._id} className="border-b border-gray-100 text-gray-700 dark:border-gray-800 dark:text-gray-300">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{task.title}</div>
                      {task.workSummary && (
                        <button onClick={() => setExpandedRow(expandedRow === task._id ? null : task._id)} className="mt-1 text-xs text-purple-600 hover:text-purple-700">
                          {expandedRow === task._id ? "Hide summary" : "View summary"}
                        </button>
                      )}
                      {expandedRow === task._id && task.workSummary && <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">{task.workSummary}</p>}
                    </td>
                    <td className="py-3 pr-4">{task.project}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">{task.status}</span></td>
                    <td className="py-3 pr-4">{task.estimatedHours}h</td>
                    <td className="py-3 pr-4">{task.actualHours}h</td>
                    <td className="py-3 pr-4">{new Date(task.submitted).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Standup Notes</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Today's Update</label>
              <textarea value={todayUpdate} onChange={(e) => setTodayUpdate(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-700 dark:text-white" placeholder="What did you work on today?" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Blockers</label>
              <textarea value={blockers} onChange={(e) => setBlockers(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-700 dark:text-white" placeholder="Any issues or blockers?" />
            </div>
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all disabled:opacity-60">{submitting ? "Saving..." : "Save Standup Note"}</button>
          </form>
          <div className="mt-5 space-y-3">
            {standupNotes.length === 0 ? <p className="text-sm text-gray-400">No recent standup notes.</p> : standupNotes.map((note) => (
              <div key={note._id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(note.date).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{note.todayUpdate}</p>
                {note.blockers && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Blockers: {note.blockers}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Skills & Growth</h2>
          <a href="/profile" className="text-sm text-purple-600 hover:text-purple-700">Edit Skills</a>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.skillDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="skill" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {user?.skills?.length ? user.skills.map((skill) => <span key={skill} className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{skill}</span>) : <span className="text-sm text-gray-400">No skills listed yet.</span>}
        </div>
      </div>
    </div>
  );
};

export default MyReport;
