import { Trash2, Download, FileJson2 } from 'lucide-react';
import ConfidenceBadge from '../common/ConfidenceBadge';

const TYPE_LABELS = {
  audit_observation: 'Audit Observation',
  summary: 'Document Summary',
  tax_comparison: 'Tax Comparison',
  ai_query: 'AI Query',
};

const ReportCard = ({ report, onDelete, onDownload }) => (
  <div className="card flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
        <FileJson2 size={20} />
      </div>
      <ConfidenceBadge score={report.confidenceScore} />
    </div>

    <div>
      <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{report.title}</h3>
      <p className="mt-0.5 text-xs text-slate-400">{TYPE_LABELS[report.type] || report.type}</p>
    </div>

    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDownload(report._id)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
          title="Download as PDF"
        >
          <Download size={15} />
        </button>
        <button
          onClick={() => onDelete(report._id)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
          title="Delete report"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  </div>
);

export default ReportCard;
