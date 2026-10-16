import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, onPageChange }) => {
  if (!pages || pages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        className="btn-secondary !px-3 !py-2"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Page {page} of {pages}
      </span>
      <button
        className="btn-secondary !px-3 !py-2"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
