import { useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardCheck, Loader2, Save } from 'lucide-react';
import { generateAuditApi } from '../api/aiApi';
import { createReportApi } from '../api/reportApi';
import AuditResultTable from '../components/ai/AuditResultTable';
import Loader from '../components/common/Loader';

const PLACEHOLDER = `e.g.
1. Payment of Rs. 2,50,000 made to a contractor without TDS deduction under Section 194C.
2. Cash purchase of raw materials worth Rs. 15,000 from an unregistered dealer.
3. Director's remuneration of Rs. 12,00,000 paid without board resolution.`;

const AuditWorkspace = () => {
  const [summary, setSummary] = useState('');
  const [observations, setObservations] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (summary.trim().length < 10) return toast.error('Please provide a more detailed transaction summary');

    setLoading(true);
    setObservations(null);
    try {
      const { data } = await generateAuditApi(summary);
      setObservations(data.data.observations);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate audit observations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await createReportApi({
        type: 'audit_observation',
        title: `Audit Observations - ${new Date().toLocaleDateString()}`,
        inputData: { transactionSummary: summary },
        result: observations,
      });
      toast.success('Saved to Reports');
    } catch (err) {
      toast.error('Failed to save report');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Observation Generator</h1>
        <p className="text-sm text-slate-400">Paste client transaction summaries to generate structured audit observations.</p>
      </div>

      <form onSubmit={handleGenerate} className="card space-y-4">
        <div>
          <label className="label flex items-center gap-2">
            <ClipboardCheck size={15} /> Client Transaction Summary
          </label>
          <textarea
            className="input-field"
            rows={8}
            placeholder={PLACEHOLDER}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Generate Audit Observations
        </button>
      </form>

      {loading && <Loader size="lg" label="Analyzing transactions against regulatory rules..." />}

      {observations && !loading && (
        <div className="space-y-3">
          <AuditResultTable observations={observations} />
          <button className="btn-secondary" onClick={handleSave}>
            <Save size={15} /> Save as Report
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditWorkspace;
