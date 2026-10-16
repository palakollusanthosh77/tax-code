const mongoose = require('mongoose');

const auditObservationSchema = new mongoose.Schema(
  {
    transaction: String,
    applicableSection: String,
    complianceStatus: { type: String, enum: ['Compliant', 'Non-Compliant', 'Partially Compliant', 'Needs Review'] },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
    correctiveAction: String,
    supportingRegulation: String,
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['audit_observation', 'summary', 'tax_comparison', 'ai_query'],
      required: true,
    },
    title: { type: String, required: true },
    inputData: { type: mongoose.Schema.Types.Mixed },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
    sourceDocuments: [{ type: String }],
    confidenceScore: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditReport', reportSchema);
