import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentNumber: string }> }
) {
  try {
    const { documentNumber } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format'); // 'raw_html' or 'json'

    const doc = await prisma.generatedDocument.findFirst({
      where: {
        OR: [
          { documentNumber: decodeURIComponent(documentNumber) },
          { signatureHash: decodeURIComponent(documentNumber) },
        ],
      },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: 'Document not found in registry.' },
        { status: 404 }
      );
    }

    if (format === 'html' && doc.htmlContent) {
      return new NextResponse(doc.htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    return apiSuccess(doc, 'Document retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}
