import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Search,
  ClipboardCheck,
  FileScan,
  Calculator,
  FolderClock,
  UserCircle,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/documents', label: 'Document Library', icon: FileText },
  { to: '/ai-search', label: 'AI Regulatory Search', icon: Search },
  { to: '/audit-workspace', label: 'Audit Workspace', icon: ClipboardCheck },
  { to: '/summarizer', label: 'Smart Summarizer', icon: FileScan },
  { to: '/tax-comparison', label: 'Tax Regime Comparison', icon: Calculator },
  { to: '/reports', label: 'Reports', icon: FolderClock },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const Sidebar = ({ open, onClose }) => {
  const { isAdmin } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Scale size={18} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">TaxCode Insight</p>
            <p className="text-[11px] leading-tight text-slate-400">Audit & Compliance AI</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <ShieldCheck size={18} />
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="border-t border-slate-200 px-4 py-4 text-[11px] text-slate-400 dark:border-slate-800">
          TaxCode Insight v1.0 · Built for CAs & Auditors
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
