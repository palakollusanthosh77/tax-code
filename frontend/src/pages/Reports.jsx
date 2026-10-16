import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FolderClock } from 'lucide-react';
import { getReportsApi, deleteReportApi, downloadReportPdfUrl } from '../api/reportApi';
import ReportCard from '../components/reports/ReportCard';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'ai_query', label: 'AI Query' },
  { value: 'audit_observation', label: 'Audit Observation' },
  { value: 'summary', label: 'Document Summary' },
  { value: 'tax_comparison', label: 'Tax Comparison' },
];

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getReportsApi({ type, page, limit: 9 });
      setReports(data.data);
      setPages(data.meta?.pages || 1);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [type, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return;
    try {
      await deleteReportApi(id);
      toast.success('Report deleted');
      fetchReports();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleDownload = (id) => {
    const url = downloadReportPdfUrl(id);
    const token = localStorage.getItem('tci_token');
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `report-${id}.pdf`;
        link.click();
      })
      .catch(() => toast.error('Download failed'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-sm text-slate-400">All your saved AI-generated reports in one place.</p>
        </div>
        <select className="input-field sm:w-56" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader size="lg" label="Loading reports..." />
      ) : reports.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => (
              <ReportCard key={r._id} report={r} onDelete={handleDelete} onDownload={handleDownload} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState icon={FolderClock} title="No reports yet" description="Reports you save from AI Search, Audit Workspace, Summarizer, or Tax Comparison will appear here." />
      )}
    </div>
  );
};

export default Reports;
