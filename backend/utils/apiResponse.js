/**
 * Standardized success response helper.
 * Keeps API responses consistent across all controllers.
 */
const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

module.exports = sendResponse;
