const STATUS_STYLES = {
  indexed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Compliant: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Non-Compliant': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'Partially Compliant': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Needs Review': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
    {status}
  </span>
);

export default StatusBadge;
