const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const AuditReport = require('../models/AuditReport');
const PDFDocument = require('pdfkit');

// @desc    Save an AI-generated report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { type, title, inputData, result, sourceDocuments, confidenceScore } = req.body;

  if (!type || !title || !result) {
    throw new ApiError(400, 'type, title, and result are required to save a report');
  }

  const report = await AuditReport.create({
    user: req.user._id,
    type,
    title,
    inputData,
    result,
    sourceDocuments: sourceDocuments || [],
    confidenceScore,
  });

  sendResponse(res, 201, 'Report saved', report);
});

// @desc    Get report history for current user (paginated)
// @route   GET /api/reports
// @access  Private
const getReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const query = { user: req.user._id };
  if (type) query.type = type;

  const skip = (Number(page) - 1) * Number(limit);
  const [reports, total] = await Promise.all([
    AuditReport.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    AuditReport.countDocuments(query),
  ]);

  sendResponse(res, 200, 'Reports fetched', reports, { total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Get a single report
// @route   GET /api/reports/:id
// @access  Private
const getReportById = asyncHandler(async (req, res) => {
  const report = await AuditReport.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found');
  if (report.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this report');
  }
  sendResponse(res, 200, 'Report fetched', report);
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = asyncHandler(async (req, res) => {
  const report = await AuditReport.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found');
  if (report.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this report');
  }
  await report.deleteOne();
  sendResponse(res, 200, 'Report deleted');
});

// @desc    Download a report as PDF
// @route   GET /api/reports/:id/pdf
// @access  Private
const downloadReportPDF = asyncHandler(async (req, res) => {
  const report = await AuditReport.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found');
  if (report.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to access this report');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report-${report._id}.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text('TaxCode Insight - Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(report.title, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('gray').text(`Type: ${report.type}`);
  doc.text(`Generated: ${report.createdAt.toISOString()}`);
  if (report.confidenceScore !== undefined) doc.text(`Confidence Score: ${report.confidenceScore}%`);
  doc.moveDown();
  doc.fillColor('black').fontSize(11).text(JSON.stringify(report.result, null, 2));

  doc.end();
});

module.exports = { createReport, getReports, getReportById, deleteReport, downloadReportPDF };
