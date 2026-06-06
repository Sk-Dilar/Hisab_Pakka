import express from 'express';
import * as invoiceController from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', invoiceController.getInvoices);
router.post('/generate', invoiceController.generateInvoice);
router.get('/:id', invoiceController.getInvoice);
router.put('/:id/discount', invoiceController.updateDiscount);

export default router;
