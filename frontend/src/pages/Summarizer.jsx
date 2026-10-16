import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FileScan, Loader2, Save } from 'lucide-react';
import { summarizeApi } from '../api/aiApi';
import { getDocumentsApi } from '../api/documentApi';
import { createReportApi } from '../api/reportApi';
import SummaryView from '../components/ai/SummaryView';
import Loader from '../components/common/Loader';

const Summarizer = () => {
  const [mode, setMode] = useState('document'); // 'document' | 'text'
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState('');
  const [rawText, setRawText] = useState('');
  const [summary, setSummary] = useState(null);
  const [sourceTitle, setSourceTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await getDocumentsApi({ limit: 100 });
        setDocuments(data.data.filter((d) => d.status === 'indexed'));
      } catch (err) {
        // silent
      }
    };
    fetchDocs();
  }, []);

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (mode === 'document' && !documentId) return toast.error('Please select a document');
    if (mode === 'text' && rawText.trim().length < 20) return toast.error('Please paste sufficient text to summarize');

    setLoading(true);
    setSummary(null);
    try {
      const payload = mode === 'document' ? { documentId } : { rawText };
      const { data } = await summarizeApi(payload);
      setSummary(data.data.summary);
      setSourceTitle(data.data.sourceTitle);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await createReportApi({
        type: 'summary',
        title: `Summary - ${sourceTitle}`,
        inputData: { mode, documentId },
        result: summary,
        sourceDocuments: [sourceTitle],
      });
      toast.success('Saved to Reports');
    } catch (err) {
      toast.error('Failed to save report');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Document Summarizer</h1>
        <p className="text-sm text-slate-400">Extract amendments, deadlines, penalties, tax rates, and action items instantly.</p>
      </div>

      <div className="card space-y-4">
        <div className="flex gap-2">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'document' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
            onClick={() => setMode('document')}
          >
            From Library
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'text' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
            onClick={() => setMode('text')}
          >
            Paste Text
          </button>
        </div>

        <form onSubmit={handleSummarize} className="space-y-4">
          {mode === 'document' ? (
            <div>
              <label className="label flex items-center gap-2">
                <FileScan size={15} /> Select a document
              </label>
              <select className="input-field" value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
                <option value="">-- Choose an indexed document --</option>
                {documents.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="label">Paste regulatory text</label>
              <textarea className="input-field" rows={8} value={rawText} onChange={(e) => setRawText(e.target.value)} />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Generate Summary
          </button>
        </form>
      </div>

      {loading && <Loader size="lg" label="Extracting key compliance insights..." />}

      {summary && !loading && (
        <div className="space-y-3">
          <SummaryView summary={summary} />
          <button className="btn-secondary" onClick={handleSave}>
            <Save size={15} /> Save as Report
          </button>
        </div>
      )}
    </div>
  );
};

export default Summarizer;
