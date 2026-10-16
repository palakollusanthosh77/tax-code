const Section = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h4>
      <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-200">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const SummaryView = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="card space-y-5">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Executive Summary</h4>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{summary.executiveSummary}</p>
      </div>
      <Section title="Important Amendments" items={summary.importantAmendments} />
      <Section title="Compliance Deadlines" items={summary.complianceDeadlines} />
      <Section title="Penalty Clauses" items={summary.penaltyClauses} />
      <Section title="Tax Rates" items={summary.taxRates} />
      <Section title="Action Items" items={summary.actionItems} />
    </div>
  );
};

export default SummaryView;
