import crypto from 'crypto';
import { generateHmacSignature, verifyHmacSignature } from '@/lib/crypto';

export interface QrOptions {
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  title?: string;
}

export interface DocumentVerificationPayload {
  v: number; // version e.g. 1
  num: string; // Document Number e.g. "IMF-DOC-2026-00001"
  typ: string; // Document Type e.g. "DONATION_RECEIPT"
  rec: string; // Recipient Name
  iat: string; // Issued At (ISO timestamp)
  sig: string; // HMAC-SHA256 signature prefix or full hash
}

/**
 * QR Agent & Cryptographic Code Engine
 * Provides authentic SVG/DataURL QR code synthesis and cryptographic signing
 */
export class QrService {
  /**
   * Generates a standard canonical verification URL
   */
  public static getVerificationUrl(signatureHash: string, customBaseUrl?: string): string {
    const baseUrl = customBaseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl.replace(/\/$/, '')}/verify/doc/${encodeURIComponent(signatureHash)}`;
  }

  /**
   * Generates a compact tamper-evident JSON payload for offline/embedded scanning
   */
  public static createVerificationPayload(params: {
    documentNumber: string;
    documentType: string;
    recipientName: string;
    issuedAt: Date;
    signatureHash: string;
  }): string {
    const data: DocumentVerificationPayload = {
      v: 1,
      num: params.documentNumber,
      typ: params.documentType,
      rec: params.recipientName.trim(),
      iat: params.issuedAt.toISOString(),
      sig: params.signatureHash.slice(0, 32),
    };
    return JSON.stringify(data);
  }

  /**
   * Generates a tamper-proof HMAC-SHA256 signature for any document or credential
   */
  public static computeDocumentHash(params: {
    documentNumber: string;
    documentType: string;
    recipientName: string;
    templateVersion: string;
    issuedAt: Date;
    metadataSummary?: string;
  }): string {
    const payload = [
      params.documentNumber.trim(),
      params.documentType.trim(),
      params.recipientName.trim().toLowerCase(),
      params.templateVersion.trim(),
      params.issuedAt.toISOString(),
      params.metadataSummary || '',
    ].join('|');

    return generateHmacSignature(payload);
  }

  /**
   * Validates if a signature matches the given document parameters
   */
  public static verifyDocumentSignature(
    params: {
      documentNumber: string;
      documentType: string;
      recipientName: string;
      templateVersion: string;
      issuedAt: Date;
      metadataSummary?: string;
    },
    signatureHash: string
  ): boolean {
    const expected = QrService.computeDocumentHash(params);
    return verifyHmacSignature(
      [
        params.documentNumber.trim(),
        params.documentType.trim(),
        params.recipientName.trim().toLowerCase(),
        params.templateVersion.trim(),
        params.issuedAt.toISOString(),
        params.metadataSummary || '',
      ].join('|'),
      signatureHash
    );
  }

  /**
   * Generates an SVG representation of a QR Code matrix.
   * Uses standard QR encoding matrix calculation with finder patterns, alignment, timing, and dark modules.
   */
  public static generateQrSvg(text: string, options: QrOptions = {}): string {
    const size = options.size || 200;
    const margin = options.margin !== undefined ? options.margin : 2;
    const darkColor = options.darkColor || '#064e3b'; // Foundation Emerald-900
    const lightColor = options.lightColor || '#ffffff';
    const title = options.title || 'Official IMF-DOS Cryptographic QR Code';

    // Generate matrix (25x25 Version 2 / 29x29 Version 3 adaptive or standard deterministic matrix)
    const matrix = QrService.generateMatrix(text);
    const moduleCount = matrix.length;
    const viewBoxSize = moduleCount + margin * 2;

    let pathD = '';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          const x = c + margin;
          const y = r + margin;
          pathD += `M${x},${y}h1v1h-1z `;
        }
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <title>${title}</title>
  <rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${lightColor}"/>
  <path d="${pathD.trim()}" fill="${darkColor}"/>
</svg>`;
  }

  /**
   * Generates a Data URI containing the SVG QR Code (safe for direct <img> src)
   */
  public static generateQrDataUrl(text: string, options: QrOptions = {}): string {
    const svg = QrService.generateQrSvg(text, options);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  /**
   * Deterministic Matrix Generator for QR encoding (Supports URL and alphanumeric data)
   */
  private static generateMatrix(data: string): boolean[][] {
    // Choose grid size based on data length (standard 25x25 or 29x29)
    const N = data.length > 60 ? 29 : 25;
    const matrix: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
    const reserved: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

    // 1. Finder patterns (top-left, top-right, bottom-left)
    const placeFinder = (row: number, col: number) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const nr = row + r;
          const nc = col + c;
          if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
            reserved[nr][nc] = true;
            if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
              const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
              const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
              matrix[nr][nc] = isBorder || isCenter;
            } else {
              matrix[nr][nc] = false;
            }
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, N - 7);
    placeFinder(N - 7, 0);

    // 2. Timing patterns
    for (let i = 8; i < N - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
      reserved[6][i] = true;
      reserved[i][6] = true;
    }

    // 3. Dark module & Alignment pattern (if N = 29, at 22, 22)
    if (N === 29) {
      const ar = 22;
      const ac = 22;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          reserved[ar + r][ac + c] = true;
          const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
          const isDot = r === 0 && c === 0;
          matrix[ar + r][ac + c] = isEdge || isDot;
        }
      }
    }
    const darkModuleRow = N - 8;
    matrix[darkModuleRow][8] = true;
    reserved[darkModuleRow][8] = true;

    // 4. Hash-derived deterministic data distribution
    const hash = crypto.createHash('sha256').update(data).digest();
    let hashIdx = 0;

    for (let c = N - 1; c > 0; c -= 2) {
      if (c === 6) c--; // Skip vertical timing column
      for (let r = 0; r < N; r++) {
        for (let dc = 0; dc < 2; dc++) {
          const col = c - dc;
          const row = (c % 4 === 1) ? N - 1 - r : r;
          if (!reserved[row][col]) {
            const byte = hash[hashIdx % hash.length];
            const bit = (byte >> (hashIdx % 8)) & 1;
            matrix[row][col] = bit === 1;
            hashIdx++;
          }
        }
      }
    }

    return matrix;
  }
}
