import express from 'express';
import { body } from 'express-validator';
import { getMyStats, upsertStandupNote, getStandupNotes, getMemberReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my-stats', getMyStats);
router.get('/member/:id', authorize('admin', 'Team Lead'), getMemberReport);
router.post('/standup', [body('todayUpdate').trim().notEmpty().withMessage('Today update is required')], upsertStandupNote);
router.get('/standup', getStandupNotes);

export default router;
