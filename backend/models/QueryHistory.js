const mongoose = require('mongoose');

const queryHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    sources: [
      {
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        documentTitle: String,
        chunkText: String,
        score: Number,
      },
    ],
    confidenceScore: { type: Number, min: 0, max: 100 },
    grounded: { type: Boolean, default: true }, // false if "no relevant info found"
  },
  { timestamps: true }
);

module.exports = mongoose.model('QueryHistory', queryHistorySchema);
