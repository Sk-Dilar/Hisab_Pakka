import express from 'express';
import { body, validationResult } from 'express-validator';
import * as clientController from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Collect express-validator results and reject with a friendly 400. Without this
// the validation chains below run but their errors are never read (dead code).
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Validation rules
const createClientValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required').bail()
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number starting with 6-9'),
  body('companyName').optional({ nullable: true }).trim().isLength({ max: 150 }).withMessage('Company name cannot exceed 150 characters')
];

const updateClientValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number starting with 6-9'),
  body('companyName').optional({ nullable: true }).trim().isLength({ max: 150 }).withMessage('Company name cannot exceed 150 characters')
];

// Routes
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.post('/', createClientValidation, runValidation, clientController.createClient);
router.put('/:id', updateClientValidation, runValidation, clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.put('/:id/restore', clientController.restoreClient);

export default router;
