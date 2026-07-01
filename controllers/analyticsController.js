import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get overview analytics
// @route   GET /api/analytics/overview
// @access  Private
export const getOverview = async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();

    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const delayedTasks = await Task.countDocuments({ status: 'delayed' });

    res.json({
      projects: totalProjects,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: pendingTasks,
        delayed: delayedTasks,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly analytics (last 6 months)
// @route   GET /api/analytics/monthly
// @access  Private
export const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const tasks = await Task.find({ createdAt: { $gte: sixMonthsAgo } });

    const monthlyMap = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyMap[key] = { month: label, key, created: 0, completed: 0 };
    }

    tasks.forEach((task) => {
      const d = new Date(task.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        monthlyMap[key].created++;
        if (task.status === 'completed') {
          monthlyMap[key].completed++;
        }
      }
    });

    res.json(Object.values(monthlyMap));
  } catch (error) {
    next(error);
  }
};