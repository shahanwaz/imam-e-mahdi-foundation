/**
 * Standalone Worker Daemon Entrypoint for IMF-DOS
 * Run via: npx tsx scripts/worker.ts
 */

import { BackgroundWorkerService } from '../src/lib/worker/worker-service';
import { prisma } from '../src/lib/db';

console.log('================================================================');
console.log('  IMF-DOS ASYNCHRONOUS BACKGROUND WORKER DAEMON                 ');
console.log('================================================================');

BackgroundWorkerService.start(30000); // Poll every 30s

// Graceful termination handling
const shutdown = async (signal: string) => {
  console.log(`\n[WORKER] Received ${signal}. Terminating worker daemon cleanly...`);
  await BackgroundWorkerService.stop();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
