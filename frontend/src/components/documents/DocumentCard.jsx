import { FileText, Trash2, Download } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const DocumentCard = ({ doc, onDelete, canDelete }) => {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950">
          <FileText size={20} />
        </div>
        <StatusBadge status={doc.status} />
      </div>

      <div>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{doc.title}</h3>
        <p className="mt-0.5 text-xs text-slate-400">{doc.category} · {doc.chunkCount || 0} chunks</p>
      </div>

      {doc.description && <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{doc.description}</p>}

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-2">
          <a
            href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${doc.filePath?.replace(/\\/g, '/').split('backend/')[1] || ''}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
            title="Open PDF"
          >
            <Download size={15} />
          </a>
          {canDelete && (
            <button
              onClick={() => onDelete(doc._id)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
              title="Delete document"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
