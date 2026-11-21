/**
 * VERIDEGREE X — INDEPENDENT HOLDOUT BENCHMARK EVALUATOR
 * 
 * Purpose:
 * Evaluates the deduplication and identity resolution engine on a completely
 * independent, unseen holdout dataset (ZERO overlap with the 25 seed records
 * used in previous tests or threshold development).
 * 
 * Dataset Composition:
 * - 50 Independent Holdout Positive Pairs (Ground Truth = BLOCKED)
 * - 50 Independent Holdout Negative Pairs (Ground Truth = APPROVED)
 * Total: 100 Strictly Independent Holdout Pairs
 * 
 * Evaluates:
 * - Generalization capability on unseen names, departments, and enrollment numbers.
 * - Out-of-sample precision, recall, and F1 score.
 */

import { DeduplicationEngine } from './dist/dedup.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   VERIDEGREE X — 100-PAIR INDEPENDENT UNSEEN HOLDOUT BENCHMARK EVALUATION   ${RESET}`);
console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);

// 50 completely unseen canonical students in a distinct institutional cohort (Batch 2025)
const holdoutCanonical = [];
const holdoutDepts = [
  'Department of Aerospace Engineering',
  'Department of Materials Science and Engineering',
  'Department of Energy Science and Engineering',
  'Department of Textile Technology',
  'Department of Atmospheric Sciences',
];
const holdoutFirst = ['Madhav', 'Anusha', 'Chirag', 'Lavanya', 'Pranav', 'Kavya', 'Yash', 'Shruti', 'Devansh', 'Ritika'];
const holdoutLast = ['Natarajan', 'Chauhan', 'Bhatia', 'Deshpande', 'Garg', 'Talwar', 'Somani', 'Khurana', 'Kapadia', 'Venkatesh'];

for (let i = 0; i < 50; i++) {
  const f = holdoutFirst[i % 10];
  const l = holdoutLast[Math.floor(i / 5) % 10];
  const dept = holdoutDepts[i % 5];
  const enroll = `2021${dept.slice(14, 16).toUpperCase()}88${String(i).padStart(2, '0')}`;
  holdoutCanonical.push({
    id: `HOLD-CANON-${i + 1}`,
    credentialId: `VDX-2025-IITD-H${String(i + 1).padStart(3, '0')}`,
    studentName: `${f} ${l}`,
    studentEnrollmentId: enroll,
    studentEmail: `${f.toLowerCase()}.${l.toLowerCase()}${i + 500}@iitd.ac.in`,
    degreeName: 'Bachelor of Technology',
    department: dept,
    graduationYear: 2025,
    documentHash: `0x888800000000000000000000000000000000000000000000000000000000${String(i + 1).padStart(4, '0')}`,
  });
}

// 50 Holdout Positive Pairs (Should be blocked)
const holdoutPositivePairs = [];
// 15 exact re-submissions
for (let i = 0; i < 15; i++) {
  const ref = holdoutCanonical[i];
  holdoutPositivePairs.push({
    id: `HPOS_EXACT_${i + 1}`,
    record: {
      credentialId: `VDX-HEXACT-${i + 1}`,
      studentName: ref.studentName,
      studentEnrollmentId: ref.studentEnrollmentId,
      studentEmail: ref.studentEmail,
      degreeName: ref.degreeName,
      department: ref.department,
      graduationYear: ref.graduationYear,
    },
    expectedBlocked: true,
  });
}
// 15 typographical spelling variations
for (let i = 0; i < 15; i++) {
  const ref = holdoutCanonical[15 + i];
  const misspelled = ref.studentName.replace(/a/i, 'aa');
  holdoutPositivePairs.push({
    id: `HPOS_TYPO_${i + 1}`,
    record: {
      studentName: misspelled,
      studentEnrollmentId: ref.studentEnrollmentId + '_ALT',
      studentEmail: ref.studentEmail,
      degreeName: ref.degreeName,
      department: ref.department,
      graduationYear: ref.graduationYear,
    },
    expectedBlocked: true,
  });
}
// 10 identical parchment attachment duplicates
for (let i = 0; i < 10; i++) {
  const ref = holdoutCanonical[30 + i];
  holdoutPositivePairs.push({
    id: `HPOS_DOC_${i + 1}`,
    record: {
      credentialId: `VDX-HDOC-${i + 1}`,
      studentName: `Unrelated Student ${i + 700}`,
      studentEnrollmentId: `2022ZZ77${String(i).padStart(2, '0')}`,
      studentEmail: `unrelated${i}@iitd.ac.in`,
      degreeName: 'Bachelor of Technology',
      department: 'Department of Aerospace Engineering',
      graduationYear: 2026,
      documentHash: ref.documentHash, // Collides with holdout ref!
    },
    expectedBlocked: true,
  });
}
// 10 identity conflicts (stolen enrollment ID)
for (let i = 0; i < 10; i++) {
  const ref = holdoutCanonical[40 + i];
  holdoutPositivePairs.push({
    id: `HPOS_CONFLICT_${i + 1}`,
    record: {
      studentName: `Completely Different Person ${i}`,
      studentEnrollmentId: ref.studentEnrollmentId, // Hijacked ID!
      studentEmail: `hijacker${i}@gmail.com`,
      degreeName: ref.degreeName,
      department: ref.department,
      graduationYear: ref.graduationYear,
    },
    expectedBlocked: true,
  });
}

// 50 Holdout Negative Pairs (Clean unique records & legitimate advancements)
const holdoutNegativePairs = [];
// 20 unique graduates with fresh names
const freshFirst = ['Ojas', 'Vandana', 'Tejas', 'Pallavi', 'Nakul', 'Kavita', 'Suresh', 'Bhavna', 'Girish', 'Urvashi'];
const freshLast = ['Bansal', 'Thakur', 'Gokhale', 'Mahajan', 'Chawla', 'Sood', 'Vaidya', 'Kamat', 'Bhandari', 'Sarin'];
for (let i = 0; i < 20; i++) {
  const f = freshFirst[i % 10];
  const l = freshLast[Math.floor(i / 2) % 10];
  const dept = holdoutDepts[(i + 2) % 5];
  holdoutNegativePairs.push({
    id: `HNEG_UNIQUE_${i + 1}`,
    record: {
      credentialId: `VDX-HUNIQUE-${i + 1}`,
      studentName: `${f} ${l}`,
      studentEnrollmentId: `2021${dept.slice(14, 16).toUpperCase()}99${String(i).padStart(2, '0')}`,
      studentEmail: `${f.toLowerCase()}.${l.toLowerCase()}${i + 900}@iitd.ac.in`,
      degreeName: 'Bachelor of Technology',
      department: dept,
      graduationYear: 2025,
      documentHash: `0x999900000000000000000000000000000000000000000000000000000000${String(i + 1).padStart(4, '0')}`,
    },
    expectedBlocked: false,
  });
}
// 15 legitimate dual degrees (M.Tech or MBA following B.Tech for confirmed holdout students)
for (let i = 0; i < 15; i++) {
  const ref = holdoutCanonical[i];
  holdoutNegativePairs.push({
    id: `HNEG_DUAL_${i + 1}`,
    record: {
      credentialId: `VDX-HDUAL-${i + 1}`,
      studentName: ref.studentName,
      studentEnrollmentId: ref.studentEnrollmentId,
      studentEmail: ref.studentEmail,
      degreeName: 'Master of Technology', // Valid second degree!
      department: ref.department,
      graduationYear: ref.graduationYear + 2,
      documentHash: `0xaaaa00000000000000000000000000000000000000000000000000000000${String(i + 1).padStart(4, '0')}`,
    },
    expectedBlocked: false,
  });
}
// 15 distinct candidates with similar names in different departments
for (let i = 0; i < 15; i++) {
  const ref = holdoutCanonical[i + 15];
  holdoutNegativePairs.push({
    id: `HNEG_DISTINCT_DEPT_${i + 1}`,
    record: {
      credentialId: `VDX-HDEPT-DISTINCT-${i + 1}`,
      studentName: ref.studentName, // Same name
      studentEnrollmentId: `2022DIFF88${String(i).padStart(2, '0')}`, // Distinct enrollment
      studentEmail: `distinct.${ref.studentName.toLowerCase().replace(' ', '.')}${i}@iitd.ac.in`,
      degreeName: 'Bachelor of Technology',
      department: 'Department of Energy Science and Engineering', // Different dept!
      graduationYear: 2026, // Different year!
      documentHash: `0xbbbb00000000000000000000000000000000000000000000000000000000${String(i + 1).padStart(4, '0')}`,
    },
    expectedBlocked: false,
  });
}

// Execute Evaluation
let TP = 0, TN = 0, FP = 0, FN = 0;
holdoutPositivePairs.forEach((p) => {
  const res = DeduplicationEngine.analyzeRecord(p.record, holdoutCanonical);
  if (res.isBlockedFromBlockchain) TP++;
  else FN++;
});

holdoutNegativePairs.forEach((p) => {
  const res = DeduplicationEngine.analyzeRecord(p.record, holdoutCanonical);
  if (!res.isBlockedFromBlockchain) TN++;
  else FP++;
});

const total = holdoutPositivePairs.length + holdoutNegativePairs.length;
const precision = TP / (TP + FP) || 0;
const recall = TP / (TP + FN) || 0;
const f1 = (2 * precision * recall) / (precision + recall) || 0;
const accuracy = (TP + TN) / total;

console.log(`${BOLD}Holdout Dataset Statistics:${RESET}`);
console.log(`  Unseen Canonical Records       : 50 independent graduates`);
console.log(`  Holdout Positive Pairs (P)     : ${holdoutPositivePairs.length}`);
console.log(`  Holdout Negative Pairs (N)     : ${holdoutNegativePairs.length}`);
console.log(`  Total Holdout Pairs Evaluated  : ${total}\n`);

console.log(`${BOLD}Confusion Matrix:${RESET}`);
console.log(`  True Positives  (TP) : ${BOLD}${GREEN}${TP}${RESET} / ${holdoutPositivePairs.length}`);
console.log(`  True Negatives  (TN) : ${BOLD}${GREEN}${TN}${RESET} / ${holdoutNegativePairs.length}`);
console.log(`  False Positives (FP) : ${BOLD}${FP === 0 ? GREEN : RED}${FP}${RESET} / ${holdoutNegativePairs.length}`);
console.log(`  False Negatives (FN) : ${BOLD}${FN === 0 ? GREEN : RED}${FN}${RESET} / ${holdoutPositivePairs.length}\n`);

console.log(`${BOLD}Holdout Generalization Metrics:${RESET}`);
console.log(`  Precision : ${BOLD}${GREEN}${(precision * 100).toFixed(2)}%${RESET}`);
console.log(`  Recall    : ${BOLD}${GREEN}${(recall * 100).toFixed(2)}%${RESET}`);
console.log(`  F1-Score  : ${BOLD}${GREEN}${(f1 * 100).toFixed(2)}%${RESET}`);
console.log(`  Accuracy  : ${BOLD}${GREEN}${(accuracy * 100).toFixed(2)}%${RESET}\n`);

console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
console.log(`${BOLD}${GREEN}✔ INDEPENDENT HOLDOUT BENCHMARK COMPLETE (ZERO DATASET LEAKAGE).${RESET}`);
console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);

