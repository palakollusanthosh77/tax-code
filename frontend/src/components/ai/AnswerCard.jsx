import { BookOpen, ShieldAlert } from 'lucide-react';
import ConfidenceBadge from '../common/ConfidenceBadge';

const AnswerCard = ({ result }) => {
  if (!result) return null;
  const { answer, sources, confidenceScore, grounded } = result;

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">AI Answer</h3>
        <ConfidenceBadge score={confidenceScore} />
      </div>

      {!grounded ? (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <ShieldAlert size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm">{answer}</p>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{answer}</p>
      )}

      {sources?.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <BookOpen size={14} /> Source Documents
          </h4>
          <div className="space-y-2">
            {sources.map((s, i) => (
              <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s.documentTitle}</span>
                  <span className="text-[11px] text-slate-400">Match: {Math.round(s.score * 100)}%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.chunkText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerCard;
