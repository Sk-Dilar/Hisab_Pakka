import express from 'express';
import { body } from 'express-validator';
import * as clientController from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const createClientValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number starting with 6-9'),
  body('companyName').optional({ nullable: true }).trim().isLength({ max: 150 }).withMessage('Company name cannot exceed 150 characters')
];

const updateClientValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number starting with 6-9'),
  body('companyName').optional({ nullable: true }).trim().isLength({ max: 150 }).withMessage('Company name cannot exceed 150 characters')
];

// Routes
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.post('/', createClientValidation, clientController.createClient);
router.put('/:id', updateClientValidation, clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.put('/:id/restore', clientController.restoreClient);

export default router;
