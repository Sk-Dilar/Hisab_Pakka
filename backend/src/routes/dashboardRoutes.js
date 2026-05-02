import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, dashboardController.getStats);

export default router;
