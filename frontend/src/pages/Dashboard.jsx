import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, FolderClock, Search, ArrowRight } from 'lucide-react';
import { getDashboardDataApi } from '../api/dashboardApi';
import StatsCard from '../components/dashboard/StatsCard';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await getDashboardDataApi();
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader size="lg" label="Loading dashboard..." />;

  const { stats, recentDocuments, recentReports } = data || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-slate-400">Here's what's happening with your compliance workspace today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={FileText} label="Total Documents" value={stats?.totalDocuments ?? 0} accent="brand" />
        <StatsCard icon={CheckCircle2} label="Indexed & Searchable" value={stats?.indexedDocuments ?? 0} accent="emerald" />
        <StatsCard icon={FolderClock} label="Reports Generated" value={stats?.totalReports ?? 0} accent="violet" />
        <StatsCard icon={Search} label="AI Queries Run" value={stats?.totalQueries ?? 0} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white">Recently Uploaded Documents</h2>
            <Link to="/documents" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {recentDocuments?.length ? (
            <ul className="space-y-3">
              {recentDocuments.map((doc) => (
                <li key={doc._id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{doc.title}</p>
                    <p className="text-xs text-slate-400">{doc.category}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileText} title="No documents yet" description="Upload your first regulatory PDF to get started." />
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white">Recent Audit Reports</h2>
            <Link to="/reports" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {recentReports?.length ? (
            <ul className="space-y-3">
              {recentReports.map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{r.title}</p>
                    <p className="text-xs capitalize text-slate-400">{r.type.replace('_', ' ')}</p>
                  </div>
                  {r.confidenceScore !== undefined && (
                    <span className="text-xs font-medium text-slate-400">{r.confidenceScore}%</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FolderClock} title="No reports yet" description="Generated audit and AI reports will appear here." />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
