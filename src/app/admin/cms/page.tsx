'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Globe, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Edit3, 
  Eye, 
  Share2, 
  ShieldCheck, 
  Users, 
  Mail, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Archive,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, MetricCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<'pages' | 'articles' | 'faqs' | 'inquiries' | 'volunteers' | 'workflow'>('pages');
  const [searchQuery, setSearchQuery] = useState('');

  // 25 CMS Pages Data
  const [pages, setPages] = useState([
    { slug: 'home', title: 'Public Homepage', path: '/', status: 'PUBLISHED', updatedAt: '2026-09-15', author: 'Editorial Board' },
    { slug: 'about', title: 'About Foundation', path: '/about', status: 'PUBLISHED', updatedAt: '2026-09-14', author: 'Dr. Zameer' },
    { slug: 'vision-mission', title: 'Vision, Mission & Values', path: '/vision-mission', status: 'PUBLISHED', updatedAt: '2026-09-14', author: 'Maulana Naqi' },
    { slug: 'leadership', title: 'Board of Trustees', path: '/leadership', status: 'PUBLISHED', updatedAt: '2026-09-12', author: 'Central Secretariat' },
    { slug: 'governance', title: 'Governance & Bylaws', path: '/governance', status: 'PUBLISHED', updatedAt: '2026-09-12', author: 'Legal Counsel' },
    { slug: 'programs', title: 'Humanitarian Programs', path: '/programs', status: 'PUBLISHED', updatedAt: '2026-09-15', author: 'Program Director' },
    { slug: 'projects', title: 'Active Capital Projects', path: '/projects', status: 'PUBLISHED', updatedAt: '2026-09-15', author: 'Civil Eng Wing' },
    { slug: 'causes', title: 'Emergency Relief Campaigns', path: '/causes', status: 'PUBLISHED', updatedAt: '2026-09-15', author: 'Fundraising Desk' },
    { slug: 'events', title: 'Events & Health Camps', path: '/events', status: 'PUBLISHED', updatedAt: '2026-09-13', author: 'Medical Relief' },
    { slug: 'impact', title: 'Impact Telemetry', path: '/impact', status: 'PUBLISHED', updatedAt: '2026-09-15', author: 'Telemetry Desk' },
    { slug: 'stories', title: 'Success Stories', path: '/stories', status: 'PUBLISHED', updatedAt: '2026-09-10', author: 'Field Bureau' },
    { slug: 'news', title: 'News & Press Dispatches', path: '/news', status: 'PUBLISHED', updatedAt: '2026-09-15', author: 'Media Desk' },
    { slug: 'blog', title: 'Articles & Theological Research', path: '/blog', status: 'PUBLISHED', updatedAt: '2026-09-08', author: 'Research Council' },
    { slug: 'gallery', title: 'Photo Gallery', path: '/gallery', status: 'PUBLISHED', updatedAt: '2026-09-11', author: 'Media Desk' },
    { slug: 'videos', title: 'Documentary Videos', path: '/videos', status: 'PUBLISHED', updatedAt: '2026-09-09', author: 'Media Desk' },
    { slug: 'volunteer', title: 'Volunteer Corps Portal', path: '/volunteer', status: 'PUBLISHED', updatedAt: '2026-09-14', author: 'HR & Volunteer Lead' },
    { slug: 'donate', title: 'Donation & Zakat Gateway', path: '/donate', status: 'PUBLISHED', updatedAt: '2026-09-15', author: 'Treasury' },
    { slug: 'contact', title: 'Contact & Secretariats', path: '/contact', status: 'PUBLISHED', updatedAt: '2026-09-14', author: 'Secretariat' },
    { slug: 'transparency', title: 'Radical Transparency & Ledger', path: '/transparency', status: 'PUBLISHED', updatedAt: '2026-09-15', author: 'Audit Committee' },
    { slug: 'reports', title: 'Audited Financial Reports', path: '/reports', status: 'PUBLISHED', updatedAt: '2026-09-13', author: 'Statutory CA' },
    { slug: 'careers', title: 'Careers & Fellowships', path: '/careers', status: 'PUBLISHED', updatedAt: '2026-09-12', author: 'HR Desk' },
    { slug: 'faq', title: 'Frequently Asked Questions', path: '/faq', status: 'PUBLISHED', updatedAt: '2026-09-15', author: 'Public Relations' },
    { slug: 'privacy', title: 'Privacy & Data Policy', path: '/privacy', status: 'PUBLISHED', updatedAt: '2026-09-05', author: 'Data Protection Officer' },
    { slug: 'terms', title: 'Terms of Giving', path: '/terms', status: 'PUBLISHED', updatedAt: '2026-09-05', author: 'Legal Counsel' },
    { slug: 'accessibility', title: 'Accessibility Statement (WCAG)', path: '/accessibility', status: 'PUBLISHED', updatedAt: '2026-09-05', author: 'Engineering Lead' },
  ]);

  // Sample Inquiries
  const [inquiries] = useState([
    {
      id: 'inq-1',
      name: 'Syed Hasan Zaidi',
      email: 'hasan.zaidi@gmail.com',
      type: 'CSR_PARTNERSHIP',
      subject: 'CSR Grant Proposal for Bundelkhand Solar Water Plant',
      createdAt: '2026-09-15 10:45 AM',
      isRead: false,
    },
    {
      id: 'inq-2',
      name: 'Mariam Fatima',
      email: 'm.fatima@yahoo.com',
      type: 'BENEFICIARY_HELP',
      subject: 'Orphan Higher Education Tuition Sponsorship for B.Tech',
      createdAt: '2026-09-14 04:20 PM',
      isRead: true,
    },
    {
      id: 'inq-3',
      name: 'Dr. Tariq Rizvi',
      email: 'tariq.rizvi@apollo.org',
      type: 'GENERAL',
      subject: 'Proposing free monthly cardiology consultation at Mohanlalganj camp',
      createdAt: '2026-09-13 11:15 AM',
      isRead: true,
    },
  ]);

  // Sample Volunteer Registrations
  const [volunteers] = useState([
    {
      id: 'vol-1',
      name: 'Dr. Sarah Rizvi',
      email: 'sarah.md@health.in',
      phone: '+91 9876501234',
      city: 'Lucknow',
      skills: ['Medical & Clinical Consultation', 'Counseling & Social Work'],
      availability: 'Weekends',
      status: 'APPROVED',
      appliedAt: '2026-09-14',
    },
    {
      id: 'vol-2',
      name: 'Syed Ali Kazim',
      email: 'kazim.ali@techcorp.com',
      phone: '+91 9415009988',
      city: 'New Delhi',
      skills: ['IT, Web & Digital Media', 'Disaster Emergency Response'],
      availability: 'Emergency On-Call',
      status: 'PENDING',
      appliedAt: '2026-09-15',
    },
  ]);

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tracking-tight">
              Content Management Engine (CMS)
            </h1>
            <Badge variant="emerald" size="sm">
              25 Public Pages
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Enterprise content workflow, metadata SEO control, volunteer processing, and public inquiry inbox.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm" leftIcon={<Globe className="w-3.5 h-3.5" />}>
              View Live Website
            </Button>
          </Link>
          <Button variant="gold" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
            Create Article
          </Button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Published Public Pages"
          value="25 / 25"
          icon={<Globe className="w-5 h-5 text-emerald-700" />}
          subtitle="All 25 routes active"
          variant="emerald"
        />
        <MetricCard
          title="Field News & Articles"
          value="5 Dispatches"
          icon={<FileText className="w-5 h-5 text-emerald-700" />}
          subtitle="Updated Today"
          variant="emerald"
        />
        <MetricCard
          title="Inbound Inquiries"
          value="3 Messages"
          icon={<Mail className="w-5 h-5 text-gold-600" />}
          subtitle="1 Unread response required"
          variant="gold"
        />
        <MetricCard
          title="Volunteer Corps"
          value="3,500+ Active"
          icon={<Users className="w-5 h-5 text-emerald-700" />}
          subtitle="+12 enrolled this week"
          variant="emerald"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: 'pages', label: 'All 25 Pages', count: pages.length },
          { key: 'inquiries', label: 'Citizen Inquiries', count: inquiries.length },
          { key: 'volunteers', label: 'Volunteer Applicants', count: volunteers.length },
          { key: 'workflow', label: 'Governance Workflow' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? 'border-emerald-900 text-emerald-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: ALL 25 PAGES */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search page by title or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <span className="text-xs text-slate-500 self-end sm:self-auto">
              Showing {filteredPages.length} of 25 pages
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Page Title &amp; Slug</th>
                    <th className="px-4 py-3.5">Public Route</th>
                    <th className="px-4 py-3.5">Workflow Status</th>
                    <th className="px-4 py-3.5">Last Editor</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPages.map((page) => (
                    <tr key={page.slug} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{page.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">slug: {page.slug}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={page.path}
                          target="_blank"
                          className="font-mono text-emerald-800 hover:text-emerald-950 font-medium inline-flex items-center gap-1"
                        >
                          <span>{page.path}</span>
                          <Eye className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            page.status === 'PUBLISHED'
                              ? 'emerald'
                              : page.status === 'APPROVED'
                              ? 'gold'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {page.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">
                        <div>{page.author}</div>
                        <div className="text-[10px] text-slate-400">{page.updatedAt}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link href={page.path} target="_blank">
                            <button
                              title="Preview Page"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => alert(`Opening editor modal for ${page.title}...`)}
                            title="Edit Content"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-emerald-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">
                Inbound Inquiries &amp; Beneficiary Assistance Requests
              </h3>
              <span className="text-xs text-slate-500">{inquiries.length} total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{inq.name}</span>
                      <span className="text-xs text-slate-400">({inq.email})</span>
                      {!inq.isRead && (
                        <Badge variant="gold" size="sm">
                          New Unread
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{inq.createdAt}</span>
                  </div>
                  <div className="font-medium text-xs sm:text-sm text-emerald-950">
                    {inq.subject}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="neutral" size="sm">
                      {inq.type}
                    </Badge>
                    <button
                      onClick={() => alert(`Replying to ${inq.email}...`)}
                      className="text-xs text-emerald-800 font-semibold hover:underline"
                    >
                      Reply to Sender
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VOLUNTEERS */}
      {activeTab === 'volunteers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">
                Registered Volunteer Applicants
              </h3>
              <span className="text-xs text-slate-500">{volunteers.length} pending review</span>
            </div>
            <div className="divide-y divide-slate-100">
              {volunteers.map((vol) => (
                <div key={vol.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-slate-900">{vol.name}</div>
                      <div className="text-xs text-slate-500">
                        {vol.city} &bull; {vol.phone} &bull; {vol.email}
                      </div>
                    </div>
                    <Badge variant={vol.status === 'APPROVED' ? 'emerald' : 'gold'} size="sm">
                      {vol.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {vol.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-3 text-xs">
                    <button
                      onClick={() => alert(`Assigned ${vol.name} to upcoming medical relief camp.`)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-900 text-gold-300 font-semibold hover:bg-emerald-800 transition-colors"
                    >
                      Assign to Relief Drive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WORKFLOW GOVERNANCE */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Lifecycle &amp; Sharia Governance Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To prevent publishing inaccurate theological rulings, unauthorized donor appeals, or unverified bank accounts, all content published on the public portal enforces a mandatory 5-stage lifecycle state machine:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { step: '1. DRAFT', role: 'Staff / Editor', desc: 'Initial creation & content draft.' },
                  { step: '2. REVIEW', role: 'Editorial Board', desc: 'Fact checking & grammar review.' },
                  { step: '3. APPROVED', role: 'Trustee / Legal', desc: 'Compliance & Sharia approval.' },
                  { step: '4. PUBLISHED', role: 'System Engine', desc: 'Live on public website / API.' },
                  { step: '5. ARCHIVED', role: 'Archivist', desc: 'Retired from active indexing.' },
                ].map((st, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-emerald-900 block font-mono">{st.step}</span>
                    <div className="text-[11px] font-semibold text-gold-700">{st.role}</div>
                    <p className="text-[10px] text-slate-500 leading-tight">{st.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
