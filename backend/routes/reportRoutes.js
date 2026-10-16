const express = require('express');
const { createReport, getReports, getReportById, deleteReport, downloadReportPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);
router.get('/:id/pdf', downloadReportPDF);

module.exports = router;
