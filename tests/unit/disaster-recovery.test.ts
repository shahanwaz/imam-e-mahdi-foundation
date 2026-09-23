import { describe, it, expect } from 'vitest';
import { BackupService } from '@/lib/backup/backup-service';
import fs from 'fs';
import path from 'path';

describe('Backup & Disaster Recovery Verification Tests', () => {
  it('should successfully execute an end-to-end disaster recovery backup and restore drill', async () => {
    const drillResult = await BackupService.executeDisasterRecoveryDrill();

    expect(drillResult.integrityVerified).toBe(true);
    expect(drillResult.restoreResult.success).toBe(true);
    expect(drillResult.restoreResult.checksumVerified).toBe(true);
    expect(drillResult.restoreResult.financialLedgerBalanced).toBe(true);
    expect(drillResult.restoreResult.auditTrailIntact).toBe(true);
    expect(drillResult.backupResult.checksumSha256).toBeDefined();
    expect(drillResult.backupResult.manifest.encrypted).toBe(true);
    expect(drillResult.backupResult.manifest.algorithm).toBe('aes-256-gcm');
  });

  it('should reject tampered backup archives with authentication tag failure', async () => {
    const backupRes = await BackupService.createFullBackup({
      customData: { testRecords: [{ id: '1', name: 'Test' }] },
    });

    const archivePath = backupRes.encryptedArchivePath;
    const rawContent = JSON.parse(fs.readFileSync(archivePath, 'utf8'));

    // Tamper with ciphertext
    const tamperedPayload = Buffer.from(rawContent.payloadBase64, 'base64');
    tamperedPayload[0] ^= 0xff; // flip bit
    rawContent.payloadBase64 = tamperedPayload.toString('base64');

    const tamperedFile = archivePath.replace('.imfbak', '_tampered.imfbak');
    fs.writeFileSync(tamperedFile, JSON.stringify(rawContent), 'utf8');

    await expect(BackupService.restoreBackup(tamperedFile)).rejects.toThrow(
      /Integrity authentication tag mismatch|Unsupported state or unable to authenticate/i
    );

    // Clean up tampered file
    if (fs.existsSync(tamperedFile)) {
      fs.unlinkSync(tamperedFile);
    }
  });

  it('should verify double-entry ledger balance during restoration check', async () => {
    const unbalancedData = {
      journalVouchers: [
        {
          id: 'jv_bad',
          voucherNumber: 'JV-UNBALANCED',
          entries: [
            { id: '1', type: 'DEBIT', amount: 1000 },
            { id: '2', type: 'CREDIT', amount: 900 }, // Discrepancy!
          ],
        },
      ],
    };

    const backupRes = await BackupService.createFullBackup({
      customData: unbalancedData,
    });

    const restoreRes = await BackupService.restoreBackup(backupRes.encryptedArchivePath);
    expect(restoreRes.financialLedgerBalanced).toBe(false);
  });
});
