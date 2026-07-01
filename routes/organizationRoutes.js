import express from 'express';
import { body } from 'express-validator';
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  addMember,
  removeMember
} from '../controllers/organizationController.js';

const router = express.Router();

const orgValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Organization name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

router.post('/', orgValidation, createOrganization);
router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);
router.post('/:id/members', addMember);
router.delete('/:id/members', removeMember);

export default router;