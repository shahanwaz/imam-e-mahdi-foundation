'use client';

import React, { useState, useEffect } from 'react';
import { ZakatCalculatorWidget } from '@/components/public/ZakatCalculatorWidget';
import { 
  Heart, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  QrCode, 
  CheckCircle2, 
  Lock, 
  HelpCircle,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Download,
  Share2,
  Check,
  Globe,
  Coins
} from 'lucide-react';
import Link from 'next/link';

interface DonationCategoryItem {
  id: string;
  slug: string;
  name: string;
  fundType: string;
  description: string;
  iconName?: string;
  isZakatEligible: boolean;
  isKhumsEligible: boolean;
  is80GEligible: boolean;
  taxDeductionPercent: number;
  complianceStatus: string;
  complianceApprovedBy?: string;
}

export default function DonatePage() {
  const [categories, setCategories] = useState<DonationCategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<DonationCategoryItem | null>(null);

  const [currency, setCurrency] = useState<string>('INR');
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');

  // Donor Details Form
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorPan, setDonorPan] = useState<string>('');
  const [donorAddress, setDonorAddress] = useState<string>('');
  const [is80GRequested, setIs80GRequested] = useState<boolean>(true);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'BANK_TRANSFER_NEFT'>('UPI');

  // Checkout State Machine
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [activeDonationResponse, setActiveDonationResponse] = useState<any>(null);
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presetAmountsINR = [1000, 2500, 5000, 10000, 25000, 50000];
  const presetAmountsUSD = [25, 50, 100, 250, 500, 1000];

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/donations/categories');
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setCategories(json.data);
          setSelectedCategory(json.data[0]);
        }
      } catch (err) {
        console.error('Failed to load donation categories', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    if (val && !isNaN(Number(val))) {
      setAmount(Number(val));
    }
  };

  const is80GEligibleCategory = Boolean(
    selectedCategory?.is80GEligible && selectedCategory?.complianceStatus === 'APPROVED'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (is80GRequested && is80GEligibleCategory) {
      if (!donorPan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(donorPan.trim())) {
        setErrorMessage('Valid 10-digit PAN (e.g. ABCDE1234F) is required for statutory KYC compliance.');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/donations/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          categorySlug: selectedCategory?.slug || 'general-sadaqah',
          donorName: isAnonymous ? 'Anonymous Donor' : donorName,
          donorEmail,
          donorPhone,
          donorPan: is80GRequested && is80GEligibleCategory ? donorPan : undefined,
          donorAddress,
          isAnonymous,
          is80GRequested: is80GRequested && is80GEligibleCategory,
          paymentMethod,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate donation order.');
      }

      setActiveDonationResponse(data.data);
      setCheckoutModalOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment initiation error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!activeDonationResponse) return;
    setIsProcessing(true);
    try {
      const verifyRes = await fetch('/api/donations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeDonationResponse.provider,
          donationId: activeDonationResponse.donationId,
          gatewayOrderId: activeDonationResponse.gatewayOrderId,
          gatewayPaymentId: `mock_pay_${Date.now()}`,
          gatewaySignature: 'mock_verified_signature',
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed.');
      }

      setCompletedReceipt({
        ...verifyData.data,
        amount,
        currency,
        categoryName: selectedCategory?.name,
        donorName: isAnonymous ? 'Anonymous Donor' : donorName,
        donorEmail,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment verification error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-emerald-800/60">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-semibold backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>100% Policy for Religious Reserves &bull; Transparent Governance</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Give With Sacred Trust &amp; Complete Purity
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed font-sans">
              Every rupee donated towards Zakat or Khums is isolated into audited restricted reserves, ensuring direct disbursement to eligible beneficiaries with zero administrative deductions.
            </p>
          </div>
        </div>

        {/* Statutory Compliance Safe Harbor Notice */}
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-emerald-950">STATUTORY COMPLIANCE &amp; TAX DISCLOSURE:</strong>
            Imam E Mahdi Foundation is incorporated under Section 8 of the Companies Act, 2013 (CIN: U88900DC2026NPL474906). Statutory Section 80G income tax exemption approval is undergoing formal regulatory verification with the Income Tax Department. Standard official donation acknowledgment receipts with cryptographic verification hashes are issued for all contributions.
          </div>
        </div>
      </div>

      {/* Main Donation Portal Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Interactive Giving Flow */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-10 space-y-8">
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="font-semibold block">Validation Notice</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Cause Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-900 text-white text-[11px] flex items-center justify-center font-mono">1</span>
                      Select Fund Allocation Category *
                    </label>
                    {selectedCategory && (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {selectedCategory.fundType}
                      </span>
                    )}
                  </div>

                  {loadingCategories ? (
                    <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
                      Loading verified donation categories...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categories.map((cat) => {
                        const isSelected = selectedCategory?.id === cat.id;
                        const isApproved = cat.complianceStatus === 'APPROVED';

                        return (
                          <div
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat)}
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative space-y-2 ${
                              isSelected
                                ? 'bg-emerald-950 text-white border-emerald-950 shadow-md ring-2 ring-gold-400'
                                : 'bg-slate-50/70 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {cat.name}
                              </h4>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />}
                            </div>

                            <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                              {cat.description}
                            </p>

                            {/* Configurable Compliance Badges (ONLY RENDER IF APPROVED) */}
                            {isApproved && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {cat.isZakatEligible && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isSelected ? 'bg-emerald-800 text-gold-300 border border-gold-400/30' : 'bg-emerald-100 text-emerald-900'
                                  }`}>
                                    100% Zakat Direct
                                  </span>
                                )}
                                {cat.isKhumsEligible && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isSelected ? 'bg-amber-900/60 text-amber-200 border border-amber-500/30' : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    Restricted Reserve
                                  </span>
                                )}
                                {cat.is80GEligible && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isSelected ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' : 'bg-slate-200/80 text-slate-800'
                                  }`}>
                                    Direct Relief
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step 2: Currency & Amount Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-900 text-white text-[11px] flex items-center justify-center font-mono">2</span>
                      Choose Contribution Amount *
                    </label>

                    {/* Currency Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      {['INR', 'USD', 'EUR', 'GBP', 'AED'].map((cur) => (
                        <button
                          type="button"
                          key={cur}
                          onClick={() => {
                            setCurrency(cur);
                            setAmount(cur === 'INR' ? 5000 : 100);
                            setCustomAmount('');
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            currency === cur
                              ? 'bg-emerald-950 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {cur}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(currency === 'INR' ? presetAmountsINR : presetAmountsUSD).map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => handlePresetSelect(val)}
                        className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border ${
                          amount === val && !customAmount
                            ? 'bg-gold-500 text-emerald-950 border-gold-500 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {currency === 'INR' ? `₹ ${val.toLocaleString('en-IN')}` : `${currency} ${val}`}
                      </button>
                    ))}
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder={`Or enter custom amount in ${currency}...`}
                      value={customAmount}
                      onChange={handleCustomChange}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50/70 focus:bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-800 transition-all"
                    />
                  </div>
                </div>

                {/* Step 3: Donor Details & Compliance Information */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-900 text-white text-[11px] flex items-center justify-center font-mono">3</span>
                      Donor Details &amp; Compliance Information
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded text-emerald-800 focus:ring-emerald-800"
                      />
                      <span>Make donation anonymous</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-600 font-medium">Full Legal Name *</span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Syed Ali Raza"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-600 font-medium">Email Address (For Instant Receipt) *</span>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ali@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-600 font-medium">Phone / WhatsApp</span>
                      <input
                        type="tel"
                        placeholder="e.g. +91 9876543210"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">PAN Card (For Donor KYC &amp; Records)</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Optional
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. ABCDE1234F"
                        value={donorPan}
                        onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white text-sm uppercase font-mono"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        Recorded for regulatory donor registry and future Form 10BD filings once 80G is certified.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 4: Payment Channel Selection */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-900 text-white text-[11px] flex items-center justify-center font-mono">4</span>
                    Payment Mode
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'UPI', label: 'UPI / QR / GPay', desc: 'Zero Fees' },
                      { id: 'CARD', label: 'Credit / Debit Card', desc: 'Visa, Master, RuPay' },
                      { id: 'NETBANKING', label: 'Net Banking', desc: '50+ Indian Banks' },
                      { id: 'BANK_TRANSFER_NEFT', label: 'Bank NEFT / RTGS', desc: 'Direct Transfer' },
                    ].map((mode) => (
                      <button
                        type="button"
                        key={mode.id}
                        onClick={() => setPaymentMethod(mode.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          paymentMethod === mode.id
                            ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold">{mode.label}</div>
                        <div className={`text-[10px] ${paymentMethod === mode.id ? 'text-emerald-200' : 'text-slate-500'}`}>
                          {mode.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit / Initiate Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-emerald-950 font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5 fill-emerald-950" />
                  )}
                  <span>
                    Proceed to Donate {currency === 'INR' ? `₹ ${amount.toLocaleString('en-IN')}` : `${currency} ${amount}`}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: Direct Bank Transfer Details & Trust Seals */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Bank Account Card */}
            <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-gold-400" />
                <div>
                  <h4 className="font-serif font-bold text-lg text-white">Direct NEFT / RTGS Bank Transfer</h4>
                  <p className="text-xs text-emerald-300">Statutory Indian Public Charitable Trust Account</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-emerald-200 bg-emerald-900/60 p-4 rounded-2xl border border-emerald-800 font-mono">
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-sans">Account Name:</span>
                  <span className="font-bold text-white text-right">IMAM E MAHDI FOUNDATION</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-sans">Bank Name:</span>
                  <span className="font-bold text-white">HDFC Bank Ltd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-sans">Account Number:</span>
                  <span className="font-bold text-gold-300 text-sm">50200088991122</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-sans">IFSC Code:</span>
                  <span className="font-bold text-white">HDFC0000123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-sans">Branch:</span>
                  <span className="text-white">Hazratganj, Lucknow</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-emerald-300">
                <p className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>After bank transfer, WhatsApp receipt to <strong>+91-522-2610110</strong> for instant 80G certificate.</span>
                </p>
              </div>
            </div>

            {/* Trust & Governance Guarantees */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Giving Guarantees</span>
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>100% Zakat Policy:</strong> Religious reserves are isolated and distributed without overhead deductions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Section 8 Registered Non-Profit:</strong> CIN: U88900DC2026NPL474906 (Incorporated under Companies Act, 2013).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Cryptographic Tamper-Proof Receipts:</strong> HMAC-SHA256 signed QR codes for instant online audit verification.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>AES-256 PII Protection:</strong> All PAN and sensitive personal identification data are securely encrypted at rest.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Zakat Calculator */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <ZakatCalculatorWidget />
      </div>

      {/* Live Payment Checkout & E-Receipt Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {completedReceipt ? (
              /* Success Receipt View */
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Payment Verified &amp; Captured
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-emerald-950 pt-2">
                    Official Donation Receipt
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    Receipt #{completedReceipt.receiptNumber}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-slate-200 text-left text-xs space-y-2.5 font-sans">
                  <div className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Donor Name:</span>
                    <span className="font-bold text-slate-900">{completedReceipt.donorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Amount Contributed:</span>
                    <span className="font-bold text-emerald-900">
                      {completedReceipt.currency === 'INR' ? `₹ ${completedReceipt.amount.toLocaleString('en-IN')}` : `${completedReceipt.currency} ${completedReceipt.amount}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Allocated Reserve:</span>
                    <span className="font-bold text-slate-900">{completedReceipt.categoryName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Tax Exemption Status:</span>
                    <span className="font-bold text-emerald-800">
                      {completedReceipt.is80GIssued ? '80G Verified (Form 10BE)' : 'Standard Donation Acknowledgment (80G Pending Verification)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ledger Voucher:</span>
                    <span className="font-mono text-slate-700">{completedReceipt.voucherNumber || 'GL-POSTED'}</span>
                  </div>
                </div>

                {/* Cryptographic QR Verification Link */}
                <div className="p-4 rounded-2xl bg-emerald-950 text-white flex items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gold-400 font-bold">
                      <QrCode className="w-4 h-4" />
                      <span>Tamper-Proof Audit QR</span>
                    </div>
                    <p className="text-[11px] text-emerald-200">
                      Cryptographically signed with SHA-256 verification hash.
                    </p>
                  </div>
                  <Link
                    href={`/verify/receipt/${completedReceipt.qrVerificationHash}`}
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl bg-gold-500 text-emerald-950 font-bold text-xs shrink-0 flex items-center gap-1 hover:bg-gold-400"
                  >
                    <span>Verify QR</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/verify/receipt/${completedReceipt.qrVerificationHash}`}
                    target="_blank"
                    className="w-full py-3 rounded-xl bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-800"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF Receipt</span>
                  </Link>
                  <button
                    onClick={() => {
                      setCheckoutModalOpen(false);
                      setCompletedReceipt(null);
                    }}
                    className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Active Gateway Checkout Interaction View */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-800" />
                    <h3 className="font-serif font-bold text-lg text-emerald-950">
                      Secure Payment Gateway
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {activeDonationResponse?.provider}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-emerald-900">Receipt Ref:</span>
                    <span className="font-mono font-bold text-emerald-950">{activeDonationResponse?.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900">Amount Payable:</span>
                    <span className="font-bold text-emerald-950">
                      {activeDonationResponse?.currency === 'INR' ? `₹ ${activeDonationResponse?.amount.toLocaleString('en-IN')}` : `${activeDonationResponse?.currency} ${activeDonationResponse?.amount}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900">Allocated Fund:</span>
                    <span className="font-bold text-emerald-950">{activeDonationResponse?.categoryName}</span>
                  </div>
                </div>

                {/* Simulated Gateway Interaction (Supports instant testing & standard webhooks) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                  <p className="text-xs text-slate-600">
                    Payment provider session active for Order: <br />
                    <code className="text-[11px] text-emerald-900 font-bold">{activeDonationResponse?.gatewayOrderId}</code>
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={handleSimulatePaymentSuccess}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 text-emerald-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:from-gold-300 hover:to-amber-400"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Authorize Payment (Simulate Gateway Success)</span>
                    </button>

                    <button
                      onClick={() => setCheckoutModalOpen(false)}
                      className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel Transaction
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
