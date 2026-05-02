import express from 'express';
import * as workItemController from '../controllers/workItemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', workItemController.getWorkItems);
router.post('/', workItemController.addWorkItem);
router.delete('/:id', workItemController.deleteWorkItem);

export default router;
