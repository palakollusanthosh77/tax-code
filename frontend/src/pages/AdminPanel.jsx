import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, FileText, BarChart3, ShieldCheck } from 'lucide-react';
import { getAllUsersApi, toggleUserStatusApi, getAllDocumentsAdminApi, getUsageStatsApi } from '../api/adminApi';
import StatsCard from '../components/dashboard/StatsCard';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';

const TABS = [
  { key: 'usage', label: 'Usage Overview', icon: BarChart3 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'documents', label: 'All Documents', icon: FileText },
];

const AdminPanel = () => {
  const [tab, setTab] = useState('usage');
  const [usage, setUsage] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usageRes, usersRes, docsRes] = await Promise.all([
        getUsageStatsApi(),
        getAllUsersApi(),
        getAllDocumentsAdminApi(),
      ]);
      setUsage(usageRes.data.data);
      setUsers(usersRes.data.data);
      setDocuments(docsRes.data.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatusApi(id);
      toast.success('User status updated');
      fetchAll();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  if (loading) return <Loader size="lg" label="Loading admin panel..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-brand-600" size={24} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === key ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'usage' && usage && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard icon={Users} label="Total Users" value={usage.totalUsers} accent="brand" />
            <StatsCard icon={FileText} label="Total Documents" value={usage.totalDocuments} accent="emerald" />
            <StatsCard icon={BarChart3} label="Reports Generated" value={usage.totalReports} accent="violet" />
            <StatsCard icon={BarChart3} label="AI Queries" value={usage.totalQueries} accent="amber" />
          </div>
          <div className="card">
            <h3 className="mb-4 font-semibold text-slate-800 dark:text-white">Top AI Users</h3>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {usage.topUsers.map((u) => (
                <li key={u._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-600">{u.aiUsageCount} queries</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-400 dark:border-slate-800">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{u.name}</td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="py-3 pr-4 capitalize text-slate-500 dark:text-slate-400">{u.role}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={u.isActive ? 'indexed' : 'failed'} />
                  </td>
                  <td className="py-3">
                    <button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => handleToggleStatus(u.id)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'documents' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-400 dark:border-slate-800">
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 pr-4">Uploaded By</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d._id} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{d.title}</td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{d.uploadedBy?.name}</td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{d.category}</td>
                  <td className="py-3"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
