import type { Metadata } from 'next';

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imammission.org';
export const PUBLIC_BRAND_NAME = 'IMAM MISSION';
export const PUBLIC_BRAND_TAGLINE = 'Serving Humanity Beyond Boundaries';
export const LEGAL_ENTITY_NAME = 'IMAM E MAHDI FOUNDATION';
export const LEGAL_ENTITY_TYPE = 'Section 8 Not-for-Profit Company';
export const LEGAL_CIN = 'CIN: U88900DC2026NPL474906';
export const OFFICIAL_EMAIL = 'contact@imammission.org';
export const SECRETARIAT_EMAIL = 'secretariat@imammission.org';

const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&h=630&q=80';

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string | null;
  type?: 'website' | 'article';
  publishedTime?: string;
  authors?: string[];
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description,
  path = '',
  ogImage = DEFAULT_OG_IMAGE,
  type = 'website',
  publishedTime,
  authors,
  noIndex = false,
}: SeoProps): Metadata {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return {
    title: `${title} | ${PUBLIC_BRAND_NAME}`,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: `${title} | ${PUBLIC_BRAND_NAME}`,
      description,
      url: fullUrl,
      siteName: `${PUBLIC_BRAND_NAME} — ${PUBLIC_BRAND_TAGLINE}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} - ${PUBLIC_BRAND_NAME}`,
        },
      ],
      type,
      locale: 'en_IN',
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${PUBLIC_BRAND_NAME}`,
      description,
      images: [image],
      creator: '@imammission',
      site: '@imammission',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: PUBLIC_BRAND_NAME,
    alternateName: LEGAL_ENTITY_NAME,
    description: `${PUBLIC_BRAND_NAME} — ${PUBLIC_BRAND_TAGLINE}. A non-profit humanitarian operating initiative by ${LEGAL_ENTITY_NAME} (${LEGAL_ENTITY_TYPE} | ${LEGAL_CIN}).`,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://facebook.com/imammission',
      'https://twitter.com/imammission',
      'https://instagram.com/imammission',
      'https://youtube.com/@imammission',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-522-2610110',
      email: OFFICIAL_EMAIL,
      contactType: 'Helpline & Humanitarian Support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Urdu', 'Arabic'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14/2 Central Relief Complex, Victoria Street',
      addressLocality: 'Lucknow',
      addressRegion: 'Uttar Pradesh',
      postalCode: '226003',
      addressCountry: 'IN',
    },
    legalName: `${LEGAL_ENTITY_NAME} (${LEGAL_ENTITY_TYPE} | ${LEGAL_CIN})`,
  };
}
