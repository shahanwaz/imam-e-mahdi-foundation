'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Users, 
  Phone,
  ArrowRight, 
  LogIn 
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const navLinks = [
    {
      title: 'About Us',
      key: 'about',
      items: [
        { label: 'About IMAM MISSION', href: '/about', desc: 'Our heritage, ethos, and humanitarian purpose' },
        { label: 'Vision & Mission', href: '/vision-mission', desc: 'Strategic compass and ethical values' },
        { label: 'Board & Leadership', href: '/leadership', desc: 'Scholars and governance leaders' },
        { label: 'Governance Charter', href: '/governance', desc: 'Section 8 constitutional bylaws' },
      ],
    },
    {
      title: 'Programs & Causes',
      key: 'programs',
      items: [
        { label: 'Humanitarian Programs', href: '/programs', desc: 'Orphan support, education, medical aid' },
        { label: 'Active Projects', href: '/projects', desc: 'Infrastructure, schools, and solar water hubs' },
        { label: 'Emergency Campaigns', href: '/causes', desc: 'Winter warmth and dialysis lifeline' },
        { label: 'Events & Health Camps', href: '/events', desc: 'Free diagnostic camps and symposiums' },
      ],
    },
    {
      title: 'Impact & Trust',
      key: 'impact',
      items: [
        { label: 'Impact Telemetry', href: '/impact', desc: '48,500+ verified beneficiary reach' },
        { label: 'Success Stories', href: '/stories', desc: 'Transformational human journeys' },
        { label: 'Media Gallery', href: '/gallery', desc: 'Field relief photography' },
        { label: 'Documentary Videos', href: '/videos', desc: 'Video dispatches and audit proofs' },
        { label: 'Radical Transparency', href: '/transparency', desc: '100% Zakat isolation and ledger telemetry' },
        { label: 'Audited Reports', href: '/reports', desc: 'Annual statutory financial statements' },
      ],
    },
    {
      title: 'Media & FAQs',
      key: 'media',
      items: [
        { label: 'News & Dispatches', href: '/news', desc: 'Latest field announcements' },
        { label: 'Articles & Blog', href: '/blog', desc: 'Social justice and philanthropy' },
        { label: 'Frequently Asked (FAQ)', href: '/faq', desc: 'Zakat, receipts, and volunteering' },
        { label: 'Careers & Fellowships', href: '/careers', desc: 'Join our humanitarian mission' },
      ],
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-emerald-950/95 backdrop-blur-md shadow-xl border-b border-emerald-800/40 py-2.5'
          : 'bg-emerald-950/90 backdrop-blur-sm border-b border-emerald-800/30 py-3.5'
      }`}
    >
      {/* Statutory & Legal Entity Distinction Mini Banner */}
      <div className="hidden lg:block bg-emerald-900/70 border-b border-emerald-800/40 text-[11px] py-1 px-4 -mt-3.5 mb-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-emerald-200">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gold-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Legal Entity: IMAM E MAHDI FOUNDATION
            </span>
            <span className="text-emerald-500">|</span>
            <span className="text-emerald-300">Section 8 Not-for-Profit Company &bull; CIN: U88900DC2026NPL474906</span>
            <span className="text-emerald-500">|</span>
            <span className="text-emerald-300">100% Direct Zakat Policy</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/volunteer" className="hover:text-gold-300 transition-colors flex items-center gap-1">
              <Users className="w-3 h-3" /> Join Volunteer Corps
            </Link>
            <span className="text-emerald-500">|</span>
            <Link href="/contact" className="hover:text-gold-300 transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" /> +91-522-2610110
            </Link>
            <span className="text-emerald-500">|</span>
            <Link href="/admin/dashboard" className="text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1">
              <LogIn className="w-3 h-3" /> Admin Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Official Organization Logo */}
          <Logo size="md" variant="white" href="/" priority />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((menu) => (
              <div
                key={menu.key}
                className="relative"
                onMouseEnter={() => setActiveDropdown(menu.key)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeDropdown === menu.key
                      ? 'text-gold-300 bg-emerald-900/60'
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-900/40'
                  }`}
                  aria-expanded={activeDropdown === menu.key}
                >
                  {menu.title}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === menu.key ? 'rotate-180 text-gold-400' : 'text-emerald-400'
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === menu.key && (
                  <div className="absolute top-full left-0 w-72 pt-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="bg-emerald-950 border border-emerald-800/80 rounded-xl shadow-2xl p-2.5 backdrop-blur-xl">
                      {menu.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block p-2.5 rounded-lg transition-all group ${
                            pathname === item.href
                              ? 'bg-emerald-900/80 text-gold-300'
                              : 'hover:bg-emerald-900/50 text-emerald-100 hover:text-white'
                          }`}
                        >
                          <div className="font-medium text-sm text-white group-hover:text-gold-300 flex items-center justify-between">
                            {item.label}
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-gold-400" />
                          </div>
                          {item.desc && (
                            <p className="text-xs text-emerald-300/70 mt-0.5 line-clamp-1">{item.desc}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/transparency"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/transparency'
                  ? 'text-gold-300 bg-emerald-900/60'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              Transparency
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/contact'
                  ? 'text-gold-300 bg-emerald-900/60'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action: Donate Button & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <Link
              href="/donate"
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-gold-400 via-amber-500 to-gold-400 bg-[length:200%_auto] hover:bg-[position:right_center] p-[1px] transition-all duration-300 shadow-lg shadow-gold-500/20 active:scale-95"
            >
              <div className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-[11px] bg-gradient-to-r from-amber-500 to-gold-500 text-emerald-950 font-bold text-sm sm:text-base flex items-center gap-2 group-hover:shadow-inner transition-colors">
                <Heart className="w-4 h-4 fill-emerald-950 text-emerald-950 animate-pulse" />
                <span>Donate Now</span>
              </div>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/60 lg:hidden focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gold-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] sm:top-[68px] bottom-0 bg-emerald-950/98 backdrop-blur-xl border-t border-emerald-800/60 z-50 overflow-y-auto px-4 py-6 space-y-6 animate-in slide-in-from-right duration-300">
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-800/80 text-xs text-emerald-200 space-y-1">
              <span className="font-bold text-gold-400 block">IMAM MISSION</span>
              <p className="text-[11px] text-emerald-300">
                Operating under legal entity: <strong>IMAM E MAHDI FOUNDATION</strong> (Section 8 Not-for-Profit Company | CIN: U88900DC2026NPL474906)
              </p>
            </div>

            {navLinks.map((group) => (
              <div key={group.key} className="border-b border-emerald-900/80 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gold-400 block mb-2">
                  {group.title}
                </span>
                <div className="grid grid-cols-1 gap-1 pl-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-2 text-sm text-emerald-100 hover:text-gold-300 flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-2 space-y-2">
              <Link
                href="/volunteer"
                className="block w-full py-2.5 px-4 text-center rounded-xl bg-emerald-900/70 border border-emerald-700/60 text-white font-medium text-sm"
              >
                Join Volunteer Corps
              </Link>
              <Link
                href="/admin/dashboard"
                className="block w-full py-2.5 px-4 text-center rounded-xl bg-emerald-900/30 border border-emerald-800 text-gold-300 font-medium text-sm"
              >
                Admin ERP Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
