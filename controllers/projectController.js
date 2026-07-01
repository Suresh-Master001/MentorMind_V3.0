import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { generateTasksForProject } from '../services/taskGeneratorService.js';
import { autoAssignAllTasks } from '../services/aiAssignmentService.js';
import { validationResult } from 'express-validator';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private (admin, manager, member)
export const getProjects = async (req, res, next) => {
  try {
    let projects;

    // Admins and managers see all projects; members see only projects they are part of
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      projects = await Project.find({})
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role skills');
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role skills');
    }

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role skills');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Members can only view projects they belong to
    if (
      req.user.role === 'member' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (admin, manager)
export const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, members, deadline, requiredTasks, organization } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || [],
      deadline,
      requiredTasks: requiredTasks || [],
      organization: organization || null
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role skills');

    try {
      const generatedTasks = await generateTasksForProject(populatedProject);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const projectDeadline = populatedProject.deadline ? new Date(populatedProject.deadline) : null;

      const savedTasks = await Task.insertMany(
        generatedTasks.map((t) => {
          let deadline = null;
          let startDate = null;
          if (typeof t.deadlineOffsetDays === 'number') {
            const d = new Date(today);
            d.setDate(d.getDate() + Math.max(1, t.deadlineOffsetDays));
            deadline = projectDeadline && d > projectDeadline ? projectDeadline : d;
            
            // Calculate start date (deadline - estimated days, with buffer)
            const estDays = Math.ceil((t.estimatedHours || 4) / 8);
            const start = new Date(deadline);
            start.setDate(start.getDate() - estDays);
            startDate = start > today ? start : today;
          } else if (projectDeadline) {
            deadline = projectDeadline;
            const estDays = Math.ceil((t.estimatedHours || 4) / 8);
            const start = new Date(deadline);
            start.setDate(start.getDate() - estDays);
            startDate = start > today ? start : today;
          }

          return {
            title: t.title,
            description: t.description || '',
            project: project._id,
            createdBy: req.user._id,
            priority: t.priority || 'medium',
            requiredSkills: t.requiredSkills || [],
            status: 'pending',
            deadline,
            estimatedHours: t.estimatedHours || 4,
            difficulty: t.difficulty || 'medium',
            estimatedStartDate: startDate
          };
        })
      );

      const assignments = await autoAssignAllTasks(project._id);

      const tasksGenerated = await Task.find({ project: project._id })
        .populate('assignedTo', 'name email role')
        .lean();

      res.status(201).json({
        success: true,
        project: populatedProject,
        tasksGenerated,
        assignments
      });
    } catch (aiError) {
      console.error('AI task generation / assignment failed, falling back to default tasks:', aiError);

      const fallbackTasks = [
        { title: 'Project Planning', description: 'Define scope, milestones, and deliverables', priority: 'high', requiredSkills: ['planning'] },
        { title: 'Design & Architecture', description: 'Create technical design and architecture docs', priority: 'high', requiredSkills: ['design'] },
        { title: 'Development Sprint 1', description: 'First development iteration', priority: 'medium', requiredSkills: ['development'] },
        { title: 'Testing & QA', description: 'Unit tests, integration tests, and QA review', priority: 'medium', requiredSkills: ['testing'] },
      ];

      await Task.insertMany(
        fallbackTasks.map((t) => ({
          title: t.title,
          description: t.description || '',
          project: project._id,
          createdBy: req.user._id,
          priority: t.priority || 'medium',
          requiredSkills: t.requiredSkills || [],
          status: 'pending'
        }))
      );

      const populatedProjectAgain = await Project.findById(project._id)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role skills');

      res.status(201).json({
        success: true,
        project: populatedProjectAgain,
        tasksGenerated: [],
        assignments: [],
        fallback: true
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (admin, manager)
export const updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { title, description, members, status, deadline } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (members !== undefined) project.members = members;
    if (status !== undefined) project.status = status;
    if (deadline !== undefined) project.deadline = deadline;

    const updatedProject = await project.save();

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role skills');

    res.json(populatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (admin, manager)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();

    res.json({ message: 'Project removed successfully' });
  } catch (error) {
    next(error);
  }
};