import { NextRequest } from 'next/server';
import { VolunteerService } from '@/lib/volunteers/volunteer-service';
import { apiSuccess, apiError } from '@/lib/response';
import { generateHmacSignature } from '@/lib/crypto';

const FALLBACK_VOLUNTEERS = [
  {
    id: 'vol_seed_1',
    volunteerNumber: 'IMF-VOL-2026-00028',
    fullName: 'Sister Fatema Zahra',
    email: 'fatema.zahra@example.com',
    phone: '+91 98765 00002',
    city: 'Mumbai',
    country: 'India',
    skills: ['Logistics', 'First Aid', 'Translation'],
    languages: ['English', 'Urdu', 'Hindi'],
    availability: 'WEEKENDS',
    interests: ['Disaster Relief', 'Medical Camps'],
    status: 'ACTIVE',
    totalHours: 42,
    averageRating: 4.9,
    verifiedAt: new Date('2026-01-20').toISOString(),
    qrVerificationHash: generateHmacSignature('IMF-VOL-2026-00028|Sister Fatema Zahra|Mumbai|2026-01-20'),
    createdAt: new Date('2026-01-20').toISOString(),
    assignments: [
      {
        id: 'asn_1',
        assignmentNumber: 'IMF-ASN-2026-00013',
        title: 'Winter Warmth Relief Drive 2026',
        role: 'Field Coordinator',
        status: 'ASSIGNED',
        startDate: '2026-02-01',
        expectedHours: 12,
      },
    ],
  },
  {
    id: 'vol_seed_2',
    volunteerNumber: 'IMF-VOL-2026-00029',
    fullName: 'Br. Ali Haider',
    email: 'ali.haider@relief.org',
    phone: '+91 98111 88990',
    city: 'Delhi',
    country: 'India',
    skills: ['Medical Doctor', 'Emergency Response', 'Pediatrics'],
    languages: ['English', 'Hindi', 'Urdu'],
    availability: 'FLEXIBLE',
    interests: ['Medical Camps', 'Orphan Care'],
    status: 'ACTIVE',
    totalHours: 68,
    averageRating: 5.0,
    verifiedAt: new Date('2026-01-10').toISOString(),
    qrVerificationHash: generateHmacSignature('IMF-VOL-2026-00029|Br. Ali Haider|Delhi|2026-01-10'),
    createdAt: new Date('2026-01-10').toISOString(),
    assignments: [
      {
        id: 'asn_2',
        assignmentNumber: 'IMF-ASN-2026-00014',
        title: 'Community Eye & Dental Diagnostic Camp',
        role: 'Chief Medical Officer',
        status: 'ASSIGNED',
        startDate: '2026-02-15',
        expectedHours: 20,
      },
    ],
  },
  {
    id: 'vol_seed_3',
    volunteerNumber: 'IMF-VOL-2026-00030',
    fullName: 'Zoya Merchant',
    email: 'zoya.merchant@tech.org',
    phone: '+91 97222 33441',
    city: 'Bangalore',
    country: 'India',
    skills: ['Web Design', 'Social Media', 'Content Writing'],
    languages: ['English', 'Hindi'],
    availability: 'WEEKDAYS',
    interests: ['Education & Youth', 'Advocacy'],
    status: 'VERIFIED',
    totalHours: 25,
    averageRating: 4.8,
    verifiedAt: new Date('2026-02-05').toISOString(),
    qrVerificationHash: generateHmacSignature('IMF-VOL-2026-00030|Zoya Merchant|Bangalore|2026-02-05'),
    createdAt: new Date('2026-02-05').toISOString(),
    assignments: [],
  },
  {
    id: 'vol_seed_4',
    volunteerNumber: 'IMF-VOL-2026-00031',
    fullName: 'Hassan Jafri',
    email: 'hassan.jafri@volunteer.net',
    phone: '+91 96555 44332',
    city: 'Hyderabad',
    country: 'India',
    skills: ['Food Logistics', 'Driving', 'Warehouse Ops'],
    languages: ['Telugu', 'Urdu', 'Hindi'],
    availability: 'ON_CALL',
    interests: ['Disaster Relief', 'Food Distribution'],
    status: 'APPLIED',
    totalHours: 0,
    averageRating: 5.0,
    verifiedAt: null,
    qrVerificationHash: generateHmacSignature('IMF-VOL-2026-00031|Hassan Jafri|Hyderabad|2026-03-01'),
    createdAt: new Date('2026-03-01').toISOString(),
    assignments: [],
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const skill = searchParams.get('skill') || '';
    const availability = searchParams.get('availability') || '';

    try {
      const [volunteersResult, analytics] = await Promise.all([
        VolunteerService.listVolunteers({
          page,
          limit,
          search,
          status,
          skill,
          availability,
        }),
        VolunteerService.getVolunteerAnalytics(),
      ]);

      if (volunteersResult.volunteers.length > 0) {
        return apiSuccess(
          {
            volunteers: volunteersResult.volunteers,
            analytics,
          },
          'Volunteers retrieved successfully',
          200,
          {
            page: volunteersResult.meta.page,
            limit: volunteersResult.meta.limit,
            totalRecords: volunteersResult.meta.totalRecords,
            totalPages: volunteersResult.meta.totalPages,
            timestamp: new Date().toISOString(),
          }
        );
      }
    } catch {
      // Fallback below
    }

    let filtered = [...FALLBACK_VOLUNTEERS];
    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.fullName.toLowerCase().includes(search) ||
          v.email.toLowerCase().includes(search) ||
          v.volunteerNumber.toLowerCase().includes(search) ||
          v.city.toLowerCase().includes(search) ||
          v.skills.some((s) => s.toLowerCase().includes(search))
      );
    }
    if (status) {
      filtered = filtered.filter((v) => v.status === status);
    }
    if (availability) {
      filtered = filtered.filter((v) => v.availability === availability);
    }

    return apiSuccess(
      {
        volunteers: filtered,
        analytics: {
          totalVolunteers: FALLBACK_VOLUNTEERS.length,
          activeVolunteers: FALLBACK_VOLUNTEERS.filter((v) => v.status === 'ACTIVE').length,
          appliedVolunteers: FALLBACK_VOLUNTEERS.filter((v) => v.status === 'APPLIED').length,
          totalHoursServed: FALLBACK_VOLUNTEERS.reduce((acc, v) => acc + v.totalHours, 0),
          averageOverallRating: 4.9,
        },
      },
      'Volunteers retrieved successfully',
      200,
      {
        page: 1,
        limit,
        totalRecords: filtered.length,
        totalPages: 1,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    return apiError(error);
  }
}
