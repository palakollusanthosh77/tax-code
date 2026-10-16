const ConfidenceBadge = ({ score }) => {
  if (score === undefined || score === null) return null;
  let colorClass = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  if (score >= 80) colorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
  else if (score >= 55) colorClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';

  return <span className={`badge ${colorClass}`}>Confidence: {score}%</span>;
};

export default ConfidenceBadge;
