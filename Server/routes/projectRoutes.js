import express from 'express';
import { body } from 'express-validator';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Validation rules
const projectValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date'),
  body('members')
    .optional()
    .isArray().withMessage('Members must be an array of user IDs')
];

const updateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),
  body('status')
    .optional()
    .isIn(['planning', 'in-progress', 'completed', 'delayed']).withMessage('Invalid status'),
  body('members')
    .optional()
    .isArray().withMessage('Members must be an array of user IDs')
];

// All routes require authentication
router.use(protect);

// Routes accessible by all authenticated users (with view filtering in controller)
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Admin and Team Lead routes for project management
router.post('/', authorize('admin', 'Team Lead'), projectValidation, createProject);
router.put('/:id', authorize('admin', 'Team Lead'), updateValidation, updateProject);
router.delete('/:id', authorize('admin', 'Team Lead'), deleteProject);

export default router;