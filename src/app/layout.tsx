import type { Metadata } from 'next';
import './globals.css';
import { BASE_URL, PUBLIC_BRAND_NAME, PUBLIC_BRAND_TAGLINE, generateOrganizationSchema } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${PUBLIC_BRAND_NAME} — ${PUBLIC_BRAND_TAGLINE}`,
    template: `%s | ${PUBLIC_BRAND_NAME}`,
  },
  description: `${PUBLIC_BRAND_NAME} — ${PUBLIC_BRAND_TAGLINE}. Official humanitarian operating platform of IMAM E MAHDI FOUNDATION (Section 8 Not-for-Profit Company | CIN: U88900DC2026NPL474906).`,
  keywords: [
    'IMAM MISSION',
    'Imam E Mahdi Foundation',
    'Humanitarian Relief',
    'Zakat Donation',
    'Section 8 NGO India',
    'Orphan Sponsorship',
    'Healthcare Aid',
    'Emergency Relief',
  ],
  authors: [{ name: 'IMAM E MAHDI FOUNDATION' }],
  creator: 'IMAM MISSION',
  publisher: 'IMAM E MAHDI FOUNDATION',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    title: `${PUBLIC_BRAND_NAME} — ${PUBLIC_BRAND_TAGLINE}`,
    description: `Official humanitarian operating platform of IMAM E MAHDI FOUNDATION (Section 8 Not-for-Profit Company | CIN: U88900DC2026NPL474906).`,
    siteName: `${PUBLIC_BRAND_NAME}`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: `${PUBLIC_BRAND_NAME} — ${PUBLIC_BRAND_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PUBLIC_BRAND_NAME} — ${PUBLIC_BRAND_TAGLINE}`,
    description: `Official humanitarian operating platform of IMAM E MAHDI FOUNDATION (Section 8 Not-for-Profit Company | CIN: U88900DC2026NPL474906).`,
    images: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&h=630&q=80'],
    creator: '@imammission',
    site: '@imammission',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = generateOrganizationSchema();

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="h-full min-h-screen bg-surface-bg font-sans antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
