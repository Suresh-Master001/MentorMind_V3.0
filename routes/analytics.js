import express from 'express';
import { getOverview, getMonthlyAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/monthly', getMonthlyAnalytics);

export default router;