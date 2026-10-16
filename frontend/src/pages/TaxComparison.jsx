import { useState } from 'react';
import toast from 'react-hot-toast';
import { Calculator, Loader2, Save } from 'lucide-react';
import { taxComparisonApi } from '../api/aiApi';
import { createReportApi } from '../api/reportApi';
import TaxCompareResult from '../components/ai/TaxCompareResult';
import Loader from '../components/common/Loader';

const TaxComparison = () => {
  const [form, setForm] = useState({ salary: '', deductions: '', investments: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.salary) return toast.error('Please enter the annual salary');

    setLoading(true);
    setResult(null);
    try {
      const { data } = await taxComparisonApi(form);
      setResult(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await createReportApi({
        type: 'tax_comparison',
        title: `Tax Regime Comparison - ₹${form.salary}`,
        inputData: form,
        result,
      });
      toast.success('Saved to Reports');
    } catch (err) {
      toast.error('Failed to save report');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tax Regime Comparison</h1>
        <p className="text-sm text-slate-400">Compare Old vs New income tax regimes and get an AI-generated recommendation.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label flex items-center gap-2">
            <Calculator size={15} /> Annual Salary (₹)
          </label>
          <input type="number" name="salary" min="0" className="input-field" placeholder="e.g. 1200000" value={form.salary} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Total Deductions (80C, 80D etc.) (₹)</label>
          <input type="number" name="deductions" min="0" className="input-field" placeholder="e.g. 150000" value={form.deductions} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Other Investments / Exemptions (₹)</label>
          <input type="number" name="investments" min="0" className="input-field" placeholder="e.g. 50000" value={form.investments} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Compare Regimes
        </button>
      </form>

      {loading && <Loader size="lg" label="Calculating tax liability..." />}

      {result && !loading && (
        <div className="space-y-3">
          <TaxCompareResult data={result} />
          <button className="btn-secondary" onClick={handleSave}>
            <Save size={15} /> Save as Report
          </button>
        </div>
      )}
    </div>
  );
};

export default TaxComparison;
