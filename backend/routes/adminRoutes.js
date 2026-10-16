const express = require('express');
const { getAllUsers, toggleUserStatus, getAllDocuments, getUsageStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/documents', getAllDocuments);
router.get('/usage', getUsageStats);

module.exports = router;
