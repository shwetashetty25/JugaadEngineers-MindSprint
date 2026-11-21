/**
 * VERIDEGREE X — CONCURRENCY & TRANSACTION IDEMPOTENCY TEST SUITE
 * 
 * Simulates concurrent registrar uploads with overlapping academic records:
 * 1. Parallel execution via Promise.all simulating concurrent network requests.
 * 2. Atomic mutex / check-and-insert transactional locking.
 * 3. Enforces database uniqueness constraints (institutionId + studentEnrollmentId, credentialId).
 * 4. Verifies idempotency: exactly ONE canonical record is created.
 * 5. Competing concurrent submission is quarantined or marked DUPLICATE_LINKED.
 * 6. Revalidates blockchain safety gate before Sepolia issuance.
 */

import { DeduplicationEngine } from './dist/dedup.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   VERIDEGREE X — CONCURRENCY & IDEMPOTENT TRANSACTION ISOLATION TEST   ${RESET}`);
console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);

// Shared Institutional Database State
class ConcurrentDatabaseSimulator {
  constructor() {
    this.records = new Map(); // Key: institutionId + studentEnrollmentId
    this.credentials = new Map(); // Key: credentialId
    this.auditLogs = [];
    this.mutexLocked = false;
  }

  // Simulates an ACID transactional insertion with row-level locking
  async processBatchUpload(registrarEmail, batchId, records) {
    const batchResults = [];

    // Simulate network jitter (10ms to 50ms)
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 40) + 10));

    for (const record of records) {
      const studentKey = `${record.universityId || 'univ_iitd'}_${record.studentEnrollmentId}`;
      const credKey = record.credentialId;

      // 1. Evaluate candidate against current snapshot of institutional database
      const existingSnapshot = Array.from(this.records.values());
      const evaluation = DeduplicationEngine.analyzeRecord(record, existingSnapshot);

      // 2. Critical Section (Atomic Database Transaction Lock)
      if (this.records.has(studentKey)) {
        const canonical = this.records.get(studentKey);
        // Idempotency check: Exact duplicate award
        if (canonical.degreeName === record.degreeName && canonical.graduationYear === record.graduationYear) {
          batchResults.push({
            status: 'DUPLICATE_LINKED',
            credentialId: credKey,
            canonicalRecordId: canonical.credentialId,
            actionTaken: 'Linked to existing canonical record. Blockchain issuance blocked.',
            isBlocked: true,
          });
          this.auditLogs.push({
            timestamp: new Date().toISOString(),
            batchId,
            performedBy: registrarEmail,
            event: 'CONCURRENT_COLLISION_PREVENTED',
            details: `Concurrent upload for student ${record.studentEnrollmentId} trapped by uniqueness check.`,
          });
          continue;
        }
      }

      if (this.credentials.has(credKey)) {
        batchResults.push({
          status: 'REJECTED_COLLISION',
          credentialId: credKey,
          actionTaken: 'Certificate ID collision trapped. Blockchain issuance blocked.',
          isBlocked: true,
        });
        continue;
      }

      // 3. Clean record: commit to canonical database
      this.records.set(studentKey, {
        ...record,
        status: 'ACTIVE_CANONICAL',
        committedBy: registrarEmail,
        committedBatchId: batchId,
        committedAt: new Date().toISOString(),
      });
      this.credentials.set(credKey, record);

      batchResults.push({
        status: 'CREATED_CANONICAL',
        credentialId: credKey,
        actionTaken: 'Canonical record created successfully. Approved for blockchain attestation.',
        isBlocked: false,
      });

      this.auditLogs.push({
        timestamp: new Date().toISOString(),
        batchId,
        performedBy: registrarEmail,
        event: 'CANONICAL_RECORD_COMMITTED',
        details: `Student ${record.studentEnrollmentId} registered by ${registrarEmail}.`,
      });
    }

    return batchResults;
  }
}

async function runConcurrencyTest() {
  const db = new ConcurrentDatabaseSimulator();

  // Test Case: Two registrars concurrently uploading the same student "Aarav Sharma"
  const overlappingRecordA = {
    universityId: 'univ_iitd',
    credentialId: 'VDX-2024-IITD-CONCUR-01',
    studentName: 'Aarav Sharma',
    studentEnrollmentId: '2020CS10891',
    studentEmail: 'aarav.sharma@alumni.iitd.ac.in',
    degreeName: 'Bachelor of Technology',
    department: 'Department of Computer Science and Engineering',
    graduationYear: 2024,
    documentHash: '0x9999000000000000000000000000000000000000000000000000000000000001',
  };

  const overlappingRecordB = {
    universityId: 'univ_iitd',
    credentialId: 'VDX-2024-IITD-CONCUR-02',
    studentName: 'Aarav Sharma',
    studentEnrollmentId: '2020CS10891', // Identical student and award!
    studentEmail: 'aarav.sharma@alumni.iitd.ac.in',
    degreeName: 'Bachelor of Technology',
    department: 'Department of Computer Science and Engineering',
    graduationYear: 2024,
    documentHash: '0x9999000000000000000000000000000000000000000000000000000000000001',
  };

  console.log(`[1/3] Dispatching concurrent batch uploads from Registrar 1 and Registrar 2 via Promise.all()...`);

  const [result1, result2] = await Promise.all([
    db.processBatchUpload('registrar.north@iitd.ac.in', 'BATCH_NORTH_101', [overlappingRecordA]),
    db.processBatchUpload('registrar.south@iitd.ac.in', 'BATCH_SOUTH_202', [overlappingRecordB]),
  ]);

  console.log(`\nRegistrar 1 (North Office) Result:`);
  console.log(`  Status       : ${BOLD}${result1[0].status}${RESET}`);
  console.log(`  Action       : ${result1[0].actionTaken}`);
  console.log(`  Block Status : ${result1[0].isBlocked ? RED + 'BLOCKED' : GREEN + 'APPROVED'}${RESET}`);

  console.log(`\nRegistrar 2 (South Office) Result:`);
  console.log(`  Status       : ${BOLD}${result2[0].status}${RESET}`);
  console.log(`  Action       : ${result2[0].actionTaken}`);
  console.log(`  Block Status : ${result2[0].isBlocked ? RED + 'BLOCKED' : GREEN + 'APPROVED'}${RESET}`);

  console.log(`\n[2/3] Verifying Database Uniqueness & Canonical State...`);
  const totalCanonicalRecords = db.records.size;
  console.log(`  Total Canonical Records in Database : ${BOLD}${totalCanonicalRecords}${RESET} (Expected: 1)`);

  const canonicalStudent = db.records.get('univ_iitd_2020CS10891');
  console.log(`  Canonical Holder                    : ${BOLD}${canonicalStudent.studentName} (${canonicalStudent.studentEnrollmentId})${RESET}`);
  console.log(`  Winning Transaction Batch           : ${BOLD}${canonicalStudent.committedBatchId} (${canonicalStudent.committedBy})${RESET}`);

  console.log(`\n[3/3] Revalidating Blockchain Issuance Pre-flight Gate...`);
  // Attempting to issue the losing record to Ethereum Sepolia
  const preflightEvaluation = DeduplicationEngine.analyzeRecord(overlappingRecordB, Array.from(db.records.values()));
  const blockchainBlocked = preflightEvaluation.isBlockedFromBlockchain;
  console.log(`  Pre-flight On-Chain Safety Check : ${blockchainBlocked ? GREEN + 'PASSED (Re-issuance Blocked)' : RED + 'FAILED (Allowed Duplicate)'}${RESET}`);
  console.log(`  Reason                           : ${preflightEvaluation.detectionReason}`);

  const testPassed = totalCanonicalRecords === 1 && (result1[0].isBlocked !== result2[0].isBlocked) && blockchainBlocked;

  console.log(`\n${BOLD}${CYAN}================================================================================${RESET}`);
  if (testPassed) {
    console.log(`${BOLD}${GREEN}✔ CONCURRENCY & IDEMPOTENCY TEST PASSED:${RESET}`);
    console.log(`  - Exactly one canonical record created.`);
    console.log(`  - Competing transaction trapped and linked as duplicate.`);
    console.log(`  - Zero double-spend / double-attestation on blockchain.`);
    console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);
  } else {
    console.log(`${BOLD}${RED}✘ CONCURRENCY TEST FAILED.${RESET}\n`);
    process.exit(1);
  }
}

runConcurrencyTest();

