import express from 'express';
import { getUsers, getUserById, updateProfile, changeUserRole } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.put('/:id/role', changeUserRole);

export default router;