const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/50 py-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
    {Icon && <Icon size={40} className="text-slate-300 dark:text-slate-600" />}
    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
    {description && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
