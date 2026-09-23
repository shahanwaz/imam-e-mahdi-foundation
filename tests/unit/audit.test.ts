import { describe, it, expect } from 'vitest';
import { calculateRollingHash } from '@/lib/audit';

describe('Audit Ledger & Hash Chaining Unit Tests', () => {
  it('should compute deterministic SHA-256 rolling hashes for sequential log entries', () => {
    const genesisHash = null;
    const entry1 = {
      userId: 'user_1',
      action: 'LOGIN',
      entity: 'Session',
      entityId: 'sess_1',
      timestamp: '2026-09-15T23:00:00.000Z',
    };

    const hash1 = calculateRollingHash(genesisHash, entry1);
    expect(hash1).toHaveLength(64);

    const entry2 = {
      userId: 'user_1',
      action: 'UPDATE_ROLE',
      entity: 'Role',
      entityId: 'role_admin',
      timestamp: '2026-09-15T23:01:00.000Z',
    };

    const hash2 = calculateRollingHash(hash1, entry2);
    expect(hash2).toHaveLength(64);
    expect(hash2).not.toBe(hash1);
  });

  it('should detect tampering in past audit chain', () => {
    const genesisHash = null;
    const originalEntry = {
      userId: 'user_admin',
      action: 'APPROVE_AID',
      entity: 'AidApplication',
      entityId: 'app_100',
      timestamp: '2026-09-15T23:00:00.000Z',
    };
    const validHash = calculateRollingHash(genesisHash, originalEntry);

    // Attacker modifies action from APPROVE_AID to REJECT_AID
    const tamperedEntry = {
      ...originalEntry,
      action: 'REJECT_AID',
    };
    const tamperedHash = calculateRollingHash(genesisHash, tamperedEntry);

    expect(tamperedHash).not.toBe(validHash);
  });
});
