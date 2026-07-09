import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, orgSetup } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array of strings')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const orgSetupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required'),
  body('companyEmail')
    .trim()
    .notEmpty().withMessage('Company email is required')
    .isEmail().withMessage('Please provide a valid company email')
];

router.post('/register', registerValidation, register);
// Hidden route — not linked anywhere in the public UI
router.post('/org/setup', orgSetupValidation, orgSetup);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);

export default router;
