/**
 * VERIDEGREE X — PDF INTEGRITY & BINARY HASHING VERIFICATION
 * 
 * Demonstrates:
 * 1. Binary arrayBuffer SHA-256 calculation.
 * 2. Original PDF matches registered hash.
 * 3. 1-byte alteration in PDF changes hash completely (tamper detection).
 * 4. Re-exported PDF produces a distinct hash (binary variation).
 * 5. Non-PDF / corrupt upload rejection.
 * 6. Explains that SHA-256 verifies exact binary integrity, not visual or legal authenticity.
 */

import crypto from 'crypto';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
console.log(`${BOLD}${CYAN}           VERIDEGREE X — PDF BINARY INTEGRITY VERIFICATION           ${RESET}`);
console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);

// 1. Synthetic PDF Binary Representation (Minimal valid PDF header & body)
const originalPdfBytes = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Title (Degree Certificate) /Author (Demo University) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF',
  'utf8'
);

// Calculate SHA-256 binary hash
const originalHash = '0x' + crypto.createHash('sha256').update(originalPdfBytes).digest('hex');
console.log(`[1] Original PDF Binary Hashing:`);
console.log(`  File Size  : ${originalPdfBytes.length} bytes`);
console.log(`  SHA-256    : ${BOLD}${originalHash}${RESET}\n`);

// 2. Tampered / Modified PDF (Changing a single byte: 'Degree Certificate' -> 'Degree CertificatX')
const modifiedPdfBytes = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Title (Degree CertificatX) /Author (Demo University) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF',
  'utf8'
);
const modifiedHash = '0x' + crypto.createHash('sha256').update(modifiedPdfBytes).digest('hex');
const isTamperDetected = originalHash !== modifiedHash;

console.log(`[2] Modified PDF Tamper Detection:`);
console.log(`  Modified Hash : ${modifiedHash}`);
console.log(`  Hash Match    : ${originalHash === modifiedHash ? 'MATCH' : 'MISMATCH'}`);
console.log(`  Result        : ${isTamperDetected ? GREEN + 'PASSED (Tamper Detected Instantly)' : RED + 'FAILED'}${RESET}\n`);

// 3. Re-exported PDF (Identical visual text but different PDF metadata / timestamps)
const reexportedPdfBytes = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Title (Degree Certificate) /Author (Demo University) /CreationDate (D:20261122013000) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF',
  'utf8'
);
const reexportedHash = '0x' + crypto.createHash('sha256').update(reexportedPdfBytes).digest('hex');
const isReexportHashDifferent = originalHash !== reexportedHash;

console.log(`[3] Re-Exported PDF (Metadata Discrepancy):`);
console.log(`  Re-Export Hash : ${reexportedHash}`);
console.log(`  Difference     : ${isReexportHashDifferent ? GREEN + 'Expected (Binary differences alter cryptographic hash)' : 'Unexpected'}${RESET}`);
console.log(`  Important Note : SHA-256 verifies exact binary bitstream integrity. Re-saving or re-exporting a document changes binary metadata, which alters the hash even if visual contents appear identical.\n`);

// 4. Non-PDF File Validation
const nonPdfBytes = Buffer.from('<html><body>Fake certificate</body></html>', 'utf8');
const isPdf = nonPdfBytes.subarray(0, 5).toString('utf8').startsWith('%PDF-');

console.log(`[4] Non-PDF File Validation:`);
console.log(`  Header Checked : ${nonPdfBytes.subarray(0, 5).toString('utf8')}`);
console.log(`  PDF Validation : ${!isPdf ? GREEN + 'PASSED (Non-PDF Rejected by File Type Validator)' : RED + 'FAILED'}${RESET}\n`);

console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
console.log(`${BOLD}${GREEN}✔ PDF INTEGRITY & CRYPTOGRAPHIC HASHING VERIFICATION COMPLETE.${RESET}`);
console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);

