const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const Document = require('../models/Document');
const AuditReport = require('../models/AuditReport');
const QueryHistory = require('../models/QueryHistory');

// @desc    Get dashboard summary stats + recent activity for current user
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const docFilter = {}; // shared library
  const userFilter = isAdmin ? {} : { user: req.user._id };

  const [totalDocuments, indexedDocuments, totalReports, totalQueries, recentDocuments, recentReports] =
    await Promise.all([
      Document.countDocuments(docFilter),
      Document.countDocuments({ status: 'indexed' }),
      AuditReport.countDocuments(userFilter),
      QueryHistory.countDocuments(userFilter),
      Document.find(docFilter).sort({ createdAt: -1 }).limit(5).select('title category status createdAt'),
      AuditReport.find(userFilter).sort({ createdAt: -1 }).limit(5).select('title type createdAt confidenceScore'),
    ]);

  sendResponse(res, 200, 'Dashboard data fetched', {
    stats: { totalDocuments, indexedDocuments, totalReports, totalQueries },
    recentDocuments,
    recentReports,
  });
});

module.exports = { getDashboardData };
