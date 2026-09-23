import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, type, category, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const inquiry = await prisma.publicInquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        category: category || type || 'GENERAL',
        subject: subject || 'Public Website Inquiry',
        message,
        status: 'NEW',
      },
    });

    return NextResponse.json(
      { success: true, message: 'Inquiry submitted successfully.', id: inquiry.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[PUBLIC_INQUIRY_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry. Please try again later.' },
      { status: 500 }
    );
  }
}
