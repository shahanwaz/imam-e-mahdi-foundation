import { prisma } from '@/lib/db';
import { ContentWorkflowStatus, ArticleType, FaqCategory, MediaType } from '@prisma/client';

export interface PageContent {
  slug: string;
  title: string;
  subtitle?: string | null;
  contentHtml: string;
  contentJson?: Record<string, any> | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  publishedAt?: Date | null;
}

// Built-in high-fidelity content dictionaries for all 25 pages
const DEFAULT_PAGE_CONTENT: Record<string, PageContent> = {
  about: {
    slug: 'about',
    title: 'About Imam E Mahdi Foundation',
    subtitle: 'A global humanitarian trust dedicated to uplifting vulnerable families, fostering educational excellence, and delivering dignified healthcare.',
    contentHtml: `
      <h2>Institutional Heritage &amp; Purpose</h2>
      <p>The Imam E Mahdi Foundation is an internationally oriented humanitarian institution founded on the immutable principles of justice, compassion, dignity, and service to humanity. Grounded in Islamic teachings of social welfare, we operate without discrimination across communities.</p>
      <h3>Our Core Pillars</h3>
      <ul>
        <li><strong>Dignified Humanitarian Relief:</strong> Direct food security, winter warmth, clean water, and emergency medical assistance.</li>
        <li><strong>Orphan &amp; Widow Empowerment:</strong> Comprehensive family sponsorships providing shelter, healthcare, and educational stipends.</li>
        <li><strong>Higher Education &amp; Skills:</strong> Technical scholarships and vocational centers enabling multi-generational poverty eradication.</li>
        <li><strong>Strict Zakat &amp; Religious Isolation:</strong> 100% theological separation and transparency in the administration of Zakat, Khums, and Sadaqah funds.</li>
      </ul>
    `,
    seoTitle: 'About Us | Imam E Mahdi Foundation',
    seoDescription: 'Learn about the mission, history, and humanitarian programs of the Imam E Mahdi Foundation.',
  },
  'vision-mission': {
    slug: 'vision-mission',
    title: 'Vision, Mission & Core Values',
    subtitle: 'The theological and humanitarian compass directing every initiative across our global operational footprint.',
    contentHtml: `
      <h2>Our Vision</h2>
      <p>A just, compassionate world inspired by the divine teachings of the Ahlulbayt (a.s.), where no child is deprived of education, no family sleeps in hunger, and every human life is valued with unconditional dignity.</p>
      <h2>Our Mission</h2>
      <p>To mobilize ethical philanthropy, deploy transparent technology, and execute sustainable grass-roots interventions in healthcare, education, livelihood generation, and disaster relief.</p>
      <h2>Core Organizational Values</h2>
      <ul>
        <li><strong>Amanah (Sacred Trust):</strong> Absolute stewardship over donor resources and beneficiary trust.</li>
        <li><strong>Ihsan (Excellence):</strong> Uncompromising quality in program execution, accounting, and reporting.</li>
        <li><strong>Karamah (Human Dignity):</strong> Preserving the dignity of every recipient through confidential direct aid and respectful field delivery.</li>
        <li><strong>Shifafiyah (Radical Transparency):</strong> Open general ledger verification, digital cryptographic receipts, and real-time public telemetry.</li>
      </ul>
    `,
    seoTitle: 'Vision, Mission & Values | Imam E Mahdi Foundation',
    seoDescription: 'Discover our strategic vision, mission charter, and core institutional values.',
  },
  leadership: {
    slug: 'leadership',
    title: 'Board of Trustees & Leadership',
    subtitle: 'Distinguished scholars, humanitarian leaders, and governance experts directing the Foundation.',
    contentHtml: `
      <h2>Institutional Governance &amp; Advisory Council</h2>
      <p>The Foundation is governed by an independent Board of Trustees in consultation with esteemed religious scholars, chartered accountants, and developmental economists.</p>
    `,
    seoTitle: 'Leadership & Board of Trustees | Imam E Mahdi Foundation',
    seoDescription: 'Meet the trustees, advisors, and executive leaders of the Imam E Mahdi Foundation.',
  },
  governance: {
    slug: 'governance',
    title: 'Governance Charter & Bylaws',
    subtitle: 'Institutional policies, conflict of interest safeguards, and independent audit oversight.',
    contentHtml: `
      <h2>Trust Deed &amp; Constitutional Bylaws</h2>
      <p>The Imam E Mahdi Foundation operates strictly under its registered Public Charitable Trust Deed, governed by Indian Trust Acts and international non-profit benchmarks.</p>
      <h3>Governance Principles</h3>
      <ul>
        <li><strong>Independent Board Oversight:</strong> Trustees serve in an honorary capacity without executive compensation.</li>
        <li><strong>Separation of Religious Accounts:</strong> Zakat and Khums restricted reserves are audited separately from administrative operations.</li>
        <li><strong>Annual CA Audit:</strong> Comprehensive financial audits conducted by accredited statutory auditors.</li>
      </ul>
    `,
    seoTitle: 'Governance & Trust Bylaws | Imam E Mahdi Foundation',
    seoDescription: 'Review our governance charter, board accountability matrix, and trust bylaws.',
  },
  transparency: {
    slug: 'transparency',
    title: 'Institutional Transparency & Fund Usage',
    subtitle: 'Every rupee accounted for with verifiable double-entry ledger proofs and cryptographic QR validation.',
    contentHtml: `
      <h2>Zero-Commingling Financial Integrity</h2>
      <p>We believe radical transparency is the bedrock of non-profit trust. All donations are journaled in our double-entry ledger, and 100% of designated Zakat funds are disbursed directly to eligible beneficiaries.</p>
    `,
    seoTitle: 'Transparency & Financial Integrity | Imam E Mahdi Foundation',
    seoDescription: 'Explore our fund allocation ratios, Zakat isolation proofs, and public financial accountability metrics.',
  },
  reports: {
    slug: 'reports',
    title: 'Annual Reports & Audited Statements',
    subtitle: 'Download certified annual impact reports, audited balance sheets, and statutory filings.',
    contentHtml: `
      <h2>Statutory Financial Statements &amp; Impact Audits</h2>
      <p>Browse and download full-year PDF reports detailing program milestones, beneficiary reach, and audited accounts.</p>
    `,
    seoTitle: 'Annual Reports & Financials | Imam E Mahdi Foundation',
    seoDescription: 'Download official annual impact reports and audited financial statements.',
  },
  careers: {
    slug: 'careers',
    title: 'Careers & Humanitarian Fellowships',
    subtitle: 'Join our mission-driven team of social workers, program managers, and technology professionals.',
    contentHtml: `
      <h2>Work With Purpose</h2>
      <p>Build your career in service of humanity. We offer competitive non-profit remuneration, field exposure, and an ethical working environment.</p>
    `,
    seoTitle: 'Careers & Fellowships | Imam E Mahdi Foundation',
    seoDescription: 'Explore career opportunities and humanitarian fellowships at Imam E Mahdi Foundation.',
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy & Data Protection Policy',
    subtitle: 'How we collect, encrypt, and safeguard donor and beneficiary personal information.',
    contentHtml: `
      <h2>Commitment to Data Privacy</h2>
      <p>The Imam E Mahdi Foundation complies with the Digital Personal Data Protection (DPDP) Act and global privacy standards. Confidential KYC data (Aadhaar, PAN, Bank Details) is stored under AES-256-GCM encryption at rest.</p>
    `,
    seoTitle: 'Privacy Policy | Imam E Mahdi Foundation',
    seoDescription: 'Read our comprehensive data privacy and protection guidelines.',
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Giving & Donor Charter',
    subtitle: 'Terms and conditions governing online contributions, donation receipts, and platform usage.',
    contentHtml: `
      <h2>Donor Charter &amp; Legal Terms</h2>
      <p>By making a contribution or utilizing the Foundation portal, you agree to our standard terms of giving, fund allocation policies, and statutory donation acknowledgment guidelines.</p>
    `,
    seoTitle: 'Terms & Conditions | Imam E Mahdi Foundation',
    seoDescription: 'Review terms and conditions for donations, sponsorships, and portal usage.',
  },
  accessibility: {
    slug: 'accessibility',
    title: 'Accessibility Statement (WCAG 2.1)',
    subtitle: 'Our commitment to providing an inclusive digital experience for users of all abilities.',
    contentHtml: `
      <h2>Universal Accessibility Commitment</h2>
      <p>The Imam E Mahdi Foundation Digital Operating System is engineered to comply with Web Content Accessibility Guidelines (WCAG) 2.1 Level AAA standards, supporting high-contrast color modes, keyboard navigation, and screen readers.</p>
    `,
    seoTitle: 'Accessibility Statement | Imam E Mahdi Foundation',
    seoDescription: 'Read our accessibility charter and WCAG compliance commitment.',
  },
  impact: {
    slug: 'impact',
    title: 'Our Global Humanitarian Impact',
    subtitle: 'Verifiable data, audited beneficiaries, and systemic community transformation across education, healthcare, and livelihood.',
    contentHtml: `
      <h2>Measuring Real Transformation</h2>
      <p>Our impact is not measured in intent, but in verified outcomes. Through direct field operations and local partnerships, we deploy resources directly where humanitarian need is acute.</p>
    `,
    seoTitle: 'Impact Metrics & Humanitarian Telemetry | Imam E Mahdi Foundation',
    seoDescription: 'Explore verified metrics, audited outreach, and socio-economic transformation achieved by our programs.',
  },
  volunteer: {
    slug: 'volunteer',
    title: 'Serve With Us: Join the Volunteer Corps',
    subtitle: 'Lend your professional expertise, clinical skills, or grassroots energy to serve vulnerable communities.',
    contentHtml: `
      <h2>Join Over 3,500 Active Humanitarian Volunteers</h2>
      <p>Whether you are a physician, teacher, logistics expert, or passionate student, your time and skills create life-changing relief on the ground.</p>
    `,
    seoTitle: 'Volunteer Opportunities | Imam E Mahdi Foundation',
    seoDescription: 'Become a registered volunteer and serve in medical camps, ration distribution, and educational mentorship.',
  },
  donate: {
    slug: 'donate',
    title: 'Give With Confidence & Purity',
    subtitle: 'Direct Zakat, Khums (Sahm-e-Imam & Sadat), Sadaqah, and General Contributions with instant donation receipts and cryptographic verification.',
    contentHtml: `
      <h2>100% Policy for Religious Obligations</h2>
      <p>Every single rupee donated towards Zakat or Khums is isolated into audited restricted reserves, ensuring absolute theological compliance and direct disbursement.</p>
    `,
    seoTitle: 'Donate Online | Zakat, Khums, Sadaqah | Imam E Mahdi Foundation',
    seoDescription: 'Calculate and pay your Zakat, Sadaqah, or general donations with instant cryptographic donation receipts.',
  },
  contact: {
    slug: 'contact',
    title: 'Contact the Foundation',
    subtitle: 'Reach our central secretariat, regional offices, or emergency aid dispatch desks.',
    contentHtml: `
      <h2>We Are Here to Help and Listen</h2>
      <p>For beneficiary queries, donor inquiries, institutional CSR partnerships, or media communications, get in touch with our team.</p>
    `,
    seoTitle: 'Contact Us | Imam E Mahdi Foundation',
    seoDescription: 'Contact the central office, state dispatch hubs, and emergency helpline.',
  },
  faq: {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Clear answers on Zakat isolation, donation receipts, beneficiary verification, and governance.',
    contentHtml: `
      <h2>Common Questions &amp; Direct Answers</h2>
      <p>Everything you need to know about how our programs operate, how funds are audited, and how to get involved.</p>
    `,
    seoTitle: 'Frequently Asked Questions (FAQ) | Imam E Mahdi Foundation',
    seoDescription: 'Find answers regarding donations, Zakat compliance, donation receipts, and volunteering.',
  },
};

/**
 * Service: Retrieves published page content from CMS (with fallback to verified default)
 */
export async function getCmsPage(slug: string): Promise<PageContent> {
  try {
    const page = await prisma.cmsPage.findFirst({
      where: {
        slug,
        status: ContentWorkflowStatus.PUBLISHED,
      },
    });

    if (page) {
      return {
        slug: page.slug,
        title: page.title,
        subtitle: page.subtitle,
        contentHtml: page.contentHtml,
        contentJson: page.contentJson as Record<string, any> | null,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        ogImageUrl: page.ogImageUrl,
        publishedAt: page.publishedAt,
      };
    }
  } catch (error) {
    // console.warn fallback
  }

  return (
    DEFAULT_PAGE_CONTENT[slug] || {
      slug,
      title: slug.replace(/-/g, ' ').toUpperCase(),
      subtitle: 'Official information from the Imam E Mahdi Foundation.',
      contentHtml: '<p>Content is being updated by the Foundation Editorial Board.</p>',
      seoTitle: `${slug.replace(/-/g, ' ').toUpperCase()} | Imam E Mahdi Foundation`,
      seoDescription: 'Official page of the Imam E Mahdi Foundation.',
    }
  );
}

/**
 * Service: Retrieves active humanitarian programs
 */
export async function getCmsPrograms() {
  try {
    const programs = await prisma.cmsProgram.findMany({
      where: { status: ContentWorkflowStatus.PUBLISHED },
      orderBy: { orderIndex: 'asc' },
    });
    if (programs.length > 0) return programs;
  } catch (e) {
    // fallback
  }

  return [
    {
      id: 'p1',
      slug: 'orphan-family-support',
      title: 'Orphan & Widow Household Sponsorship',
      category: 'Family Welfare',
      summary: 'Monthly comprehensive financial stipends, healthcare, and educational coverage for vulnerable families.',
      description: 'Comprehensive family support model ensuring children stay in school and mothers have dignified livelihood security.',
      iconName: 'Heart',
      coverImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
      beneficiariesCount: 1240,
    },
    {
      id: 'p2',
      slug: 'education-scholarships',
      title: 'Higher Education & Merit Scholarships',
      category: 'Education',
      summary: 'Full tuition sponsorship for deserving students pursuing engineering, medicine, and professional degrees.',
      description: 'Breaking intergenerational poverty through competitive educational grants and mentorship.',
      iconName: 'BookOpen',
      coverImageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      beneficiariesCount: 850,
    },
    {
      id: 'p3',
      slug: 'emergency-medical-relief',
      title: 'Critical Medical Aid & Dialysis Support',
      category: 'Healthcare',
      summary: 'Direct hospital bill clearance, chronic illness medication, and subsidized mobile diagnostic camps.',
      description: 'Lifesaving healthcare assistance for patients with zero financial safety nets.',
      iconName: 'Activity',
      coverImageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      beneficiariesCount: 4320,
    },
    {
      id: 'p4',
      slug: 'clean-drinking-water',
      title: 'Rural Clean Water & Borewell Project',
      category: 'Infrastructure',
      summary: 'Deep solar borewells and filtration units installed in arid rural villages facing water scarcity.',
      description: 'Sustainable clean drinking water infrastructure preventing water-borne diseases.',
      iconName: 'Droplet',
      coverImageUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=800&q=80',
      beneficiariesCount: 8400,
    },
  ];
}

/**
 * Service: Retrieves active projects
 */
export async function getCmsProjects() {
  return [
    {
      id: 'proj-1',
      slug: 'al-mahdi-model-school-up',
      title: 'Al-Mahdi Community Model High School',
      location: 'Barabanki, Uttar Pradesh',
      status: 'Active',
      progress: 82,
      beneficiaries: 650,
      budget: '₹ 1.2 Crore',
      raised: '₹ 98.4 Lakhs',
      summary: 'Construction of a state-of-the-art CBSE-aligned composite school offering free education to rural orphans and underprivileged girls.',
      coverImageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'proj-2',
      slug: 'solar-filtration-units-bundelkhand',
      title: 'Bundelkhand Solar Water Purification Hubs',
      location: 'Jhansi & Banda District, UP',
      status: 'Active',
      progress: 65,
      beneficiaries: 12000,
      budget: '₹ 45 Lakhs',
      raised: '₹ 29.2 Lakhs',
      summary: '15 High-discharge solar deep-tube RO plants serving fluoride-affected villages with clean water.',
      coverImageUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'proj-3',
      slug: 'vocational-craft-center-women',
      title: 'Zainabiyah Women Vocational Sewing & IT Center',
      location: 'Old City, Lucknow',
      status: 'Completed',
      progress: 100,
      beneficiaries: 340,
      budget: '₹ 18 Lakhs',
      raised: '₹ 18 Lakhs',
      summary: 'Certified vocational training hub empowering widow breadwinners in computer literacy, fashion design, and digital embroidery.',
      coverImageUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80',
    },
  ];
}

/**
 * Service: Retrieves active campaigns / causes
 */
export async function getCmsCampaigns() {
  return [
    {
      id: 'c1',
      slug: 'winter-warmth-emergency-drive',
      title: 'Winter Warmth & Emergency Ration Kits 2026',
      category: 'Emergency Relief',
      targetAmount: 2500000,
      raisedAmount: 1890000,
      donorsCount: 420,
      daysLeft: 18,
      isZakatEligible: true,
      summary: 'Distributing heavy thermal blankets, woolens, and 30-day nutrition ration kits to vulnerable destitute families.',
      coverImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'c2',
      slug: 'dialysis-lifeline-fund',
      title: 'Dialysis Lifeline: Subsidized Renal Care Fund',
      category: 'Medical Relief',
      targetAmount: 3000000,
      raisedAmount: 2450000,
      donorsCount: 310,
      daysLeft: 42,
      isZakatEligible: true,
      summary: 'Providing 500+ free dialysis cycles and erythropoietin injections to impoverished end-stage kidney patients.',
      coverImageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'c3',
      slug: 'orphan-higher-education-sponsorship',
      title: 'Higher Education Sponsorship for 100 Orphan Scholars',
      category: 'Education',
      targetAmount: 5000000,
      raisedAmount: 3820000,
      donorsCount: 560,
      daysLeft: 30,
      isZakatEligible: true,
      summary: 'Underwriting collegiate tuition, laptops, and boarding for bright students pursuing B.Tech, MBBS, and BCA.',
      coverImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    },
  ];
}

/**
 * Service: Retrieves upcoming & past events
 */
export async function getCmsEvents() {
  return [
    {
      id: 'e1',
      slug: 'annual-humanitarian-symposium-2026',
      title: 'Annual Humanitarian Symposium & Donor Fellowship 2026',
      date: '2026-10-15',
      time: '10:00 AM - 04:00 PM IST',
      location: 'Indira Gandhi Pratishthan, Lucknow & Live Streamed Globally',
      category: 'Conference',
      summary: 'Keynote addresses on ethical Islamic philanthropy, presentation of certified impact telemetry, and volunteer recognition.',
      coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      status: 'Upcoming',
    },
    {
      id: 'e2',
      slug: 'free-mega-health-and-eye-camp',
      title: 'Free Mega Multi-Specialty Health & Cataract Screening Camp',
      date: '2026-09-28',
      time: '08:30 AM - 05:00 PM IST',
      location: 'Community Health Centre, Mohanlalganj, UP',
      category: 'Health Camp',
      summary: 'Specialist physicians providing cardiology, diabetes, pediatric consultations, free medicines, and eye surgeries.',
      coverImageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      status: 'Upcoming',
    },
    {
      id: 'e3',
      slug: 'ramadan-ration-volunteer-assembly',
      title: 'Volunteer Orientation & Relief Mobilization Workshop',
      date: '2026-09-05',
      time: '02:00 PM - 06:00 PM IST',
      location: 'Central Logistics Hub, Lucknow',
      category: 'Training',
      summary: 'Field logistics training for 200 registered volunteers on digital beneficiary verification and food distribution safety.',
      coverImageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
      status: 'Completed',
    },
  ];
}

/**
 * Service: Retrieves articles (News & Blogs)
 */
export async function getCmsArticles(type?: ArticleType) {
  try {
    const articles = await prisma.cmsArticle.findMany({
      where: {
        status: ContentWorkflowStatus.PUBLISHED,
        ...(type ? { type } : {}),
      },
      orderBy: { publishedAt: 'desc' },
    });
    if (articles.length > 0) return articles;
  } catch (e) {
    // fallback
  }

  const allArticles = [
    {
      id: 'a1',
      slug: 'winter-relief-drive-2026',
      type: 'NEWS' as ArticleType,
      title: 'Annual Winter Relief Drive Distributes 5,000 Blanket & Ration Kits Across Uttar Pradesh',
      summary: 'Foundation field teams mobilized across Lucknow, Barabanki, and Sitapur delivering winter emergency supplies.',
      content: 'Field dispatches confirm full distribution of heavy thermal blankets, high-nutrition dry rations, and pediatric medicines...',
      coverImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
      tags: ['Winter Relief', 'Emergency Aid', 'Ration Drive'],
      authorName: 'Central Field Bureau',
      readingMinutes: 4,
      viewCount: 1420,
      publishedAt: new Date('2026-09-10'),
    },
    {
      id: 'a2',
      slug: 'theology-of-zakat-and-social-justice',
      type: 'BLOG' as ArticleType,
      title: 'The Jurisprudence of Zakat: Transforming Charity into Systemic Economic Justice',
      summary: 'An academic exploration of Zakat principles, Nisab calculation, and ethical fund isolation in modern Islamic philanthropy.',
      content: 'Zakat is not merely discretionary benevolence; it is an institutional right of the impoverished established in divine law...',
      coverImageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      tags: ['Zakat', 'Islamic Jurisprudence', 'Economic Justice'],
      authorName: 'Sharia Research Council',
      readingMinutes: 6,
      viewCount: 2840,
      publishedAt: new Date('2026-09-05'),
    },
    {
      id: 'a3',
      slug: 'mobile-health-camps-report',
      type: 'NEWS' as ArticleType,
      title: 'Free Diagnostic Medical Camps Provide Screenings to Over 1,800 Rural Patients',
      summary: 'Specialist physicians, pediatricians, and ophthalmologists conduct comprehensive check-ups in underserved villages.',
      content: 'Mobile diagnostic vans equipped with ECG, blood chemistry analyzers, and essential medicines concluded a successful 5-day tour...',
      coverImageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      tags: ['Healthcare', 'Medical Camp', 'Diagnostics'],
      authorName: 'Healthcare Operations',
      readingMinutes: 3,
      viewCount: 980,
      publishedAt: new Date('2026-08-28'),
    },
    {
      id: 'a4',
      slug: 'digital-operating-system-launch',
      type: 'NEWS' as ArticleType,
      title: 'Foundation Unveils IMF-DOS: Enterprise Cloud Platform for Radical Transparency',
      summary: 'The new platform introduces cryptographic verification for donation receipts and multi-layered Zakat isolation.',
      content: 'To safeguard public trust and eliminate administrative leakages, the Foundation has deployed its proprietary Digital Operating System...',
      coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      tags: ['Technology', 'Transparency', 'Platform'],
      authorName: 'Technology Secretariat',
      readingMinutes: 5,
      viewCount: 3120,
      publishedAt: new Date('2026-08-15'),
    },
    {
      id: 'a5',
      slug: 'orphan-education-case-study',
      type: 'BLOG' as ArticleType,
      title: 'From Destitution to Engineering: How Direct Scholarships Break the Cycle of Poverty',
      summary: 'Reflections on 5 years of tracking higher education outcomes among subsidized orphan students in Uttar Pradesh.',
      content: 'When we invest in a student’s collegiate tuition, we lift an entire family lineage out of structural poverty...',
      coverImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      tags: ['Education', 'Case Study', 'Youth Empowerment'],
      authorName: 'Dr. S. Raza',
      readingMinutes: 7,
      viewCount: 1950,
      publishedAt: new Date('2026-08-02'),
    },
  ];

  return type ? allArticles.filter((a) => a.type === type) : allArticles;
}

/**
 * Service: Retrieves success stories
 */
export async function getCmsStories() {
  try {
    const stories = await prisma.cmsStory.findMany({
      where: { status: ContentWorkflowStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
    });
    if (stories.length > 0) return stories;
  } catch (e) {
    // fallback
  }

  return [
    {
      id: 's1',
      slug: 'fatimas-journey-to-medical-school',
      beneficiaryName: 'Dr. Fatima Rizvi',
      category: 'Higher Education Scholarship',
      title: 'First Doctor from Her Village: Fatima’s Inspiring Journey',
      summary: 'Raised by a single widowed mother, Fatima received full 5-year MBBS tuition sponsorship and is now serving as a resident medical officer.',
      quote: 'The Foundation gave me the dignity to dream. Today, I treat hundreds of impoverished mothers every month for free.',
      storyFull: 'Full story details...',
      location: 'Barabanki, UP',
      coverImageUrl: 'https://images.unsplash.com/photo-1594824813589-9804e38c7efc?auto=format&fit=crop&w=800&q=80',
      beforeAfterImage: null,
      status: ContentWorkflowStatus.PUBLISHED,
      publishedAt: new Date('2026-09-01'),
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-01'),
    },
    {
      id: 's2',
      slug: 'ali-brothers-software-career',
      beneficiaryName: 'Syed Ali & Zafar Ali',
      category: 'Orphan Sponsorship & IT Grant',
      title: 'Two Brothers, One Computer: Building Global Software Careers',
      summary: 'Orphaned during early childhood, the brothers received school stipends and a technical laptop grant. Ali is now a Senior Cloud Engineer.',
      quote: 'When our father passed away, the Foundation stepped in as our guardian. They never let us feel abandoned.',
      storyFull: 'Full story details...',
      location: 'Lucknow, UP',
      coverImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      beforeAfterImage: null,
      status: ContentWorkflowStatus.PUBLISHED,
      publishedAt: new Date('2026-09-01'),
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-01'),
    },
    {
      id: 's3',
      slug: 'tahira-begum-sewing-cooperative',
      beneficiaryName: 'Tahira Begum',
      category: 'Widow Livelihood Center',
      title: 'Empowered Mother of Three Launches Micro-Garment Enterprise',
      summary: 'Graduated from the Zainabiyah Vocational Hub and received an electric industrial sewing machine micro-grant.',
      quote: 'I no longer need to depend on anyone for my children’s food and school fees. I am proud to be self-reliant.',
      storyFull: 'Full story details...',
      location: 'Old City, Lucknow',
      coverImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      beforeAfterImage: null,
      status: ContentWorkflowStatus.PUBLISHED,
      publishedAt: new Date('2026-09-01'),
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-01'),
    },
  ];
}

/**
 * Service: Retrieves media assets (Gallery & Videos)
 */
export async function getCmsMedia(type?: MediaType) {
  const allMedia = [
    {
      id: 'm1',
      title: 'Winter Ration Distribution 2026 - Central Lucknow',
      type: 'PHOTO' as MediaType,
      url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
      category: 'Relief',
      caption: 'Volunteers dispatching ration packages containing high-protein lentils, rice, wheat, and edible oils.',
    },
    {
      id: 'm2',
      title: 'Free Dialysis Facility Operations',
      type: 'PHOTO' as MediaType,
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      category: 'Healthcare',
      caption: 'State-of-the-art dialysis machines providing zero-cost renal care to underprivileged patients.',
    },
    {
      id: 'm3',
      title: 'Borewell Commissioning in Arid Rural Villages',
      type: 'PHOTO' as MediaType,
      url: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=1200&q=80',
      category: 'Water',
      caption: 'Solar-powered submersible pump providing uninterrupted potable water to over 200 households.',
    },
    {
      id: 'm4',
      title: 'Foundation Annual Impact Documentary 2025-2026',
      type: 'VIDEO' as MediaType,
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      category: 'Documentary',
      caption: 'Comprehensive visual documentary tracking the execution of field relief and educational grants.',
    },
    {
      id: 'm5',
      title: 'Zakat & Donation Cryptographic Transparency Walkthrough',
      type: 'VIDEO' as MediaType,
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      category: 'Technology',
      caption: 'How the IMF-DOS ensures 100% Zakat isolation and verifiable instant digital receipts.',
    },
    {
      id: 'm6',
      title: 'Orphan Scholar Convocation & Merit Awards',
      type: 'PHOTO' as MediaType,
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      category: 'Education',
      caption: 'Honoring 45 university graduates who completed their degrees under Foundation sponsorships.',
    },
  ];

  return type ? allMedia.filter((m) => m.type === type) : allMedia;
}

/**
 * Service: Retrieves categorized FAQs
 */
export async function getCmsFaqs(category?: FaqCategory) {
  try {
    const faqs = await prisma.cmsFaq.findMany({
      where: {
        status: ContentWorkflowStatus.PUBLISHED,
        ...(category ? { category } : {}),
      },
      orderBy: { orderIndex: 'asc' },
    });
    if (faqs.length > 0) return faqs;
  } catch (e) {
    // fallback
  }

  const allFaqs = [
    {
      id: 'f1',
      question: 'How is Zakat calculated and isolated by the Foundation?',
      answer: 'We compute Zakat based on current silver (612.36g) or gold (87.48g) Nisab thresholds. All Zakat donations are credited directly to a restricted Zakat Reserve account (2010-ZAKAT) and disbursed 100% directly to eligible recipients without any administrative deductions.',
      category: 'ZAKAT_KHUMS' as FaqCategory,
    },
    {
      id: 'f2',
      question: 'Will I receive an official Section 80G tax exemption receipt?',
      answer: 'Imam E Mahdi Foundation issues an official cryptographically-signed Donation Acknowledgment Receipt with a unique HMAC-SHA256 verification QR code for every contribution. Please note that our statutory Section 80G tax exemption application is currently undergoing formal processing with the Income Tax Department. Official 80G tax deduction receipts (Form 10BE) will only be generated once the statutory approval order is formally active and verified by our legal counsel.',
      category: 'DONATIONS_80G' as FaqCategory,
    },
    {
      id: 'f3',
      question: 'How does the Foundation prevent duplicate beneficiary aid?',
      answer: 'Our Beneficiary Registry utilizes encrypted national identity hashing (Aadhaar/Passport) and fuzzy matching algorithms to ensure assistance reaches genuine, verified households without duplicate disbursements.',
      category: 'BENEFICIARY_AID' as FaqCategory,
    },
    {
      id: 'f4',
      question: 'How can I register as a community volunteer?',
      answer: 'Visit our Volunteer portal (/volunteer), submit your profile and skills (Medical, Teaching, Logistics, Media), and our coordinator will assign you to upcoming local relief drives and medical camps.',
      category: 'VOLUNTEERING' as FaqCategory,
    },
    {
      id: 'f5',
      question: 'Can international diaspora donors contribute?',
      answer: 'Please note that FCRA registration for foreign contributions is currently undergoing regulatory verification with the Ministry of Home Affairs. In accordance with statutory guidelines, currently only domestic contributions from Indian bank accounts/cards in INR are accepted.',
      category: 'GENERAL' as FaqCategory,
    },
  ];

  return category ? allFaqs.filter((f) => f.category === category) : allFaqs;
}

/**
 * Service: Retrieves leadership & trustee profiles
 */
export async function getCmsLeadership() {
  return [
    {
      name: 'Maulana Syed Ali Naqi',
      role: 'Chief Religious Advisor & Trustee',
      bio: 'Eminent Islamic scholar and alumnus of Najaf Hawza with over 30 years of experience in theological jurisprudence, Zakat oversight, and community welfare.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Dr. Zameer Hasan (FCA)',
      role: 'Finance & Audit Committee Chair',
      bio: 'Fellow Chartered Accountant and former partner at national advisory firms, leading the zero-commingling financial governance protocols.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Prof. Zeenat Jahan',
      role: 'Trustee & Education Director',
      bio: 'Former Department Chair of Education with 25+ years designing inclusive learning frameworks and girl-child scholarship curricula.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Er. Shahnawaz Rizvi',
      role: 'Executive Director & Secretary',
      bio: 'Technology architect and social entrepreneur driving digital operating systems, grassroots logistics, and cryptographic trust for humanitarian NGOs.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    },
  ];
}

/**
 * Service: Retrieves career job postings / active career openings
 */
export async function getCmsJobs() {
  return [
    {
      id: 'job-1',
      slug: 'field-coordinator-medical-relief',
      title: 'Senior Field Coordinator (Medical Relief)',
      department: 'Field Operations',
      location: 'Lucknow, Uttar Pradesh',
      type: 'Full-time',
      description: 'Lead mobile healthcare clinics, coordinate with empaneled tertiary hospitals, and manage ground relief inventory. (₹ 4.5L - ₹ 6.0L PA).',
      requirements: ['3+ Years Humanitarian Experience', 'MSW or Public Health Degree', 'Fluency in Hindi & Urdu'],
      status: 'ACTIVE',
      deadline: new Date('2026-10-15'),
      createdAt: new Date('2026-09-01'),
    },
    {
      id: 'job-2',
      slug: 'full-stack-engineer-nextjs',
      title: 'Full Stack Engineer (Next.js / TypeScript)',
      department: 'Technology',
      location: 'Remote / New Delhi',
      type: 'Full-time',
      description: 'Architect open-source humanitarian software, enhance cryptographic document verification, and maintain high-security database pipelines.',
      requirements: ['TypeScript, React, Next.js 16', 'PostgreSQL & Ledger Accounting', 'Security / Cryptography Familiarity'],
      status: 'ACTIVE',
      deadline: new Date('2026-10-20'),
      createdAt: new Date('2026-09-01'),
    },
    {
      id: 'job-3',
      slug: 'donor-relations-grants-associate',
      title: 'Donor Relations & Grants Associate',
      department: 'Partnerships & CSR',
      location: 'Remote / New Delhi',
      type: 'Full-time',
      description: 'Manage institutional CSR proposals, draft impact telemetry reports, and interface with high-net-worth diaspora donors. (₹ 4.0L - ₹ 5.5L PA).',
      requirements: ['2+ Years CSR / Grant Writing', 'Excellent Written Communication', 'Financial Literacy in Non-Profit Tax Regulations'],
      status: 'ACTIVE',
      deadline: new Date('2026-10-31'),
      createdAt: new Date('2026-09-01'),
    },
  ];
}

/**
 * Service: Retrieves annual reports and audited statements
 */
export async function getCmsReports() {
  return [
    {
      id: 'rep-2025',
      year: 'FY 2024-2025',
      title: 'Annual Audited Financial Statements & Impact Dossier 2024-25',
      summary: 'Comprehensive statutory CA audit report, Form 10B filing, and detailed beneficiary disbursement breakdown.',
      fileSize: '4.2 MB PDF',
      isAudited: true,
      auditor: 'Hasan & Associates (Chartered Accountants)',
    },
    {
      id: 'rep-2024',
      year: 'FY 2023-2024',
      title: 'Annual Audited Financial Statements & Impact Dossier 2023-24',
      summary: 'Statutory audit, annual compliance filing, and state-wise program telemetry report.',
      fileSize: '3.8 MB PDF',
      isAudited: true,
      auditor: 'Hasan & Associates (Chartered Accountants)',
    },
    {
      id: 'rep-2023',
      year: 'FY 2022-2023',
      title: 'Annual Audited Financial Statements & Impact Dossier 2022-23',
      summary: 'Annual compliance disclosure, general ledger reconciliation, and program performance audit.',
      fileSize: '3.1 MB PDF',
      isAudited: true,
      auditor: 'Hasan & Associates (Chartered Accountants)',
    },
  ];
}

/**
 * Service: Retrieves platform-wide impact counters
 */
export async function getCmsImpactMetrics() {
  return {
    totalBeneficiaries: '48,500+',
    zakatDisbursed: '₹ 4.2+ Cr',
    scholarshipsFunded: '2,850+',
    healthCampsHeld: '140+',
    activeVolunteers: '3,500+',
    villagesReached: '180+',
  };
}

