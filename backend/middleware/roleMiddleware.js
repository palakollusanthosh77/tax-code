const ApiError = require('../utils/apiError');

/**
 * Restricts a route to specific roles, e.g. requireRole('admin')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
  next();
};

module.exports = { requireRole };
