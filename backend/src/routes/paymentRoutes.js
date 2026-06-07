import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', paymentController.getPayments);
router.post('/', paymentController.addPayment);

export default router;
