import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  confirmTask,
  completeTask,
  assignTask,
  autoAssignAll,
  getMatchPreview,
  selfAssignTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('project')
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),
  body('requiredSkills')
    .optional()
    .isArray().withMessage('Required skills must be an array of strings'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Priority must be low, medium, high, or critical'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0.5, max: 160 }).withMessage('Estimated hours must be between 0.5 and 160'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Difficulty must be easy, medium, hard, or expert')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('requiredSkills')
    .optional()
    .isArray().withMessage('Required skills must be an array of strings'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Priority must be low, medium, high, or critical'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'delayed']).withMessage('Invalid status'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),
  body('assignedTo')
    .optional()
    .isMongoId().withMessage('Invalid user ID')
];

// All routes require authentication
router.use(protect);

// Standard CRUD — admins/Team Leads can create/update, admins can delete, all can view (with filtering)
router.get('/', getTasks);

// AI assignment — Team Lead/Admin only
router.post('/auto-assign-all', authorize('Team Lead', 'admin'), autoAssignAll);

router.get('/:id', getTaskById);
router.post('/', authorize('Team Lead', 'admin'), taskValidation, createTask);
router.put('/:id', authorize('Team Lead', 'admin'), updateTaskValidation, updateTask);
router.delete('/:id', authorize('Team Lead', 'admin'), deleteTask);

// Member self-assignment (only members can self-accept tasks)
router.post('/:id/self-assign', authorize('member'), selfAssignTask);

// Confirm/Complete — assigned members and Team Leads/Admin can do this (controller verifies assignment)
router.put('/:id/confirm', confirmTask);
router.put('/:id/complete', completeTask);

// AI assignment — Team Lead/Admin only
router.get('/:id/match-preview', authorize('Team Lead', 'admin'), getMatchPreview);
router.post('/:id/assign', authorize('Team Lead', 'admin'), assignTask);

export default router;
