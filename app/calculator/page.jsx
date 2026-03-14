'use client';
import React, { useState } from 'react';
import Link from 'next/link';

// Federal Child Support Guidelines - simplified monthly table amounts
// Based on 2024 tables (annual income → monthly support per child)
// These are approximations for estimation purposes only
const SUPPORT_TABLE = [
  { min: 0, max: 12000, perChild: [0, 0, 0, 0] },
  { min: 12001, max: 15000, perChild: [7, 10, 11, 10] },
  { min: 15001, max: 20000, perChild: [46, 82, 100, 108] },
  { min: 20001, max: 25000, perChild: [100, 172, 219, 251] },
  { min: 25001, max: 30000, perChild: [161, 275, 349, 398] },
  { min: 30001, max: 35000, perChild: [225, 375, 467, 530] },
  { min: 35001, max: 40000, perChild: [287, 473, 581, 660] },
  { min: 40001, max: 45000, perChild: [345, 558, 686, 778] },
  { min: 45001, max: 50000, perChild: [399, 637, 780, 884] },
  { min: 50001, max: 60000, perChild: [461, 745, 920, 1044] },
  { min: 60001, max: 70000, perChild: [548, 872, 1072, 1216] },
  { min: 70001, max: 80000, perChild: [639, 999, 1222, 1386] },
  { min: 80001, max: 90000, perChild: [722, 1113, 1358, 1540] },
  { min: 90001, max: 100000, perChild: [796, 1216, 1480, 1680] },
  { min: 100001, max: 120000, perChild: [919, 1389, 1687, 1915] },
  { min: 120001, max: 150000, perChild: [1067, 1597, 1937, 2198] },
  { min: 150001, max: 200000, perChild: [1247, 1847, 2237, 2538] },
  { min: 200001, max: 300000, perChild: [1497, 2197, 2657, 3014] },
  { min: 300001, max: 500000, perChild: [1797, 2597, 3137, 3558] },
];

function calculateSupport(income, numChildren) {
  if (!income || !numChildren || numChildren < 1) return 0;
  const childIdx = Math.min(numChildren, 4) - 1;
  const bracket = SUPPORT_TABLE.find(b => income >= b.min && income <= b.max);
  if (!bracket) {
    if (income > 500000) return SUPPORT_TABLE[SUPPORT_TABLE.length - 1].perChild[childIdx];
    return 0;
  }
  return bracket.perChild[childIdx];
}

export default function CalculatorPage() {
  const [income, setIncome] = useState('');
  const [numChildren, setNumChildren] = useState('1');
  const [arrangement, setArrangement] = useState('sole');
  const [otherIncome, setOtherIncome] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const annualIncome = parseInt(income.replace(/[^0-9]/g, '')) || 0;
    const children = parseInt(numChildren) || 1;
    const monthly = calculateSupport(annualIncome, children);

    let adjustedMonthly = monthly;
    let explanation = '';

    if (arrangement === 'shared') {
      const otherAnnual = parseInt((otherIncome || '0').replace(/[^0-9]/g, '')) || 0;
      const otherMonthly = calculateSupport(otherAnnual, children);
      adjustedMonthly = Math.max(0, monthly - otherMonthly);
      explanation = `In shared custody (40-60% time split), both parents' incomes are considered. The difference between the two table amounts is typically the support owed by the higher-income parent.`;
    } else if (arrangement === 'split') {
      explanation = `In split custody, each parent pays the table amount for the children in the other parent's care. The difference is owed by the parent with the higher amount.`;
    } else {
      explanation = `In sole custody, the non-custodial parent pays the table amount based on their income.`;
    }

    setResult({ monthly: adjustedMonthly, annual: adjustedMonthly * 12, income: annualIncome, children, arrangement, explanation });
  };

  const formatCurrency = (num) => '$' + num.toLocaleString('en-CA');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-red-600">←</Link>
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">F</span></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Child Support Calculator</h1>
            <p className="text-xs text-gray-500">Based on Federal Child Support Guidelines</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800"><strong>⚠️ Estimate Only</strong> — This calculator provides rough estimates based on the Federal Child Support Guidelines tables. Actual amounts may differ based on special expenses, undue hardship claims, and provincial variations. Consult a lawyer for accurate calculations.</p>
        </div>

        {/* Calculator Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">Calculate Child Support</h2>

          <div className="space-y-5">
            {/* Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Paying parent's annual income (before tax)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="text" value={income} onChange={e => setIncome(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="65,000" className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:border-red-400 text-lg" />
              </div>
            </div>

            {/* Number of Children */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of children</label>
              <div className="flex gap-2">
                {['1', '2', '3', '4+'].map(n => (
                  <button key={n} onClick={() => setNumChildren(n.replace('+', ''))}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${numChildren === n.replace('+', '') ? 'bg-red-600 text-white' : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-red-300'}`}>
                    {n} {n === '1' ? 'child' : 'children'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custody Arrangement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Custody arrangement</label>
              <div className="space-y-2">
                {[
                  { id: 'sole', label: 'Sole custody', desc: 'Child lives primarily with one parent (60%+ time)' },
                  { id: 'shared', label: 'Shared custody', desc: 'Each parent has 40-60% of time' },
                  { id: 'split', label: 'Split custody', desc: 'Each parent has primary care of at least one child' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setArrangement(opt.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${arrangement === opt.id ? 'bg-red-50 border-2 border-red-600' : 'bg-gray-50 border border-gray-200 hover:border-red-300'}`}>
                    <div className={`font-medium text-sm ${arrangement === opt.id ? 'text-red-700' : 'text-gray-900'}`}>{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Other Parent Income (for shared) */}
            {arrangement === 'shared' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Other parent's annual income</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={otherIncome} onChange={e => setOtherIncome(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="45,000" className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:border-red-400 text-lg" />
                </div>
              </div>
            )}

            <button onClick={calculate} disabled={!income}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition-colors disabled:opacity-40">
              Calculate Estimate
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
            <div className="bg-red-600 p-6 text-white text-center">
              <div className="text-sm opacity-80 mb-1">Estimated Monthly Child Support</div>
              <div className="text-5xl font-bold mb-1">{formatCurrency(result.monthly)}</div>
              <div className="text-sm opacity-80">{formatCurrency(result.annual)} per year</div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Income</div>
                  <div className="font-semibold text-gray-900 text-sm">{formatCurrency(result.income)}/yr</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Children</div>
                  <div className="font-semibold text-gray-900 text-sm">{result.children}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Arrangement</div>
                  <div className="font-semibold text-gray-900 text-sm capitalize">{result.arrangement}</div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-800">{result.explanation}</p>
              </div>
              <p className="text-[11px] text-gray-400 text-center">Based on Federal Child Support Guidelines tables. Actual amounts may vary. This is not legal advice.</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3">How Child Support Works in Canada</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>Child support in Canada is determined by the <strong>Federal Child Support Guidelines</strong>, which use tables based on the paying parent's gross annual income and the number of children.</p>
            <p>The table amounts cover basic expenses like food, shelter, and clothing. <strong>Special expenses</strong> (childcare, medical, extracurriculars, education) are shared proportionally between parents based on income and are added on top.</p>
            <p>In <strong>shared custody</strong> (40-60% time each), the court looks at both incomes and the difference between the two table amounts. In <strong>split custody</strong>, each parent pays the table amount for children in the other's care.</p>
            <p className="text-gray-500">For accurate calculations specific to your situation, consult a family lawyer or use the <a href="https://www.justice.gc.ca/eng/fl-df/child-enfant/cst-orpe.html" target="_blank" rel="noopener" className="text-red-600 underline">Government of Canada's official lookup tool</a>.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
