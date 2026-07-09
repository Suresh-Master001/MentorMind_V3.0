import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { calculateBestMatch, WORKLOAD_INCREMENT, MAX_WORKLOAD } from '../services/aiAssignmentService.js';
import { sendNotification } from '../services/notificationService.js';

// @desc    Get all tasks (filtered by project if projectId provided)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    let filter = {};

    // Filter by project if query param provided
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }

    // Members can see their own assigned tasks AND unassigned tasks from their projects
    if (req.user.role === 'member') {
      // Get all projects where the user is a member
      const projects = await Project.find({ members: req.user._id });
      const projectIds = projects.map(p => p._id);
      
      filter = {
        $or: [
          { assignedTo: req.user._id },
          { assignedTo: null, project: { $in: projectIds } }
        ]
      };
      
      // Apply project filter if specified
      if (req.query.projectId) {
        filter = {
          $and: [
            {
              $or: [
                { assignedTo: req.user._id },
                { assignedTo: null }
              ]
            },
            { project: req.query.projectId }
          ]
        };
      }
    }

    const tasks = await Task.find(filter)
      .populate('project', 'title status')
      .populate('assignedTo', 'name email role skills')
      .populate('createdBy', 'name email role');

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title status members')
      .populate('assignedTo', 'name email role skills')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only view their own tasks
    if (
      req.user.role === 'member' &&
      task.assignedTo &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private (admin, Team Lead)
export const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, project, requiredSkills, priority, deadline, estimatedHours, difficulty } = req.body;

    // Calculate start/end dates based on estimated hours if deadline provided
    let estimatedStartDate = null;
    let taskDeadline = deadline;
    if (taskDeadline && estimatedHours) {
      const estDays = Math.ceil(estimatedHours / 8);
      const start = new Date(taskDeadline);
      start.setDate(start.getDate() - estDays);
      estimatedStartDate = start > new Date() ? start : new Date();
    }

    const task = await Task.create({
      title,
      description,
      project,
      requiredSkills: requiredSkills || [],
      priority: priority || 'medium',
      deadline: taskDeadline,
      estimatedHours: estimatedHours || 4,
      difficulty: difficulty || 'medium',
      estimatedStartDate,
      createdBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title status')
      .populate('createdBy', 'name email role');

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (admin, Team Lead)
export const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (req.user.role === 'Team Lead' && project?.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Team Leads can only edit tasks in projects they created' });
    }

    const { title, description, requiredSkills, priority, deadline, status } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (requiredSkills !== undefined) task.requiredSkills = requiredSkills;
    if (priority !== undefined) task.priority = priority;
    if (deadline !== undefined) task.deadline = deadline;
    if (status !== undefined) task.status = status;

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'title status')
      .populate('assignedTo', 'name email role skills')
      .populate('createdBy', 'name email role');

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (admin, Team Lead)
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Both admin and Team Lead can delete tasks
    if (req.user.role !== 'admin' && req.user.role !== 'Team Lead') {
      return res.status(403).json({ message: 'Not authorized to delete tasks' });
    }

    await task.deleteOne();

    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Member self-assigns a task (manual acceptance)
// @route   POST /api/tasks/:id/self-assign
// @access  Private (member only)
export const selfAssignTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Task must be unassigned
    if (task.assignedTo) {
      return res.status(400).json({ message: 'Task is already assigned to someone' });
    }

    // Check that the member belongs to the project
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    // Assign the task to the requesting member
    task.assignedTo = req.user._id;
    task.status = 'pending';
    await task.save();

    // Update user workload
    const user = await User.findById(req.user._id);
    if (user) {
      user.currentWorkload = Math.min(100, (user.currentWorkload || 0) + 10);
      user.totalAssignedHours = (user.totalAssignedHours || 0) + (task.estimatedHours || 4);
      await user.save();
    }

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title status')
      .populate('assignedTo', 'name email role skills')
      .populate('createdBy', 'name email role');

    const io = req.app.get('io');
    if (io && populatedTask.createdBy?._id) {
      await sendNotification(io, {
        userId: populatedTask.createdBy._id,
        message: `${req.user.name} accepted task "${populatedTask.title}" in ${populatedTask.project?.title || 'the project'}`,
        type: 'task_assigned',
        relatedTask: populatedTask._id,
        relatedProject: populatedTask.project?._id,
        fromUser: req.user._id,
      });
    }

    res.json({ message: 'Task self-assigned successfully', task: populatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Member confirms a task assignment
// @route   PUT /api/tasks/:id/confirm
// @access  Private (member only — assigned member)
export const confirmTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only the assigned member or Team Lead can confirm
    if (
      !task.assignedTo ||
      (task.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'Team Lead')
    ) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    task.status = 'in-progress';
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title status')
      .populate('assignedTo', 'name email role skills')
      .populate('createdBy', 'name email role');

    const io = req.app.get('io');
    if (io) {
      io.to(populatedTask.assignedTo?._id?.toString()).emit('task:assigned', {
        task: populatedTask,
        type: 'assigned',
        title: populatedTask.title,
      });
      if (populatedTask.createdBy?._id?.toString() !== populatedTask.assignedTo?._id?.toString()) {
        await sendNotification(io, {
          userId: populatedTask.createdBy._id,
          message: `${populatedTask.assignedTo?.name} confirmed and started "${populatedTask.title}"`,
          type: 'task_started',
          relatedTask: populatedTask._id,
          relatedProject: populatedTask.project?._id,
          fromUser: populatedTask.assignedTo?._id,
        });
      }
    }

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Member marks a task as completed
// @route   PUT /api/tasks/:id/complete
// @access  Private (member only — assigned member)
export const completeTask = async (req, res, next) => {
  try {
    const { workSummary, actualHours, wentWell, blockers } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only the assigned member or Team Lead can complete
    if (
      !task.assignedTo ||
      (task.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'Team Lead')
    ) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    task.status = 'completed';
    task.actualHours = actualHours ?? task.actualHours;
    if (workSummary) task.workSummary = workSummary;
    if (wentWell !== undefined) task.wentWell = wentWell;
    if (blockers !== undefined) task.blockers = blockers;
    task.progress = 100;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title status')
      .populate('assignedTo', 'name email role skills')
      .populate('createdBy', 'name email role');

    const io = req.app.get('io');
    if (io) {
      io.to(populatedTask.assignedTo?._id?.toString()).emit('task:completed', {
        task: populatedTask,
        type: 'completed',
        title: populatedTask.title,
      });
      if (populatedTask.createdBy && populatedTask.createdBy._id.toString() !== populatedTask.assignedTo._id.toString()) {
        await sendNotification(io, {
          userId: populatedTask.createdBy._id,
          message: `${populatedTask.assignedTo?.name} completed "${populatedTask.title}" — ${task.actualHours || 0}h logged. View work summary.`,
          type: 'task_completed',
          relatedTask: populatedTask._id,
          relatedProject: populatedTask.project?._id,
          fromUser: populatedTask.assignedTo?._id,
        });
      }

      const adminUsers = await User.find({ role: 'admin', organization: req.user.organization }).select('_id');
      for (const admin of adminUsers) {
        await sendNotification(io, {
          userId: admin._id,
          message: `Task "${populatedTask.title}" in ${populatedTask.project?.title || 'the project'} has been completed by ${populatedTask.assignedTo?.name}`,
          type: 'task_completed',
          relatedTask: populatedTask._id,
          relatedProject: populatedTask.project?._id,
          fromUser: populatedTask.assignedTo?._id,
        });
      }
    }

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    AI assign task to the best matching member
// @route   POST /api/tasks/:id/assign
// @access  Private (admin, Team Lead)
export const assignTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Fetch the project to get eligible members
    const project = await Project.findById(task.project).populate('members');
    if (!project) {
      return res.status(404).json({ message: 'Project not found for this task' });
    }

    const eligibleUsers = project.members || [];

    // Run the AI scoring engine
    const result = calculateBestMatch(task, eligibleUsers);

    if (!result.bestUser) {
      // No one has matching skills — mark as unassigned
      task.assignedTo = null;
      task.status = 'unassigned';
      task.skillScore = 0;
      task.availabilityScore = 0;
      task.workloadScore = 0;
      task.finalScore = 0;
      await task.save();

      return res.json({
        message: 'No matching member found with the required skills. Task marked as unassigned.',
        task,
        scoreBreakdown: result
      });
    }

    // Assign the winner
    task.assignedTo = result.bestUser._id;
    task.skillScore = result.skillScore;
    task.availabilityScore = result.availabilityScore;
    task.workloadScore = result.workloadScore;
    task.finalScore = result.finalScore;
    task.status = 'pending';
    await task.save();

    // Increment the assigned user's workload (capped at MAX_WORKLOAD)
    const assignedUser = await User.findById(result.bestUser._id);
    if (assignedUser) {
      assignedUser.currentWorkload = Math.min(
        MAX_WORKLOAD,
        (assignedUser.currentWorkload || 0) + WORKLOAD_INCREMENT
      );
      await assignedUser.save();
    }

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title status')
      .populate('assignedTo', 'name email role skills availability currentWorkload')
      .populate('createdBy', 'name email role');

    const io = req.app.get('io');
    if (io) {
      io.to(populatedTask.assignedTo._id.toString()).emit('task:assigned', {
        task: populatedTask,
        type: 'assigned',
        title: populatedTask.title,
        assignedTo: populatedTask.assignedTo.name,
      });

      await sendNotification(io, {
        userId: populatedTask.assignedTo._id,
        message: `You've been assigned "${populatedTask.title}" in ${populatedTask.project?.title || 'the project'}. Please confirm to start.`,
        type: 'task_assigned',
        relatedTask: populatedTask._id,
        relatedProject: populatedTask.project?._id,
        fromUser: populatedTask.createdBy?._id,
      });

      if (populatedTask.createdBy && populatedTask.createdBy._id.toString() !== populatedTask.assignedTo._id.toString()) {
        await sendNotification(io, {
          userId: populatedTask.createdBy._id,
          message: `${populatedTask.assignedTo.name} was auto-assigned "${populatedTask.title}"`,
          type: 'task_assigned',
          relatedTask: populatedTask._id,
          relatedProject: populatedTask.project?._id,
          fromUser: populatedTask.assignedTo._id,
        });
      }
    }

    res.json({
      message: `Task assigned to ${result.bestUser.name}`,
      task: populatedTask,
      scoreBreakdown: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-assign all unassigned tasks in a project (batch mode)
// @route   POST /api/tasks/auto-assign-all
// @access  Private (admin, Team Lead)
export const autoAssignAll = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }

    // Fetch project with member population
    const project = await Project.findById(projectId).populate('members');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find all unassigned tasks for this project
    const unassignedTasks = await Task.find({
      project: projectId,
      $or: [
        { assignedTo: null },
        { assignedTo: { $exists: false } }
      ]
    });

    if (unassignedTasks.length === 0) {
      return res.json({ message: 'No unassigned tasks found in this project', assignments: [] });
    }

    const eligibleUsers = project.members || [];
    const assignments = [];

    for (const task of unassignedTasks) {
      const result = calculateBestMatch(task, eligibleUsers);

      if (!result.bestUser) {
        task.assignedTo = null;
        task.status = 'unassigned';
        task.skillScore = 0;
        task.availabilityScore = 0;
        task.workloadScore = 0;
        task.finalScore = 0;
        await task.save();

        assignments.push({
          taskId: task._id,
          title: task.title,
          assignedTo: null,
          status: 'unassigned',
          message: 'No matching member found',
          scoreBreakdown: result
        });
        continue;
      }

      // Assign and update workload
      task.assignedTo = result.bestUser._id;
      task.skillScore = result.skillScore;
      task.availabilityScore = result.availabilityScore;
      task.workloadScore = result.workloadScore;
      task.finalScore = result.finalScore;
      task.status = 'pending';
      await task.save();

      const assignedUser = await User.findById(result.bestUser._id);
      if (assignedUser) {
        assignedUser.currentWorkload = Math.min(
          MAX_WORKLOAD,
          (assignedUser.currentWorkload || 0) + WORKLOAD_INCREMENT
        );
        await assignedUser.save();
      }

      const populatedTask = await Task.findById(task._id)
        .populate('project', 'title status')
        .populate('assignedTo', 'name email role skills')
        .populate('createdBy', 'name email role');

      const io = req.app.get('io');
      if (io) {
        io.to(result.bestUser._id.toString()).emit('task:assigned', {
          task: populatedTask,
          type: 'assigned',
          title: task.title,
          assignedTo: result.bestUser.name,
        });

        await sendNotification(io, {
          userId: result.bestUser._id,
          message: `You've been assigned "${task.title}" in ${populatedTask.project?.title || 'the project'}. Please confirm to start.`,
          type: 'task_assigned',
          relatedTask: populatedTask._id,
          relatedProject: populatedTask.project?._id,
          fromUser: populatedTask.createdBy?._id,
        });

        if (populatedTask.createdBy && populatedTask.createdBy._id.toString() !== result.bestUser._id.toString()) {
          await sendNotification(io, {
            userId: populatedTask.createdBy._id,
            message: `${result.bestUser.name} was auto-assigned "${task.title}"`,
            type: 'task_assigned',
            relatedTask: populatedTask._id,
            relatedProject: populatedTask.project?._id,
            fromUser: result.bestUser._id,
          });
        }
      }

      assignments.push({
        taskId: task._id,
        title: task.title,
        assignedTo: {
          _id: result.bestUser._id,
          name: result.bestUser.name,
          email: result.bestUser.email
        },
        status: 'pending',
        message: `Assigned to ${result.bestUser.name}`,
        scoreBreakdown: result
      });
    }

    res.json({
      message: `Auto-assigned ${assignments.filter((a) => a.assignedTo).length} out of ${assignments.length} tasks`,
      totalTasks: assignments.length,
      assignedCount: assignments.filter((a) => a.assignedTo).length,
      unassignedCount: assignments.filter((a) => !a.assignedTo).length,
      assignments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get match scores for ALL eligible members (not just the winner)
// @route   GET /api/tasks/:id/match-preview
// @access  Private (admin, Team Lead)
export const getMatchPreview = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project).populate('members');
    if (!project) {
      return res.status(404).json({ message: 'Project not found for this task' });
    }

    const eligibleUsers = project.members || [];

    // Run the scoring engine — allScores contains every user's breakdown
    const result = calculateBestMatch(task, eligibleUsers);

    res.json({
      taskId: task._id,
      title: task.title,
      requiredSkills: task.requiredSkills,
      project: {
        _id: project._id,
        title: project.title
      },
      winner: result.bestUser
        ? {
            _id: result.bestUser._id,
            name: result.bestUser.name,
            email: result.bestUser.email,
            finalScore: result.finalScore
          }
        : null,
      allScores: result.allScores
    });
  } catch (error) {
    next(error);
  }
};