const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const User = require('../models/User');
const QueryHistory = require('../models/QueryHistory');
const { answerRegulatoryQuestion } = require('../services/ragService');
const { generateJSON, generateText } = require('../services/geminiService');
const { compareTaxRegimes } = require('../services/taxService');
const { extractTextFromPDF } = require('../services/pdfService');
const Document = require('../models/Document');
const fs = require('fs');

const trackUsage = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { aiUsageCount: 1 } });
};

// @desc    AI Regulatory Search (RAG)
// @route   POST /api/ai/query
// @access  Private
const query = asyncHandler(async (req, res) => {
  const { question } = req.body;
  if (!question || question.trim().length < 3) {
    throw new ApiError(400, 'Please provide a valid question');
  }

  const result = await answerRegulatoryQuestion(question);

  await QueryHistory.create({
    user: req.user._id,
    question,
    answer: result.answer,
    sources: result.sources.map((s) => ({
      documentId: s.documentId,
      documentTitle: s.documentTitle,
      chunkText: s.chunkText,
      score: s.score,
    })),
    confidenceScore: result.confidenceScore,
    grounded: result.grounded,
  });

  await trackUsage(req.user._id);
  sendResponse(res, 200, 'Query processed', result);
});

// @desc    Get search history for current user
// @route   GET /api/ai/query/history
// @access  Private
const getQueryHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [history, total] = await Promise.all([
    QueryHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    QueryHistory.countDocuments({ user: req.user._id }),
  ]);

  sendResponse(res, 200, 'History fetched', history, { total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Audit Observation Generator
// @route   POST /api/ai/audit
// @access  Private
const generateAuditObservations = asyncHandler(async (req, res) => {
  const { transactionSummary } = req.body;
  if (!transactionSummary || transactionSummary.trim().length < 10) {
    throw new ApiError(400, 'Please provide a detailed transaction summary');
  }

  const systemInstruction = `You are an expert tax auditor AI for Chartered Accountants in India.
Analyze the given client transaction summary and identify distinct transactions/items.
For EACH transaction, produce a structured observation.
Never fabricate section numbers you are not confident about; if uncertain, mark complianceStatus as "Needs Review".
Return a JSON array where each element has exactly these fields:
transaction, applicableSection, complianceStatus (one of: Compliant, Non-Compliant, Partially Compliant, Needs Review), riskLevel (one of: Low, Medium, High, Critical), correctiveAction, supportingRegulation.`;

  const prompt = `Client transaction summary:\n"""${transactionSummary}"""\n\nGenerate the structured audit observations JSON array now.`;

  const observations = await generateJSON(prompt, systemInstruction);
  await trackUsage(req.user._id);

  sendResponse(res, 200, 'Audit observations generated', { observations });
});

// @desc    Smart Document Summarizer
// @route   POST /api/ai/summarize
// @access  Private
const summarizeDocument = asyncHandler(async (req, res) => {
  const { documentId, rawText } = req.body;

  let textToSummarize = rawText;
  let sourceTitle = 'Pasted Text';

  if (documentId) {
    const doc = await Document.findById(documentId);
    if (!doc) throw new ApiError(404, 'Document not found');
    if (!fs.existsSync(doc.filePath)) throw new ApiError(404, 'Source file missing on server');
    const { text } = await extractTextFromPDF(doc.filePath);
    textToSummarize = text;
    sourceTitle = doc.title;
  }

  if (!textToSummarize || textToSummarize.trim().length < 20) {
    throw new ApiError(400, 'No sufficient text provided to summarize');
  }

  const systemInstruction = `You are a regulatory document summarization AI for tax professionals.
Extract information ONLY from the provided text. Do not invent facts.
Return JSON with exactly these fields:
executiveSummary (string, 3-5 sentences),
importantAmendments (array of strings),
complianceDeadlines (array of strings),
penaltyClauses (array of strings),
taxRates (array of strings),
actionItems (array of strings).
If a category has no relevant content in the text, return an empty array for it.`;

  const prompt = `Document ("${sourceTitle}") text:\n"""${textToSummarize.slice(0, 30000)}"""\n\nGenerate the structured summary JSON now.`;

  const summary = await generateJSON(prompt, systemInstruction);
  await trackUsage(req.user._id);

  sendResponse(res, 200, 'Document summarized', { summary, sourceTitle });
});

// @desc    Tax Regime Comparison
// @route   POST /api/ai/tax-comparison
// @access  Private
const taxComparison = asyncHandler(async (req, res) => {
  const { salary, deductions, investments } = req.body;

  if (salary === undefined || salary < 0) {
    throw new ApiError(400, 'Please provide a valid salary amount');
  }

  const calc = compareTaxRegimes({
    salary: Number(salary) || 0,
    deductions: Number(deductions) || 0,
    investments: Number(investments) || 0,
  });

  const explanationPrompt = `A taxpayer has salary ₹${salary}, deductions ₹${deductions || 0}, investments ₹${investments || 0}.
Old regime taxable income: ₹${calc.oldRegime.taxableIncome}, tax payable: ₹${calc.oldRegime.taxPayable}.
New regime taxable income: ₹${calc.newRegime.taxableIncome}, tax payable: ₹${calc.newRegime.taxPayable}.
Recommended regime: ${calc.recommendation}, savings: ₹${calc.savings}.
Write a concise, professional 3-4 sentence explanation for a CA to share with this client, explaining why the recommended regime is better, in plain English.`;

  const explanation = await generateText(explanationPrompt);
  await trackUsage(req.user._id);

  sendResponse(res, 200, 'Tax comparison generated', { ...calc, explanation });
});

module.exports = {
  query,
  getQueryHistory,
  generateAuditObservations,
  summarizeDocument,
  taxComparison,
};
