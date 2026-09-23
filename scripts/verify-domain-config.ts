/**
 * STEP 25 — Official Domain & Brand Configuration Verification Suite
 * Target Domain: https://imammission.org
 * Public Brand: IMAM MISSION
 * Legal Entity: IMAM E MAHDI FOUNDATION (Section 8 Not-for-Profit Company | CIN: U88900DC2026NPL474906)
 */

import { 
  BASE_URL, 
  PUBLIC_BRAND_NAME, 
  PUBLIC_BRAND_TAGLINE, 
  LEGAL_ENTITY_NAME, 
  LEGAL_ENTITY_TYPE, 
  LEGAL_CIN, 
  OFFICIAL_EMAIL, 
  SECRETARIAT_EMAIL,
  constructMetadata,
  generateOrganizationSchema
} from '../src/lib/seo/metadata';
import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';

export interface DomainCheckItem {
  dimension: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

export async function runDomainAndBrandVerification(): Promise<{
  allPassed: boolean;
  checks: DomainCheckItem[];
}> {
  console.log('========================================================================================');
  console.log('            IMAM MISSION — OFFICIAL DOMAIN & BRAND CONFIGURATION AUDIT                  ');
  console.log('========================================================================================');
  console.log(`  Canonical Domain:   ${BASE_URL}`);
  console.log(`  Public Brand:       ${PUBLIC_BRAND_NAME}`);
  console.log(`  Brand Tagline:      ${PUBLIC_BRAND_TAGLINE}`);
  console.log(`  Legal Entity:       ${LEGAL_ENTITY_NAME} (${LEGAL_ENTITY_TYPE})`);
  console.log(`  Corporate CIN:      ${LEGAL_CIN}`);
  console.log('----------------------------------------------------------------------------------------\n');

  const checks: DomainCheckItem[] = [];

  // 1. Canonical Domain
  checks.push({
    dimension: 'Canonical Domain URL',
    expected: 'https://imammission.org',
    actual: BASE_URL,
    passed: BASE_URL === 'https://imammission.org',
  });

  // 2. Public Brand Name
  checks.push({
    dimension: 'Public-Facing Brand Name',
    expected: 'IMAM MISSION',
    actual: PUBLIC_BRAND_NAME,
    passed: PUBLIC_BRAND_NAME === 'IMAM MISSION',
  });

  // 3. Brand Tagline
  checks.push({
    dimension: 'Public Brand Tagline',
    expected: 'Serving Humanity Beyond Boundaries',
    actual: PUBLIC_BRAND_TAGLINE,
    passed: PUBLIC_BRAND_TAGLINE === 'Serving Humanity Beyond Boundaries',
  });

  // 4. Legal Entity Name
  checks.push({
    dimension: 'Legal Entity Designation',
    expected: 'IMAM E MAHDI FOUNDATION',
    actual: LEGAL_ENTITY_NAME,
    passed: LEGAL_ENTITY_NAME === 'IMAM E MAHDI FOUNDATION',
  });

  // 5. Legal Entity Structure
  checks.push({
    dimension: 'Legal Entity Type',
    expected: 'Section 8 Not-for-Profit Company',
    actual: LEGAL_ENTITY_TYPE,
    passed: LEGAL_ENTITY_TYPE === 'Section 8 Not-for-Profit Company',
  });

  // 6. Corporate Identification Number (CIN)
  checks.push({
    dimension: 'Statutory Corporate CIN',
    expected: 'CIN: U88900DC2026NPL474906',
    actual: LEGAL_CIN,
    passed: LEGAL_CIN === 'CIN: U88900DC2026NPL474906',
  });

  // 7. Official Email Domain
  checks.push({
    dimension: 'Official Support Email',
    expected: 'contact@imammission.org',
    actual: OFFICIAL_EMAIL,
    passed: OFFICIAL_EMAIL.endsWith('@imammission.org'),
  });

  // 8. Secretariat Email Domain
  checks.push({
    dimension: 'Secretariat Correspondence Email',
    expected: 'secretariat@imammission.org',
    actual: SECRETARIAT_EMAIL,
    passed: SECRETARIAT_EMAIL.endsWith('@imammission.org'),
  });

  // 9. SEO Metadata Construction
  const testMeta = constructMetadata({
    title: 'Emergency Medical Relief',
    description: 'Lifesaving medical operations.',
    path: '/causes/medical',
  });
  const metaTitleValid = testMeta.title === 'Emergency Medical Relief | IMAM MISSION';
  const canonicalUrlValid = (testMeta.alternates?.canonical as string) === 'https://imammission.org/causes/medical';
  checks.push({
    dimension: 'SEO Meta Title & Canonical Generation',
    expected: 'Emergency Medical Relief | IMAM MISSION (https://imammission.org/causes/medical)',
    actual: `${testMeta.title} (${testMeta.alternates?.canonical})`,
    passed: metaTitleValid && canonicalUrlValid,
  });

  // 10. Organization JSON-LD Schema
  const schema = generateOrganizationSchema();
  const schemaValid = 
    schema.name === 'IMAM MISSION' && 
    schema.alternateName === 'IMAM E MAHDI FOUNDATION' &&
    schema.legalName.includes('CIN: U88900DC2026NPL474906');
  checks.push({
    dimension: 'Schema.org JSON-LD Legal & Brand Separation',
    expected: 'Brand: IMAM MISSION, Legal: IMAM E MAHDI FOUNDATION (CIN: U88900DC2026NPL474906)',
    actual: `Brand: ${schema.name}, Legal: ${schema.legalName}`,
    passed: schemaValid,
  });

  // 11. Robots.txt Host & Sitemap
  const robotsConfig = robots();
  const robotsValid = 
    robotsConfig.sitemap === 'https://imammission.org/sitemap.xml' &&
    robotsConfig.host === 'https://imammission.org';
  checks.push({
    dimension: 'Robots.txt Sitemap & Host Configuration',
    expected: 'https://imammission.org/sitemap.xml',
    actual: String(robotsConfig.sitemap),
    passed: robotsValid,
  });

  // 12. Dynamic Sitemap XML Routes
  const sitemapRoutes = await sitemap();
  const sitemapRoot = sitemapRoutes.find((r) => r.url === 'https://imammission.org');
  const sitemapValid = Boolean(sitemapRoot && sitemapRoutes.length >= 20);
  checks.push({
    dimension: 'Dynamic XML Sitemap Indexing',
    expected: '>= 20 routes with canonical https://imammission.org base',
    actual: `${sitemapRoutes.length} routes registered (Root: ${sitemapRoot?.url})`,
    passed: sitemapValid,
  });

  // Print results
  checks.forEach((c, idx) => {
    const num = (idx + 1).toString().padStart(2, '0');
    const symbol = c.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${num}. ${c.dimension.padEnd(42)} -> ${c.actual}`);
  });

  const allPassed = checks.every((c) => c.passed);
  console.log('\n----------------------------------------------------------------------------------------');
  console.log(`  AUDIT OUTCOME: ${allPassed ? '✓ ALL DOMAIN & BRAND CONFIGURATION CHECKS PASSED (100%)' : '✗ CONFIGURATION DEFECT DETECTED'}`);
  console.log('========================================================================================\n');

  return { allPassed, checks };
}

// If executed via CLI
if (require.main === module || process.argv[1]?.includes('verify-domain-config')) {
  runDomainAndBrandVerification()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error('Fatal domain verification error:', err);
      process.exit(1);
    });
}
