/**
 * IMF-DOS Production Backup & Disaster Recovery CLI
 * Usage:
 *   npx tsx scripts/backup-cli.ts drill
 *   npx tsx scripts/backup-cli.ts backup
 *   npx tsx scripts/backup-cli.ts restore <archivePath>
 */

import { BackupService } from '../src/lib/backup/backup-service';

async function main() {
  const command = process.argv[2] || 'drill';

  console.log('================================================================');
  console.log('  IMF-DOS BACKUP & DISASTER RECOVERY ENGINE                     ');
  console.log('================================================================\n');

  if (command === 'drill') {
    console.log('[DR-TEST] Initiating full end-to-end Disaster Recovery restore drill...');
    const result = await BackupService.executeDisasterRecoveryDrill();

    console.log(`\n✓ Drill ID: ${result.drillId}`);
    console.log(`✓ Backup Created: ${result.backupResult.backupId}`);
    console.log(`✓ Checksum SHA-256: ${result.backupResult.checksumSha256}`);
    console.log(`✓ Encrypted Archive: ${result.backupResult.encryptedArchivePath}`);
    console.log(`✓ Total Tables Restored: ${Object.keys(result.restoreResult.restoredTables).length}`);
    console.log(`✓ Checksum Integrity Verified: ${result.restoreResult.checksumVerified ? 'YES' : 'NO'}`);
    console.log(`✓ Financial Ledger Balanced: ${result.restoreResult.financialLedgerBalanced ? 'YES' : 'NO'}`);
    console.log(`✓ Audit Trail Chaining Verified: ${result.restoreResult.auditTrailIntact ? 'YES' : 'NO'}`);
    console.log(`✓ Restoration Duration: ${result.restoreResult.durationMs}ms`);

    if (result.integrityVerified) {
      console.log('\n================================================================');
      console.log('  RESULT: DISASTER RECOVERY RESTORATION TEST PASSED (100%)      ');
      console.log('================================================================\n');
      process.exit(0);
    } else {
      console.error('\n[FATAL] Disaster recovery drill failed integrity verification!');
      process.exit(1);
    }
  } else if (command === 'backup') {
    console.log('[BACKUP] Creating live production backup...');
    const res = await BackupService.createFullBackup();
    console.log(`✓ Backup ID: ${res.backupId}`);
    console.log(`✓ Encrypted Archive: ${res.encryptedArchivePath}`);
    console.log(`✓ SHA-256 Checksum: ${res.checksumSha256}`);
    console.log(`✓ Size: ${res.manifest.totalSizeBytes} bytes`);
  } else if (command === 'restore') {
    const archivePath = process.argv[3];
    if (!archivePath) {
      console.error('Error: Please provide path to encrypted backup archive (.imfbak)');
      process.exit(1);
    }
    console.log(`[RESTORE] Restoring from ${archivePath}...`);
    const res = await BackupService.restoreBackup(archivePath);
    console.log(`✓ Restored Backup ID: ${res.backupId}`);
    console.log(`✓ Tables Restored: ${JSON.stringify(res.restoredTables)}`);
    console.log(`✓ Checksum Verified: ${res.checksumVerified}`);
  } else {
    console.log('Available commands: drill | backup | restore <path>');
  }
}

main().catch((err) => {
  console.error('[BACKUP_CLI_ERROR]', err);
  process.exit(1);
});
