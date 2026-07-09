import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

const getOrgScope = (req) => {
  if (req.user?.organization) {
    return { organization: req.user.organization };
  }
  return {};
};

// @desc    Get overview analytics
// @route   GET /api/analytics/overview
// @access  Private
export const getOverview = async (req, res, next) => {
  try {
    const scope = getOrgScope(req);
    const totalProjects = await Project.countDocuments(scope);
    const totalTasks = await Task.countDocuments(scope);

    const completedTasks = await Task.countDocuments({ ...scope, status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ ...scope, status: 'in-progress' });
    const pendingTasks = await Task.countDocuments({ ...scope, status: 'pending' });
    const delayedTasks = await Task.countDocuments({ ...scope, status: 'delayed' });

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
    const scope = getOrgScope(req);
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const tasks = await Task.find({ ...scope, createdAt: { $gte: sixMonthsAgo } });

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

// @desc    Get team-wise report
// @route   GET /api/analytics/team-report
// @access  Private (admin, manager)
export const getTeamReport = async (req, res, next) => {
  try {
    const scope = getOrgScope(req);
    const users = await User.find({ ...scope, role: { $ne: 'admin' } }).select('name role teamName skills availability currentWorkload');
    const teams = {};

    for (const user of users) {
      const teamName = user.teamName?.trim() || 'Unassigned';
      if (!teams[teamName]) {
        teams[teamName] = {
          teamName,
          members: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          delayedTasks: 0,
          membersList: [],
          memberBreakdown: [],
        };
      }

      teams[teamName].members++;
      teams[teamName].membersList.push(user.name);
      teams[teamName].memberBreakdown.push({
        _id: user._id,
        name: user.name,
        role: user.role,
        skills: user.skills || [],
        availability: user.availability ?? 100,
        workload: user.currentWorkload ?? 0,
      });

      const userTasks = await Task.find({ assignedTo: user._id, ...scope });
      teams[teamName].totalTasks += userTasks.length;
      teams[teamName].completedTasks += userTasks.filter(t => t.status === 'completed').length;
      teams[teamName].inProgressTasks += userTasks.filter(t => t.status === 'in-progress').length;
      teams[teamName].pendingTasks += userTasks.filter(t => t.status === 'pending').length;
      teams[teamName].delayedTasks += userTasks.filter(t => t.status === 'delayed').length;
    }

    res.json(Object.values(teams));
  } catch (error) {
    next(error);
  }
};

// @desc    Get project-wise report
// @route   GET /api/analytics/project-report
// @access  Private (admin, manager)
export const getProjectReport = async (req, res, next) => {
  try {
    const scope = getOrgScope(req);
    const projects = await Project.find(scope)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    const report = await Promise.all(projects.map(async (project) => {
      const taskCount = await Task.countDocuments({ project: project._id, ...scope });
      const completedTasks = await Task.countDocuments({ project: project._id, ...scope, status: 'completed' });
      const delayedTasks = await Task.countDocuments({ project: project._id, ...scope, status: 'delayed' });

      return {
        _id: project._id,
        title: project.title,
        status: project.status,
        deadline: project.deadline,
        createdBy: project.createdBy?.name || 'Unknown',
        memberCount: project.members?.length || 0,
        members: project.members?.map(m => ({ name: m.name, role: m.role })) || [],
        taskCount,
        completedTasks,
        delayedTasks,
        createdAt: project.createdAt
      };
    }));

    res.json(report);
  } catch (error) {
    next(error);
  }
};
