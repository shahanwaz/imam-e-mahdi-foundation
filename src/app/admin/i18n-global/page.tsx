'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Languages,
  DollarSign,
  Building2,
  Scale,
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Coins,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sliders,
  FileText,
  AlignLeft,
  AlignRight,
} from 'lucide-react';
import { CountryRegistry, SUPPORTED_COUNTRIES } from '@/lib/global/countries';
import { CurrencyEngine, SUPPORTED_CURRENCIES, BASELINE_INR_RATES } from '@/lib/global/currencies';
import { LanguageRegistry, SUPPORTED_LANGUAGES } from '@/lib/global/languages';
import { GlobalFormatter } from '@/lib/global/formatter';
import { TaxComplianceRegistry, COUNTRY_TAX_SCHEMES } from '@/lib/global/tax-compliance';
import { I18nService } from '@/lib/i18n/i18n-service';

export default function GlobalArchitecturePage() {
  const [activeTab, setActiveTab] = useState<'LOCALIZATION_PLAYGROUND' | 'LANGUAGES' | 'COUNTRIES' | 'OFFICES' | 'FOREX'>('LOCALIZATION_PLAYGROUND');
  
  // Interactive Playground State
  const [testAmount, setTestAmount] = useState<number>(1500000);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('INR');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [targetForexCurrency, setTargetForexCurrency] = useState<string>('USD');
  
  // Offices State
  const [offices, setOffices] = useState<any[]>([]);
  const [loadingOffices, setLoadingOffices] = useState<boolean>(false);
  const [showAddOfficeModal, setShowAddOfficeModal] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Office Form
  const [officeForm, setOfficeForm] = useState({
    officeCode: '',
    officeName: '',
    officeType: 'REGIONAL_CHAPTER',
    countryCode: 'GB',
    city: '',
    addressLine: '',
    contactEmail: '',
    contactPhone: '',
    representativeName: '',
    taxRegistrationNumber: '',
  });

  useEffect(() => {
    fetchOffices();
  }, []);

  async function fetchOffices() {
    setLoadingOffices(true);
    try {
      const res = await fetch('/api/global/offices');
      const json = await res.json();
      if (json.success) {
        setOffices(json.data.offices || []);
      }
    } catch (err) {
      console.error('Failed to load offices:', err);
    } finally {
      setLoadingOffices(false);
    }
  }

  const handleAddOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/global/offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officeForm),
      });
      const json = await res.json();
      if (json.success) {
        setAlertMessage({ text: `Office "${json.data.officeName}" registered successfully!`, type: 'success' });
        setShowAddOfficeModal(false);
        fetchOffices();
      } else {
        setAlertMessage({ text: json.error?.message || 'Failed to create office', type: 'error' });
      }
    } catch (err: any) {
      setAlertMessage({ text: err.message, type: 'error' });
    }
  };

  const activeCountry = CountryRegistry.getCountry(selectedCountryCode);
  const activeTaxScheme = TaxComplianceRegistry.getTaxScheme(selectedCountryCode);
  const isRtl = LanguageRegistry.isRtl(selectedLanguage);

  // Formatted Examples
  const indianNumberExample = GlobalFormatter.formatNumber(testAmount, { numberingSystem: 'INDIAN_LAKH_CRORE' });
  const internationalNumberExample = GlobalFormatter.formatNumber(testAmount, { numberingSystem: 'INTERNATIONAL_MILLION_BILLION' });
  const formattedCurrencyOutput = GlobalFormatter.formatCurrency(testAmount, selectedCurrency, { countryCode: selectedCountryCode });
  const compactOutput = GlobalFormatter.formatCompact(testAmount, selectedCurrency);
  const formattedDateOutput = GlobalFormatter.formatDate(new Date(), { countryCode: selectedCountryCode });

  // Forex Conversion
  const forexResult = CurrencyEngine.convert(testAmount, selectedCurrency, targetForexCurrency);

  const indicLanguages = LanguageRegistry.getIndicLanguages();
  const intlLanguages = LanguageRegistry.getInternationalLanguages();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold transition animate-fade-in ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{alertMessage.text}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="text-xs font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-mono text-[10px] font-extrabold uppercase tracking-widest border border-gold-500/30">
                i18n &bull; Global Architect &bull; Multi-Country DOS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Global Architecture &amp; Localization Suite
            </h1>
            <p className="text-xs text-slate-300">
              Zero Hardcoded Country Assumptions &bull; 13 Indic Languages + Arabic/Persian RTL &bull; Multi-Currency &bull; Country Tax Compliance
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-xs">
            <Globe className="w-5 h-5 text-gold-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-slate-200 block">Active Global Scope:</span>
              <span className="text-slate-400">10+ Jurisdictions &bull; 20+ Languages</span>
            </div>
          </div>
        </div>

        {/* Global Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">13+</div>
            <div>
              <div className="font-bold text-slate-200">Indic Languages</div>
              <div className="text-[10px] text-slate-400">Official &amp; Regional</div>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gold-500/20 text-gold-300 flex items-center justify-center font-bold text-xs">RTL</div>
            <div>
              <div className="font-bold text-slate-200">Arabic, Urdu, Persian</div>
              <div className="text-[10px] text-slate-400">Bidirectional Native Layout</div>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">10</div>
            <div>
              <div className="font-bold text-slate-200">Major Currencies</div>
              <div className="text-[10px] text-slate-400">Real-time Forex Engine</div>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">4+</div>
            <div>
              <div className="font-bold text-slate-200">Global Chapters</div>
              <div className="text-[10px] text-slate-400">HQ &amp; Regional Hubs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('LOCALIZATION_PLAYGROUND')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'LOCALIZATION_PLAYGROUND'
              ? 'bg-emerald-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-gold-400" />
          <span>Interactive Localization Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('LANGUAGES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'LANGUAGES'
              ? 'bg-emerald-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Languages className="w-4 h-4 text-emerald-400" />
          <span>Languages Catalog ({Object.keys(SUPPORTED_LANGUAGES).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COUNTRIES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'COUNTRIES'
              ? 'bg-emerald-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" />
          <span>Countries &amp; Tax Schemes</span>
        </button>

        <button
          onClick={() => setActiveTab('OFFICES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'OFFICES'
              ? 'bg-emerald-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Global Offices &amp; Chapters</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE LOCALIZATION STUDIO */}
      {activeTab === 'LOCALIZATION_PLAYGROUND' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Context Configuration
            </h3>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Country</label>
              <select
                value={selectedCountryCode}
                onChange={(e) => {
                  setSelectedCountryCode(e.target.value);
                  const c = CountryRegistry.getCountry(e.target.value);
                  setSelectedCurrency(c.defaultCurrency);
                  setSelectedLanguage(c.defaultLanguage);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
              >
                {Object.values(SUPPORTED_COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flagEmoji} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Display Currency</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.flagEmoji} {cur.code} - {cur.name} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">UI Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
              >
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName}) {lang.isRtl ? '[RTL]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Test Monetary Value</label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block mb-1">Forex Target Currency</label>
              <select
                value={targetForexCurrency}
                onChange={(e) => setTargetForexCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    Convert to {cur.code} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Live Translation & RTL Rendering Card */}
            <div
              className={`bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 transition ${
                isRtl ? 'text-right' : 'text-left'
              }`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-600">
                    Live UI Translation: {LanguageRegistry.getLanguage(selectedLanguage).name} ({LanguageRegistry.getLanguage(selectedLanguage).nativeName})
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {isRtl ? 'RTL Direction' : 'LTR Direction'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-slate-900 leading-snug">
                  {I18nService.t('common.welcome', selectedLanguage)}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {I18nService.t('donations.title', selectedLanguage)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 block">{I18nService.t('donations.zakat', selectedLanguage)}</span>
                  <strong className="text-slate-900 font-bold">{formattedCurrencyOutput}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 block">{I18nService.t('common.date', selectedLanguage)}</span>
                  <strong className="text-slate-900 font-bold">{formattedDateOutput}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 block">{I18nService.t('common.status', selectedLanguage)}</span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {I18nService.t('dashboard.system_health', selectedLanguage)}
                  </span>
                </div>
              </div>
            </div>

            {/* Numbering Systems & Currency Output Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Indian Lakh/Crore vs International System */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Numbering Systems</span>
                  <Coins className="w-4 h-4 text-gold-600" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Indian System (Lakh / Crore)</span>
                      <span className="font-mono font-bold text-slate-900">{indianNumberExample}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">IN / BD / PK</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">International System (Million / Billion)</span>
                      <span className="font-mono font-bold text-slate-900">{internationalNumberExample}</span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-700 font-bold">US / GB / Global</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Compact Scale Representation</span>
                      <span className="font-bold text-slate-900">{compactOutput}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Auto Scaled</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Forex Conversion */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Forex Treasury Engine</span>
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-slate-50 p-4 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">From Amount:</span>
                    <strong className="font-mono text-slate-900">{GlobalFormatter.formatCurrency(forexResult.originalAmount, forexResult.fromCurrency)}</strong>
                  </div>

                  <div className="flex items-center justify-between text-emerald-900 font-bold text-sm pt-1 border-t border-emerald-200/60">
                    <span>Converted Target:</span>
                    <span className="font-mono font-black">{GlobalFormatter.formatCurrency(forexResult.convertedAmount, forexResult.toCurrency)}</span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 pt-1">
                    Rate: 1 {forexResult.fromCurrency} = {forexResult.exchangeRate} {forexResult.toCurrency}
                  </div>
                </div>
              </div>
            </div>

            {/* Country Tax & Compliance Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Country Compliance &amp; Tax Scheme</span>
                <Scale className="w-4 h-4 text-purple-600" />
              </div>

              {activeTaxScheme ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{activeTaxScheme.schemeLabel}</h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                      {activeTaxScheme.deductionPercentageText}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Tax Identification Required:</span>
                      <strong className="text-slate-800">{activeTaxScheme.taxIdLabel} ({activeTaxScheme.taxIdPlaceholder})</strong>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">{activeTaxScheme.statutoryDisclaimer}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No specific local tax exemption registered for this jurisdiction.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LANGUAGES CATALOG */}
      {activeTab === 'LANGUAGES' && (
        <div className="space-y-6">
          {/* Indic Official & Regional */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Indic Official &amp; Regional Languages ({indicLanguages.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Indian Constitution 8th Schedule and major community outreach languages.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                100% Extensible
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {indicLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded">
                      {lang.code}
                    </span>
                    {lang.isRtl && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                        RTL
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{lang.name}</div>
                  <div className="font-serif text-xs text-slate-600">{lang.nativeName}</div>
                </div>
              ))}
            </div>
          </div>

          {/* International & Global Languages */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-serif font-bold text-slate-900">
                International &amp; Extensible Global Languages ({intlLanguages.length})
              </h3>
              <p className="text-xs text-slate-500">
                Scholarly, Middle East, European, and African regional languages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {intlLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {lang.code}
                    </span>
                    {lang.isRtl && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                        RTL
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{lang.name}</div>
                  <div className="font-serif text-xs text-slate-600">{lang.nativeName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COUNTRIES & TAX SCHEMES */}
      {activeTab === 'COUNTRIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(SUPPORTED_COUNTRIES).map((country) => (
            <div
              key={country.code}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-600 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{country.flagEmoji}</span>
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {country.code}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-slate-900">{country.name}</h4>
                  <p className="text-xs text-slate-500">
                    Calling: <strong>{country.callingCode}</strong> &bull; Currency: <strong>{country.defaultCurrency}</strong>
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Numbering:</span>
                    <strong className="text-slate-800">{country.numberingSystem.replace(/_/g, ' ')}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Date Format:</span>
                    <strong className="font-mono text-slate-800">{country.dateFormat}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Timezone:</span>
                    <strong className="text-slate-800">{country.defaultTimezone}</strong>
                  </div>
                </div>
              </div>

              {country.taxScheme && (
                <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-emerald-900 block text-[11px]">
                    {country.taxScheme.schemeLabel}
                  </span>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {country.taxScheme.statutoryDisclaimer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: GLOBAL OFFICES & CHAPTERS */}
      {activeTab === 'OFFICES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Offices, Chapters &amp; Outposts
            </h3>

            <button
              onClick={() => setShowAddOfficeModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-950 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-900 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Chapter / Office</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offices.map((office) => (
              <div
                key={office.officeCode}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-emerald-600 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded">
                      {office.officeCode}
                    </span>
                    <h4 className="font-serif font-bold text-base text-slate-900 mt-1">
                      {office.officeName}
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {office.officeType?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{office.addressLine}, {office.city}, {office.countryCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Timezone: <strong>{office.defaultTimezone}</strong> &bull; Currency: <strong>{office.defaultCurrency}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lead Representative:</span>
                    <strong className="text-slate-800">{office.representativeName || 'Secretariat Assigned'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Contact:</span>
                    <span className="font-mono text-slate-600 text-[11px]">{office.contactEmail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD OFFICE */}
      {showAddOfficeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">Chapter Management</span>
                <h3 className="text-xl font-serif font-bold text-slate-900">Register Global Office / Chapter</h3>
              </div>
              <button onClick={() => setShowAddOfficeModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddOffice} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Office Code *</label>
                  <input
                    type="text"
                    required
                    value={officeForm.officeCode}
                    onChange={(e) => setOfficeForm({ ...officeForm, officeCode: e.target.value })}
                    placeholder="e.g. IMF-CA-TORONTO"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Office Type *</label>
                  <select
                    value={officeForm.officeType}
                    onChange={(e) => setOfficeForm({ ...officeForm, officeType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="REGIONAL_CHAPTER">Regional Chapter</option>
                    <option value="NATIONAL_OFFICE">National Office</option>
                    <option value="LIAISON_OFFICE">Liaison Office</option>
                    <option value="FIELD_OUTPOST">Field Outpost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Office / Chapter Title *</label>
                <input
                  type="text"
                  required
                  value={officeForm.officeName}
                  onChange={(e) => setOfficeForm({ ...officeForm, officeName: e.target.value })}
                  placeholder="e.g. Canada Chapter &amp; Support Bureau"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Country *</label>
                  <select
                    value={officeForm.countryCode}
                    onChange={(e) => setOfficeForm({ ...officeForm, countryCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    {Object.values(SUPPORTED_COUNTRIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flagEmoji} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={officeForm.city}
                    onChange={(e) => setOfficeForm({ ...officeForm, city: e.target.value })}
                    placeholder="e.g. Toronto"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={officeForm.contactEmail}
                    onChange={(e) => setOfficeForm({ ...officeForm, contactEmail: e.target.value })}
                    placeholder="canada@imf-ngo.org"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lead Representative</label>
                  <input
                    type="text"
                    value={officeForm.representativeName}
                    onChange={(e) => setOfficeForm({ ...officeForm, representativeName: e.target.value })}
                    placeholder="e.g. Br. Salman Rizvi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOfficeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-white font-bold hover:bg-emerald-900 cursor-pointer shadow-sm"
                >
                  Save Office
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
