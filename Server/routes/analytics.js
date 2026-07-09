import express from 'express';
import { getOverview, getMonthlyAnalytics, getTeamReport, getProjectReport } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/monthly', getMonthlyAnalytics);
router.get('/team-report', authorize('admin', 'Team Lead'), getTeamReport);
router.get('/project-report', authorize('admin', 'Team Lead'), getProjectReport);

export default router;
