const express = require('express');
const router = express.Router();
const workItemController = require('../controllers/workItemController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', workItemController.getWorkItems);
router.post('/', workItemController.addWorkItem);
router.delete('/:id', workItemController.deleteWorkItem);

module.exports = router;
