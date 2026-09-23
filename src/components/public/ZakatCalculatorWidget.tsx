'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Coins, 
  Sparkles,
  RefreshCw,
  Heart
} from 'lucide-react';

export function ZakatCalculatorWidget() {
  const [activeTab, setActiveTab] = useState<'mal' | 'fitr' | 'khums'>('mal');

  // Zakat al-Mal state
  const [cash, setCash] = useState<number | ''>('');
  const [goldGrams, setGoldGrams] = useState<number | ''>('');
  const [goldRate] = useState<number>(7000); // INR per gram
  const [silverGrams, setSilverGrams] = useState<number | ''>('');
  const [silverRate] = useState<number>(90); // INR per gram
  const [investments, setInvestments] = useState<number | ''>('');
  const [businessAssets, setBusinessAssets] = useState<number | ''>('');
  const [liabilities, setLiabilities] = useState<number | ''>('');

  // Fitrah state
  const [familyMembers, setFamilyMembers] = useState<number>(4);
  const [stapleRate, setStapleRate] = useState<number>(150); // INR per person (wheat/rice benchmark)

  // Khums state
  const [surplusSavings, setSurplusSavings] = useState<number | ''>('');

  // Calculations for Zakat al-Mal
  const silverNisabThreshold = 612.36 * silverRate; // ~ ₹55,112

  const goldValue = (Number(goldGrams) || 0) * goldRate;
  const silverValue = (Number(silverGrams) || 0) * silverRate;
  const totalGrossWealth =
    (Number(cash) || 0) +
    goldValue +
    silverValue +
    (Number(investments) || 0) +
    (Number(businessAssets) || 0);

  const netZakatableWealth = Math.max(0, totalGrossWealth - (Number(liabilities) || 0));
  const isNisabEligible = netZakatableWealth >= silverNisabThreshold;
  const payableZakat = isNisabEligible ? Math.round(netZakatableWealth * 0.025) : 0;

  // Fitrah calculation
  const payableFitrah = familyMembers * stapleRate;

  // Khums calculation (20% of net annual surplus: 10% Sahm-e-Imam, 10% Sahm-e-Sadat)
  const payableKhums = Math.round((Number(surplusSavings) || 0) * 0.2);

  const handleReset = () => {
    setCash('');
    setGoldGrams('');
    setSilverGrams('');
    setInvestments('');
    setBusinessAssets('');
    setLiabilities('');
    setSurplusSavings('');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E7E2] shadow-xl overflow-hidden">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-[#063B2E] via-[#0B5D46] to-[#063B2E] p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gold-500/20 text-gold-300 border border-gold-400/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Interactive Zakat &amp; Religious Dues Calculator
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                Calculate with exact Sharia Nisab benchmarks &bull; 100% theological fund isolation
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="self-start sm:self-auto text-xs text-emerald-200 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#063B2E]/60 border border-emerald-600/40 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Fields</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mt-6 p-1 bg-[#032119]/80 rounded-xl border border-[#063B2E]/80 w-full sm:w-max">
          <button
            onClick={() => setActiveTab('mal')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'mal'
                ? 'bg-gold-500 text-[#063B2E] shadow-md'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Zakat al-Mal (Wealth)
          </button>
          <button
            onClick={() => setActiveTab('fitr')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'fitr'
                ? 'bg-gold-500 text-[#063B2E] shadow-md'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Zakat al-Fitr (Fitrah)
          </button>
          <button
            onClick={() => setActiveTab('khums')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'khums'
                ? 'bg-gold-500 text-[#063B2E] shadow-md'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Khums (Annual Surplus)
          </button>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="p-6 sm:p-8 bg-white">
        {activeTab === 'mal' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cash */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#17201C] flex items-center justify-between">
                  <span>Cash &amp; Bank Balances</span>
                  <span className="text-[11px] text-[#64706A] font-normal">INR (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 150000"
                  value={cash}
                  onChange={(e) => setCash(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7E2] bg-[#FCFBF7] focus:bg-white focus:outline-none focus:border-[#063B2E] text-sm font-medium text-[#17201C] transition-colors"
                />
              </div>

              {/* Gold */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#17201C] flex items-center justify-between">
                  <span>Gold Weight</span>
                  <span className="text-[11px] text-[#64706A] font-normal">Grams (~₹{goldRate}/g)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  value={goldGrams}
                  onChange={(e) => setGoldGrams(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7E2] bg-[#FCFBF7] focus:bg-white focus:outline-none focus:border-[#063B2E] text-sm font-medium text-[#17201C] transition-colors"
                />
              </div>

              {/* Silver */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#17201C] flex items-center justify-between">
                  <span>Silver Weight</span>
                  <span className="text-[11px] text-[#64706A] font-normal">Grams (~₹{silverRate}/g)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={silverGrams}
                  onChange={(e) => setSilverGrams(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7E2] bg-[#FCFBF7] focus:bg-white focus:outline-none focus:border-[#063B2E] text-sm font-medium text-[#17201C] transition-colors"
                />
              </div>

              {/* Investments */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#17201C] flex items-center justify-between">
                  <span>Investments &amp; Stocks</span>
                  <span className="text-[11px] text-[#64706A] font-normal">INR (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 75000"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7E2] bg-[#FCFBF7] focus:bg-white focus:outline-none focus:border-[#063B2E] text-sm font-medium text-[#17201C] transition-colors"
                />
              </div>

              {/* Business Merchandise */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#17201C] flex items-center justify-between">
                  <span>Trade Inventory / Business Goods</span>
                  <span className="text-[11px] text-[#64706A] font-normal">INR (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 200000"
                  value={businessAssets}
                  onChange={(e) => setBusinessAssets(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7E2] bg-[#FCFBF7] focus:bg-white focus:outline-none focus:border-[#063B2E] text-sm font-medium text-[#17201C] transition-colors"
                />
              </div>

              {/* Deductible Liabilities */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-rose-700 flex items-center justify-between">
                  <span>Less: Immediate Debts &amp; Due Bills</span>
                  <span className="text-[11px] text-rose-500 font-normal">Deductible INR (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 30000"
                  value={liabilities}
                  onChange={(e) => setLiabilities(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/40 focus:bg-white focus:outline-none focus:border-rose-600 text-sm font-medium text-[#17201C] transition-colors"
                />
              </div>
            </div>

            {/* Benchmark Note */}
            <div className="p-4 rounded-xl bg-[#EEF5F1] border border-[#E5E7E2] text-xs text-[#17201C] flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#063B2E] shrink-0 mt-0.5" />
              <div>
                <strong>Nisab Benchmark:</strong> Based on the standard silver Nisab (612.36g = approx ₹{silverNisabThreshold.toLocaleString('en-IN')}). If your total net zakatable wealth held for one lunar year equals or exceeds this threshold, 2.5% is payable.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fitr' && (
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#17201C]">
                Number of Family Members / Dependents
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFamilyMembers(num)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      familyMembers === num
                        ? 'bg-[#063B2E] text-white shadow-md'
                        : 'bg-[#FCFBF7] border border-[#E5E7E2] text-[#17201C] hover:bg-[#EEF5F1]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#17201C]">
                Staple Food Benchmark Rate per Person (3kg Wheat / Rice)
              </label>
              <select
                value={stapleRate}
                onChange={(e) => setStapleRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7E2] bg-[#FCFBF7] focus:bg-white text-sm font-medium text-[#17201C]"
              >
                <option value={120}>Wheat Standard (₹ 120 / person)</option>
                <option value={150}>Rice Standard (₹ 150 / person)</option>
                <option value={300}>Premium Rice / Dates (₹ 300 / person)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'khums' && (
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
              <strong>Khums Guidance:</strong> Khums is calculated at 20% on unspent net annual savings and profits remaining at the close of your Khums financial year. Half (10%) is allocated to <strong>Sahm-e-Imam</strong> and half (10%) to <strong>Sahm-e-Sadat</strong>.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#17201C] flex items-center justify-between">
                <span>Net Annual Surplus Savings</span>
                <span className="text-[11px] text-[#64706A] font-normal">INR (₹)</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500000"
                value={surplusSavings}
                onChange={(e) => setSurplusSavings(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7E2] bg-[#FCFBF7] focus:bg-white focus:outline-none focus:border-[#063B2E] text-base font-semibold text-[#17201C]"
              />
            </div>
          </div>
        )}

        {/* Calculation Result Summary Bar */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-[#063B2E] via-[#0B5D46] to-[#063B2E] text-white border border-[#0B5D46]/80 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-300 block">
                {activeTab === 'mal' && 'Net Zakat al-Mal Due (2.5%)'}
                {activeTab === 'fitr' && `Fitrah Due for ${familyMembers} Persons`}
                {activeTab === 'khums' && 'Total Khums Due (20%)'}
              </span>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-white">
                ₹{' '}
                {activeTab === 'mal' && payableZakat.toLocaleString('en-IN')}
                {activeTab === 'fitr' && payableFitrah.toLocaleString('en-IN')}
                {activeTab === 'khums' && payableKhums.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-emerald-100/90">
                {activeTab === 'mal' &&
                  (isNisabEligible
                    ? `Wealth of ₹ ${netZakatableWealth.toLocaleString('en-IN')} exceeds Nisab threshold.`
                    : `Wealth is below Nisab threshold of ₹ ${silverNisabThreshold.toLocaleString('en-IN')}.`)}
                {activeTab === 'fitr' && `Calculated at ₹ ${stapleRate} per person.`}
                {activeTab === 'khums' &&
                  `Includes ₹ ${(payableKhums / 2).toLocaleString('en-IN')} Sahm-e-Imam and ₹ ${(payableKhums / 2).toLocaleString('en-IN')} Sahm-e-Sadat.`}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                href={`/donate?amount=${
                  activeTab === 'mal' ? payableZakat : activeTab === 'fitr' ? payableFitrah : payableKhums
                }&cause=${activeTab === 'khums' ? 'KHUMS' : 'ZAKAT'}`}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-400 via-amber-500 to-gold-400 hover:from-gold-300 hover:to-amber-400 text-[#063B2E] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Heart className="w-4 h-4 fill-[#063B2E]" />
                <span>Pay &amp; Generate Official Receipt</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
