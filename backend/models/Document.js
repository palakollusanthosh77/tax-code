const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    originalFileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number },
    category: {
      type: String,
      enum: ['GST', 'Income Tax', 'Companies Act', 'Customs', 'RBI', 'SEBI', 'Other'],
      default: 'Other',
    },
    description: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['processing', 'indexed', 'failed'],
      default: 'processing',
    },
    chunkCount: { type: Number, default: 0 },
    pineconeNamespace: { type: String },
    extractedTextPreview: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

documentSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Document', documentSchema);
