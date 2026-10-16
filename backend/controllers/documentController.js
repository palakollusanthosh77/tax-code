const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const Document = require('../models/Document');
const { extractTextFromPDF } = require('../services/pdfService');
const chunkText = require('../utils/chunkText');
const { embedChunks } = require('../services/embeddingService');
const { upsertChunks, deleteDocumentVectors } = require('../services/pineconeService');
const logger = require('../utils/logger');

// @desc    Upload a PDF, extract, chunk, embed, and index it (RAG pipeline)
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No PDF file uploaded');
  }

  const { title, category, description } = req.body;

  const document = await Document.create({
    title: title || req.file.originalname,
    originalFileName: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size,
    category: category || 'Other',
    description: description || '',
    uploadedBy: req.user._id,
    status: 'processing',
  });

  // Respond immediately, then process asynchronously so the UI isn't blocked
  sendResponse(res, 201, 'Document uploaded, processing started', { document });

  // --- RAG pipeline (fire and forget, logs errors, updates status) ---
  (async () => {
    try {
      const { text } = await extractTextFromPDF(document.filePath);
      const chunks = chunkText(text, 1500, 200);

      if (chunks.length === 0) {
        document.status = 'failed';
        await document.save();
        return;
      }

      const embeddings = await embedChunks(chunks);
      await upsertChunks({
        documentId: document._id,
        documentTitle: document.title,
        chunks,
        embeddings,
        category: document.category,
      });

      document.status = 'indexed';
      document.chunkCount = chunks.length;
      document.extractedTextPreview = text.slice(0, 500);
      await document.save();
      logger.info(`Document indexed: ${document._id} (${chunks.length} chunks)`);
    } catch (error) {
      logger.error(`Failed to process document ${document._id}:`, error.message);
      document.status = 'failed';
      await document.save();
    }
  })();
});

// @desc    Get all documents (with search + pagination)
// @route   GET /api/documents
// @access  Private
const getDocuments = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;

  const query = {};
  if (!['admin'].includes(req.user.role)) {
    // regular users see all indexed docs (shared library) - adjust if per-user isolation needed
  }
  if (search) {
    query.$text = { $search: search };
  }
  if (category) {
    query.category = category;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Document.countDocuments(query),
  ]);

  sendResponse(res, 200, 'Documents fetched', documents, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id).populate('uploadedBy', 'name email');
  if (!document) throw new ApiError(404, 'Document not found');
  sendResponse(res, 200, 'Document fetched', document);
});

// @desc    Delete a document (removes file, DB record, and Pinecone vectors)
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) throw new ApiError(404, 'Document not found');

  const isOwner = document.uploadedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this document');
  }

  if (fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }

  await deleteDocumentVectors(document._id).catch((err) =>
    logger.warn('Pinecone cleanup failed (non-fatal):', err.message)
  );

  await document.deleteOne();
  sendResponse(res, 200, 'Document deleted successfully');
});

module.exports = { uploadDocument, getDocuments, getDocumentById, deleteDocument };
