const TaxCompareResult = ({ data }) => {
  if (!data) return null;
  const { oldRegime, newRegime, recommendation, savings, explanation } = data;

  return (
    <div className="card space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={`rounded-xl border p-4 ${recommendation === 'Old Regime' ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-100 dark:border-slate-800'}`}>
          <p className="text-xs font-semibold uppercase text-slate-400">Old Regime</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">₹{oldRegime.taxPayable.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400">Taxable Income: ₹{oldRegime.taxableIncome.toLocaleString('en-IN')}</p>
        </div>
        <div className={`rounded-xl border p-4 ${recommendation === 'New Regime' ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-100 dark:border-slate-800'}`}>
          <p className="text-xs font-semibold uppercase text-slate-400">New Regime</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">₹{newRegime.taxPayable.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400">Taxable Income: ₹{newRegime.taxableIncome.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
        <p className="text-sm font-semibold">
          Recommended: {recommendation} (Savings: ₹{savings.toLocaleString('en-IN')})
        </p>
      </div>

      {explanation && (
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Explanation</h4>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default TaxCompareResult;
