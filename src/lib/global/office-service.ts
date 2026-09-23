import { prisma } from '@/lib/db';
import { OfficeType } from '@prisma/client';
import { CountryRegistry } from './countries';

export interface CreateOfficeInput {
  officeCode: string;
  officeName: string;
  officeType: OfficeType;
  countryCode: string;
  stateProvince?: string;
  city: string;
  postalCode?: string;
  addressLine?: string;
  defaultCurrency?: string;
  defaultTimezone?: string;
  defaultLanguage?: string;
  contactEmail: string;
  contactPhone?: string;
  representativeName?: string;
  taxRegistrationNumber?: string;
}

export const SEED_OFFICE_LOCATIONS = [
  {
    officeCode: 'IMF-HQ-DELHI',
    officeName: 'Global Headquarters & Secretariat',
    officeType: OfficeType.GLOBAL_HEADQUARTERS,
    countryCode: 'IN',
    stateProvince: 'Delhi',
    city: 'New Delhi',
    postalCode: '110025',
    addressLine: '12 Jamia Nagar, Okhla Head, New Delhi',
    defaultCurrency: 'INR',
    defaultTimezone: 'Asia/Kolkata',
    defaultLanguage: 'en',
    contactEmail: 'secretariat@imf-ngo.org',
    contactPhone: '+91 11 2698 1234',
    representativeName: 'Maulana Syed Ali Naqvi',
    taxRegistrationNumber: 'U85300DL2024NPL123456',
    isActive: true,
  },
  {
    officeCode: 'IMF-UK-LONDON',
    officeName: 'United Kingdom Regional Chapter',
    officeType: OfficeType.REGIONAL_CHAPTER,
    countryCode: 'GB',
    stateProvince: 'Greater London',
    city: 'London',
    postalCode: 'E1 6AN',
    addressLine: '88 Commercial Street, Whitechapel, London',
    defaultCurrency: 'GBP',
    defaultTimezone: 'Europe/London',
    defaultLanguage: 'en',
    contactEmail: 'uk.office@imf-ngo.org',
    contactPhone: '+44 20 7946 0912',
    representativeName: 'Dr. Hasan Raza',
    taxRegistrationNumber: 'UK-CHARITY-1189234',
    isActive: true,
  },
  {
    officeCode: 'IMF-US-TEXAS',
    officeName: 'North America Liaison & Chapter Office',
    officeType: OfficeType.REGIONAL_CHAPTER,
    countryCode: 'US',
    stateProvince: 'Texas',
    city: 'Houston',
    postalCode: '77002',
    addressLine: '1001 Texas Avenue, Suite 1400, Houston, TX',
    defaultCurrency: 'USD',
    defaultTimezone: 'America/Chicago',
    defaultLanguage: 'en',
    contactEmail: 'usa.office@imf-ngo.org',
    contactPhone: '+1 713 555 0199',
    representativeName: 'Br. Mustafa Jafri',
    taxRegistrationNumber: 'EIN-84-1234567',
    isActive: true,
  },
  {
    officeCode: 'IMF-UAE-DUBAI',
    officeName: 'Middle East & Gulf Coordination Hub',
    officeType: OfficeType.LIAISON_OFFICE,
    countryCode: 'AE',
    stateProvince: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    addressLine: 'Office 402, Al Hudaiba Awards Building, Jumeirah, Dubai',
    defaultCurrency: 'AED',
    defaultTimezone: 'Asia/Dubai',
    defaultLanguage: 'ar',
    contactEmail: 'gulf.desk@imf-ngo.org',
    contactPhone: '+971 4 398 5678',
    representativeName: 'Syed Baqir Al-Musawi',
    taxRegistrationNumber: 'TRN-100234567800003',
    isActive: true,
  },
];

export class OfficeService {
  public static async listOffices(filters?: { countryCode?: string; officeType?: OfficeType; isActive?: boolean }) {
    const where: any = {};
    if (filters?.countryCode) where.countryCode = filters.countryCode.toUpperCase();
    if (filters?.officeType) where.officeType = filters.officeType;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const offices = await prisma.officeLocation.findMany({
      where,
      orderBy: [{ officeType: 'asc' }, { officeName: 'asc' }],
    });

    if (offices.length === 0) {
      // Return static seed fallback
      return SEED_OFFICE_LOCATIONS.filter((o) => {
        if (filters?.countryCode && o.countryCode !== filters.countryCode.toUpperCase()) return false;
        if (filters?.officeType && o.officeType !== filters.officeType) return false;
        return true;
      });
    }

    return offices;
  }

  public static async getOfficeByCode(code: string) {
    const office = await prisma.officeLocation.findUnique({
      where: { officeCode: code },
    });
    if (office) return office;
    return SEED_OFFICE_LOCATIONS.find((o) => o.officeCode === code) || null;
  }

  public static async createOffice(input: CreateOfficeInput) {
    const country = CountryRegistry.getCountry(input.countryCode);

    return prisma.officeLocation.create({
      data: {
        officeCode: input.officeCode.toUpperCase(),
        officeName: input.officeName,
        officeType: input.officeType,
        countryCode: input.countryCode.toUpperCase(),
        stateProvince: input.stateProvince || null,
        city: input.city,
        postalCode: input.postalCode || null,
        addressLine: input.addressLine || null,
        defaultCurrency: input.defaultCurrency || country.defaultCurrency,
        defaultTimezone: input.defaultTimezone || country.defaultTimezone,
        defaultLanguage: input.defaultLanguage || country.defaultLanguage,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone || null,
        representativeName: input.representativeName || null,
        taxRegistrationNumber: input.taxRegistrationNumber || null,
      },
    });
  }

  public static async seedStandardOffices() {
    const count = await prisma.officeLocation.count();
    if (count > 0) return { seeded: 0, message: 'Offices already populated' };

    for (const office of SEED_OFFICE_LOCATIONS) {
      await prisma.officeLocation.create({
        data: office,
      });
    }

    return { seeded: SEED_OFFICE_LOCATIONS.length, message: 'Seeded standard global offices' };
  }
}
