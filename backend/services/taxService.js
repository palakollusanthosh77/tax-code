/**
 * Deterministic Indian income-tax regime calculator (FY 2024-25 slab rules).
 * Kept rule-based (not AI-generated) so numeric tax calculations are exact and auditable;
 * Gemini is used only to generate the natural-language explanation/recommendation.
 */

const OLD_REGIME_SLABS = [
  { upto: 250000, rate: 0 },
  { upto: 500000, rate: 0.05 },
  { upto: 1000000, rate: 0.2 },
  { upto: Infinity, rate: 0.3 },
];

const NEW_REGIME_SLABS = [
  { upto: 300000, rate: 0 },
  { upto: 600000, rate: 0.05 },
  { upto: 900000, rate: 0.1 },
  { upto: 1200000, rate: 0.15 },
  { upto: 1500000, rate: 0.2 },
  { upto: Infinity, rate: 0.3 },
];

const calculateSlabTax = (taxableIncome, slabs) => {
  let tax = 0;
  let lastLimit = 0;
  for (const slab of slabs) {
    if (taxableIncome > lastLimit) {
      const taxableAtThisSlab = Math.min(taxableIncome, slab.upto) - lastLimit;
      tax += taxableAtThisSlab * slab.rate;
      lastLimit = slab.upto;
    } else {
      break;
    }
  }
  return tax;
};

const applyCess = (tax) => tax * 1.04; // 4% Health & Education Cess

/**
 * @param {object} params { salary, deductions (80C/80D etc total), investments, standardDeduction }
 */
const compareTaxRegimes = ({ salary = 0, deductions = 0, investments = 0 }) => {
  const standardDeduction = 50000;

  // Old regime: salary minus standard deduction, minus deductions (80C capped 150000) and investments
  const cappedDeductions = Math.min(deductions, 150000);
  const oldTaxableIncome = Math.max(0, salary - standardDeduction - cappedDeductions - investments);
  const oldTaxBase = calculateSlabTax(oldTaxableIncome, OLD_REGIME_SLABS);
  const oldRebate = oldTaxableIncome <= 500000 ? oldTaxBase : 0;
  const oldTaxAfterRebate = Math.max(0, oldTaxBase - oldRebate);
  const oldTaxFinal = Math.round(applyCess(oldTaxAfterRebate));

  // New regime: only standard deduction allowed, no 80C/investment deductions
  const newTaxableIncome = Math.max(0, salary - standardDeduction);
  const newTaxBase = calculateSlabTax(newTaxableIncome, NEW_REGIME_SLABS);
  const newRebate = newTaxableIncome <= 700000 ? newTaxBase : 0;
  const newTaxAfterRebate = Math.max(0, newTaxBase - newRebate);
  const newTaxFinal = Math.round(applyCess(newTaxAfterRebate));

  const recommendation = oldTaxFinal <= newTaxFinal ? 'Old Regime' : 'New Regime';
  const savings = Math.abs(oldTaxFinal - newTaxFinal);

  return {
    oldRegime: {
      taxableIncome: oldTaxableIncome,
      taxPayable: oldTaxFinal,
    },
    newRegime: {
      taxableIncome: newTaxableIncome,
      taxPayable: newTaxFinal,
    },
    recommendation,
    savings,
  };
};

module.exports = { compareTaxRegimes };
