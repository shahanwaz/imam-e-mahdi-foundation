import { describe, it, expect } from 'vitest';
import { QrService } from '@/lib/qr/qr-service';
import { DocumentType } from '@prisma/client';

describe('QR Agent & Cryptographic Code Engine Unit Tests', () => {
  it('should generate valid SVG QR code markup with custom color and title', () => {
    const text = 'https://imf.org/verify/doc/sample_signature_12345';
    const svg = QrService.generateQrSvg(text, {
      darkColor: '#064e3b',
      size: 180,
      title: 'Donation Receipt Verification QR',
    });

    expect(svg).toBeDefined();
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('width="180"');
    expect(svg).toContain('height="180"');
    expect(svg).toContain('Donation Receipt Verification QR');
    expect(svg).toContain('#064e3b');
    expect(svg).toContain('</svg>');
  });

  it('should generate valid data URL for direct embedding in <img> tags', () => {
    const text = 'IMF-DOC-2026-00001';
    const dataUrl = QrService.generateQrDataUrl(text);

    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(dataUrl).toContain('%3Csvg');
  });

  it('should generate standard canonical verification URLs', () => {
    const hash = 'a1b2c3d4e5f6';
    const url = QrService.getVerificationUrl(hash, 'https://dos.imf.org');
    expect(url).toBe('https://dos.imf.org/verify/doc/a1b2c3d4e5f6');
  });

  it('should compute and verify HMAC-SHA256 signatures for documents', () => {
    const params = {
      documentNumber: 'IMF-REC-2026-00042',
      documentType: DocumentType.DONATION_RECEIPT,
      recipientName: 'Syed Ali Raza',
      templateVersion: '1.0.0',
      issuedAt: new Date('2026-01-15T10:00:00Z'),
      metadataSummary: JSON.stringify({ amount: 10000, fund: 'Zakat' }),
    };

    const signature = QrService.computeDocumentHash(params);
    expect(signature).toBeDefined();
    expect(signature.length).toBe(64); // 256-bit hex hash

    const isValid = QrService.verifyDocumentSignature(params, signature);
    expect(isValid).toBe(true);

    // Tampered parameters should fail verification
    const isTampered = QrService.verifyDocumentSignature(
      { ...params, recipientName: 'Tampered Attacker' },
      signature
    );
    expect(isTampered).toBe(false);
  });

  it('should create compact verification payload for offline scanning', () => {
    const payloadStr = QrService.createVerificationPayload({
      documentNumber: 'IMF-MEM-2026-00009',
      documentType: DocumentType.MEMBER_ID,
      recipientName: 'Sister Fatema Zahra',
      issuedAt: new Date('2026-01-15T12:00:00Z'),
      signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    });

    const parsed = JSON.parse(payloadStr);
    expect(parsed.v).toBe(1);
    expect(parsed.num).toBe('IMF-MEM-2026-00009');
    expect(parsed.typ).toBe(DocumentType.MEMBER_ID);
    expect(parsed.rec).toBe('Sister Fatema Zahra');
    expect(parsed.sig).toBe('e3b0c44298fc1c149afbf4c8996fb924');
  });
});
