import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/rbac';
import { ComplianceConfig } from '@/lib/compliance/compliance-config';
import { DonationStatus, FundType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // 1. Enforce strict server-side authentication
    const authUser = await requireAuth(req);

    // 2. Fetch or link DonorProfile strictly for the authenticated user
    let donorProfile = await prisma.donorProfile.findFirst({
      where: {
        OR: [
          { userId: authUser.id },
          { email: authUser.email.toLowerCase().trim() },
        ],
      },
      include: {
        donations: {
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            campaign: true,
            taxExemptionReceipt: true,
            refunds: true,
          },
        },
      },
    });

    // If profile exists by email but userId wasn't linked yet, link it now
    if (donorProfile && !donorProfile.userId) {
      donorProfile = await prisma.donorProfile.update({
        where: { id: donorProfile.id },
        data: { userId: authUser.id },
        include: {
          donations: {
            orderBy: { createdAt: 'desc' },
            include: {
              category: true,
              campaign: true,
              taxExemptionReceipt: true,
              refunds: true,
            },
          },
        },
      });
    }

    const is80GOrgVerified = ComplianceConfig.is80GVerified();
    const statutoryNotice = ComplianceConfig.getDonationReceiptDisclaimer();

    if (!donorProfile) {
      return NextResponse.json({
        profile: {
          fullName: authUser.name,
          email: authUser.email,
          phone: null,
          panMasked: null,
          addressLine1: null,
          city: null,
          state: null,
          country: 'India',
          totalDonatedAmount: 0,
          donationCount: 0,
        },
        donations: [],
        refunds: [],
        summary: {
          totalDonatedINR: 0,
          donationCount: 0,
          zakatTotalINR: 0,
          khumsTotalINR: 0,
          generalTotalINR: 0,
        },
        compliance: {
          is80GVerified: is80GOrgVerified,
          statutoryDisclaimer: statutoryNotice.noticeText,
          registrationReference: statutoryNotice.registrationReference,
        },
      });
    }

    // 3. Compute donor financial metrics
    let totalINR = 0;
    let zakatTotal = 0;
    let khumsTotal = 0;
    let generalTotal = 0;
    let successCount = 0;

    const allRefunds: any[] = [];

    const donationsList = donorProfile.donations || [];
    const sanitizedDonations = donationsList.map((d: any) => {
      const amtINR = Number(d.amountInINR);
      if (d.paymentStatus === DonationStatus.SUCCESS) {
        totalINR += amtINR;
        successCount++;
        if (d.fundType === FundType.ZAKAT_MAL || d.fundType === FundType.ZAKAT_FITRAH) {
          zakatTotal += amtINR;
        } else if (d.fundType === FundType.KHUMS_SEHAM_E_IMAM || d.fundType === FundType.KHUMS_SEHAM_E_SADAT) {
          khumsTotal += amtINR;
        } else {
          generalTotal += amtINR;
        }
      }

      if (d.refunds && d.refunds.length > 0) {
        d.refunds.forEach((r: any) => {
          allRefunds.push({
            id: r.id,
            donationReceiptNumber: d.receiptNumber,
            amount: Number(r.amount),
            currency: r.currency,
            reason: r.reason,
            status: r.status,
            createdAt: r.createdAt,
            approvedAt: r.approvedAt,
          });
        });
      }

      return {
        id: d.id,
        receiptNumber: d.receiptNumber,
        amount: Number(d.amount),
        currency: d.currency,
        amountInINR: amtINR,
        fundType: d.fundType,
        paymentMethod: d.paymentMethod,
        paymentStatus: d.paymentStatus,
        completedAt: d.completedAt,
        createdAt: d.createdAt,
        qrVerificationHash: d.qrVerificationHash,
        is80GIssued: is80GOrgVerified && d.is80GIssued,
        category: d.category ? { name: d.category.name, slug: d.category.slug } : null,
        campaign: d.campaign ? { name: d.campaign.title, slug: d.campaign.slug } : null,
        taxReceipt: is80GOrgVerified && d.taxExemptionReceipt ? {
          certificateNumber: d.taxExemptionReceipt.certificateNumber,
          financialYear: d.taxExemptionReceipt.financialYear,
          deductionPercent: d.taxExemptionReceipt.deductionPercent,
          qrVerificationUrl: d.taxExemptionReceipt.qrVerificationUrl,
        } : null,
      };
    });

    return NextResponse.json({
      profile: {
        id: donorProfile.id,
        fullName: donorProfile.fullName,
        email: donorProfile.email,
        phone: donorProfile.phone,
        panMasked: donorProfile.panMasked,
        addressLine1: donorProfile.addressLine1,
        addressLine2: donorProfile.addressLine2,
        city: donorProfile.city,
        state: donorProfile.state,
        country: donorProfile.country,
        totalDonatedAmount: Number(donorProfile.totalDonatedAmount),
        donationCount: donorProfile.donationCount,
      },
      donations: sanitizedDonations,
      refunds: allRefunds,
      summary: {
        totalDonatedINR: totalINR,
        donationCount: successCount,
        zakatTotalINR: zakatTotal,
        khumsTotalINR: khumsTotal,
        generalTotalINR: generalTotal,
      },
      compliance: {
        is80GVerified: is80GOrgVerified,
        statutoryDisclaimer: statutoryNotice.noticeText,
        registrationReference: statutoryNotice.registrationReference,
      },
    });
  } catch (error: any) {
    if (error.statusCode === 401 || error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch donor dashboard' },
      { status: 500 }
    );
  }
}
