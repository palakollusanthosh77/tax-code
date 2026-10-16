import StatusBadge from '../common/StatusBadge';

const AuditResultTable = ({ observations }) => {
  if (!observations?.length) return null;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
            <th className="py-3 pr-4">Transaction</th>
            <th className="py-3 pr-4">Applicable Section</th>
            <th className="py-3 pr-4">Compliance</th>
            <th className="py-3 pr-4">Risk</th>
            <th className="py-3 pr-4">Corrective Action</th>
            <th className="py-3">Supporting Regulation</th>
          </tr>
        </thead>
        <tbody>
          {observations.map((obs, i) => (
            <tr key={i} className="border-b border-slate-50 align-top dark:border-slate-800/50">
              <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{obs.transaction}</td>
              <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{obs.applicableSection}</td>
              <td className="py-3 pr-4"><StatusBadge status={obs.complianceStatus} /></td>
              <td className="py-3 pr-4"><StatusBadge status={obs.riskLevel} /></td>
              <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{obs.correctiveAction}</td>
              <td className="py-3 text-slate-500 dark:text-slate-400">{obs.supportingRegulation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditResultTable;
