import Task from '../models/Task.js';
import StandupNote from '../models/StandupNote.js';
import User from '../models/User.js';

const buildMemberReportPayload = async (userId, requester) => {
  const completedTasks = await Task.find({
    assignedTo: userId,
    status: 'completed',
  }).populate('project', 'title').lean();

  const tasksCompleted = completedTasks.length;
  const hoursLogged = completedTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

  const avgCompletionDays = completedTasks.length
    ? Math.round(
        completedTasks.reduce((sum, task) => {
          if (!task.completedAt && task.updatedAt) {
            return sum + Math.max(0, Math.ceil((new Date(task.updatedAt) - new Date(task.createdAt)) / (1000 * 60 * 60 * 24)));
          }
          return sum;
        }, 0) / completedTasks.length
      )
    : 0;

  const onTimeRate = completedTasks.length
    ? Math.round(
        (completedTasks.filter((task) => {
          if (!task.deadline) return true;
          return new Date(task.updatedAt || task.deadline) <= new Date(task.deadline);
        }).length / completedTasks.length) * 100
      )
    : 0;

  const taskHistory = completedTasks
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .map((task) => ({
      _id: task._id,
      title: task.title,
      project: task.project?.title || 'Unknown Project',
      status: task.status,
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0,
      submitted: task.updatedAt || task.createdAt,
      workSummary: task.workSummary || '',
      deadline: task.deadline,
    }));

  const skillCounts = completedTasks.reduce((acc, task) => {
    (task.requiredSkills || []).forEach((skill) => {
      const normalized = skill.trim();
      if (!normalized) return;
      acc[normalized] = (acc[normalized] || 0) + 1;
    });
    return acc;
  }, {});

  const skillDistribution = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  const standupNotes = await StandupNote.find({ user: userId }).sort({ date: -1 }).limit(7).lean();

  return {
    tasksCompleted,
    hoursLogged,
    avgCompletionDays,
    onTimeRate,
    taskHistory,
    skillDistribution,
    standupNotes,
    requestedBy: requester?.name || 'Admin',
  };
};

export const getMyStats = async (req, res, next) => {
  try {
    const stats = await buildMemberReportPayload(req.user._id, req.user);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getMemberReport = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId).select('name role teamName companyName skills organization').lean();

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'Team Lead' && req.user.organization?.toString() !== targetUser.organization?.toString()) {
      return res.status(403).json({ message: 'You can only view members from your organization' });
    }

    const stats = await buildMemberReportPayload(targetUserId, req.user);

    res.json({
      ...stats,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        role: targetUser.role,
        teamName: targetUser.teamName || 'Unassigned',
        companyName: targetUser.companyName || '',
        skills: targetUser.skills || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const upsertStandupNote = async (req, res, next) => {
  try {
    const { todayUpdate, blockers, date } = req.body;
    if (!todayUpdate?.trim()) {
      return res.status(400).json({ message: 'Today update is required' });
    }

    const note = await StandupNote.findOneAndUpdate(
      { user: req.user._id, date },
      { user: req.user._id, todayUpdate, blockers: blockers || '', date },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const getStandupNotes = async (req, res, next) => {
  try {
    const notes = await StandupNote.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    res.json(notes);
  } catch (error) {
    next(error);
  }
};
