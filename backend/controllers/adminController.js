const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const User = require('../models/User');
const Document = require('../models/Document');
const AuditReport = require('../models/AuditReport');
const QueryHistory = require('../models/QueryHistory');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  sendResponse(res, 200, 'Users fetched', users.map((u) => u.toSafeObject()));
});

// @desc    Toggle a user's active status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendResponse(res, 404, 'User not found');
  user.isActive = !user.isActive;
  await user.save();
  sendResponse(res, 200, 'User status updated', user.toSafeObject());
});

// @desc    Get all documents (admin view, across all users)
// @route   GET /api/admin/documents
// @access  Private/Admin
const getAllDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find().populate('uploadedBy', 'name email').sort({ createdAt: -1 });
  sendResponse(res, 200, 'Documents fetched', documents);
});

// @desc    Monitor AI usage stats across the platform
// @route   GET /api/admin/usage
// @access  Private/Admin
const getUsageStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalDocuments, totalReports, totalQueries, topUsers] = await Promise.all([
    User.countDocuments(),
    Document.countDocuments(),
    AuditReport.countDocuments(),
    QueryHistory.countDocuments(),
    User.find().sort({ aiUsageCount: -1 }).limit(5).select('name email aiUsageCount'),
  ]);

  sendResponse(res, 200, 'Usage stats fetched', {
    totalUsers,
    totalDocuments,
    totalReports,
    totalQueries,
    topUsers,
  });
});

module.exports = { getAllUsers, toggleUserStatus, getAllDocuments, getUsageStats };
