const express = require('express');
const { body } = require('express-validator');
const {
  query,
  getQueryHistory,
  generateAuditObservations,
  summarizeDocument,
  taxComparison,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.post('/query', [body('question').trim().notEmpty()], validate, query);
router.get('/query/history', getQueryHistory);
router.post('/audit', [body('transactionSummary').trim().notEmpty()], validate, generateAuditObservations);
router.post('/summarize', summarizeDocument);
router.post(
  '/tax-comparison',
  [body('salary').isNumeric().withMessage('Salary must be a number')],
  validate,
  taxComparison
);

module.exports = router;
