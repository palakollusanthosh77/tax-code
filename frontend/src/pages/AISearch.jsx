import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, Loader2, History, Save } from 'lucide-react';
import { queryAI, getQueryHistoryApi } from '../api/aiApi';
import { createReportApi } from '../api/reportApi';
import AnswerCard from '../components/ai/AnswerCard';
import Loader from '../components/common/Loader';

const SAMPLE_QUESTIONS = [
  'What are GST late filing penalties?',
  'What is Section 80C?',
  'Depreciation rules for electric vehicles?',
];

const AISearch = () => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      const { data } = await getQueryHistoryApi({ limit: 8 });
      setHistory(data.data);
    } catch (err) {
      // silent - non critical
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAsk = async (e, q) => {
    e?.preventDefault();
    const finalQuestion = q || question;
    if (!finalQuestion.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const { data } = await queryAI(finalQuestion);
      setResult(data.data);
      setQuestion(finalQuestion);
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    try {
      await createReportApi({
        type: 'ai_query',
        title: `AI Query: ${question.slice(0, 60)}`,
        inputData: { question },
        result,
        sourceDocuments: result.sources.map((s) => s.documentTitle),
        confidenceScore: result.confidenceScore,
      });
      toast.success('Saved to Reports');
    } catch (err) {
      toast.error('Failed to save report');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Regulatory Search</h1>
        <p className="text-sm text-slate-400">Ask questions in plain English. Answers are grounded strictly in your uploaded documents.</p>
      </div>

      <form onSubmit={handleAsk} className="card flex items-center gap-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
          placeholder="e.g. What are GST late filing penalties?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-primary !py-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Ask'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={(e) => handleAsk(e, q)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
          >
            {q}
          </button>
        ))}
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="ml-auto flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
        >
          <History size={13} /> History
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div className="card space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent Queries</h4>
          {history.map((h) => (
            <button
              key={h._id}
              onClick={(e) => handleAsk(e, h.question)}
              className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {h.question}
            </button>
          ))}
        </div>
      )}

      {loading && <Loader size="lg" label="Searching regulatory knowledge base..." />}

      {result && !loading && (
        <div className="space-y-3">
          <AnswerCard result={result} />
          {result.grounded && (
            <button className="btn-secondary" onClick={handleSaveReport}>
              <Save size={15} /> Save as Report
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearch;
