const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const clientController = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Validation rules
const createClientValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phone').optional({ nullable: true }).trim(),
  body('companyName').optional({ nullable: true }).trim().isLength({ max: 150 }).withMessage('Company name cannot exceed 150 characters')
];

const updateClientValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phone').optional({ nullable: true }).trim(),
  body('companyName').optional({ nullable: true }).trim().isLength({ max: 150 }).withMessage('Company name cannot exceed 150 characters')
];

// Routes
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.post('/', createClientValidation, clientController.createClient);
router.put('/:id', updateClientValidation, clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
