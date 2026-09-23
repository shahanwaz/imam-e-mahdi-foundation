import { NextRequest } from 'next/server';
import { VolunteerService } from '@/lib/volunteers/volunteer-service';
import { apiSuccess, apiError } from '@/lib/response';
import { CertificateType } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const body = await req.json().catch(() => ({}));

    const volunteer = await VolunteerService.getVolunteerProfile(idOrNumber);
    if (!volunteer) {
      return apiError(new Error('Volunteer profile not found.'));
    }

    const cert = await VolunteerService.issueVolunteerCertificate(
      volunteer.id,
      (body.certificateType as CertificateType) || CertificateType.VOLUNTEER_EXCELLENCE,
      body.title,
      body.description
    );

    return apiSuccess(
      cert,
      `Official certificate #${cert.certificateNumber} issued to ${volunteer.fullName}.`,
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
