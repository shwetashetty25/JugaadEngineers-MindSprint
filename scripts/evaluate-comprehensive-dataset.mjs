/**
 * VERIDEGREE X — COMPREHENSIVE STATISTICAL BENCHMARK EVALUATOR
 * 
 * Dataset Composition:
 * - 110 Positive Duplicate / Anomaly Pairs (Ground Truth = DUPLICATE / CONFLICT / BLOCKED)
 * - 110 Difficult Negative Pairs (Ground Truth = CLEAN RECORD / LEGITIMATE DUAL DEGREE / APPROVED)
 * Total: 220 Separately Labelled Evaluation Pairs
 * 
 * Distinguishes:
 * - Synthetic Benchmark Dataset (N=220) vs Real Institutional Production Data
 * 
 * Computes:
 * - True Positives (TP)
 * - True Negatives (TN)
 * - False Positives (FP)
 * - False Negatives (FN)
 * - Precision, Recall, Specificity, F1-Score, and Accuracy
 */

import { DeduplicationEngine, NormalizationService, FuzzyMatcher } from './dist/dedup.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
console.log(`${BOLD}${CYAN}  VERIDEGREE X — 220-PAIR COMPREHENSIVE DATABASE INTELLIGENCE BENCHMARK  ${RESET}`);
console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);

// Ground Truth Baseline Institutional Registry (25 Canonical Students)
const canonicalRegistry = [
  {
    id: 'REG-001',
    credentialId: 'VDX-2024-IITD-001',
    studentName: 'Aarav Sharma',
    studentEnrollmentId: '2020CS10891',
    studentEmail: 'aarav.sharma@alumni.iitd.ac.in',
    degreeName: 'Bachelor of Technology',
    department: 'Department of Computer Science and Engineering',
    graduationYear: 2024,
    documentHash: '0x1111000000000000000000000000000000000000000000000000000000000001',
    blockchainTxHash: '0x4a9b000000000000000000000000000000000000000000000000000000000001',
  },
  {
    id: 'REG-002',
    credentialId: 'VDX-2023-IITD-002',
    studentName: 'Priya Nair',
    studentEnrollmentId: '2019EE10104',
    studentEmail: 'priya.nair@alumni.iitd.ac.in',
    degreeName: 'Bachelor of Technology',
    department: 'Department of Electrical Engineering',
    graduationYear: 2023,
    documentHash: '0x1111000000000000000000000000000000000000000000000000000000000002',
    blockchainTxHash: '0x4a9b000000000000000000000000000000000000000000000000000000000002',
  },
  {
    id: 'REG-003',
    credentialId: 'VDX-2024-IITD-003',
    studentName: 'Rohan Gupta',
    studentEnrollmentId: '2020ME10452',
    studentEmail: 'rohan.gupta@alumni.iitd.ac.in',
    degreeName: 'Bachelor of Technology',
    department: 'Department of Mechanical Engineering',
    graduationYear: 2024,
    documentHash: '0x1111000000000000000000000000000000000000000000000000000000000003',
  },
  {
    id: 'REG-004',
    credentialId: 'VDX-2025-IITD-004',
    studentName: 'Ananya Patel',
    studentEnrollmentId: '2021BB10789',
    studentEmail: 'ananya.patel@alumni.iitd.ac.in',
    degreeName: 'Bachelor of Technology',
    department: 'Department of Biochemical Engineering',
    graduationYear: 2025,
    documentHash: '0x1111000000000000000000000000000000000000000000000000000000000004',
  },
  {
    id: 'REG-005',
    credentialId: 'VDX-2024-IITD-005',
    studentName: 'Vikram Mehta',
    studentEnrollmentId: '2020CE10300',
    studentEmail: 'vikram.mehta@alumni.iitd.ac.in',
    degreeName: 'Bachelor of Technology',
    department: 'Department of Civil Engineering',
    graduationYear: 2024,
    documentHash: '0x1111000000000000000000000000000000000000000000000000000000000005',
  },
];

// Seed 20 additional canonical students into the repository (REG-006 to REG-025)
const departments = [
  'Department of Computer Science and Engineering',
  'Department of Electrical Engineering',
  'Department of Mechanical Engineering',
  'Department of Civil Engineering',
  'Department of Chemical Engineering',
];

const uniqueStudentProfiles = [
  { fName: 'Aditya', lName: 'Verma', dept: 'Department of Computer Science and Engineering', yr: 2022 },
  { fName: 'Sneha', lName: 'Reddy', dept: 'Department of Electrical Engineering', yr: 2023 },
  { fName: 'Karan', lName: 'Singhania', dept: 'Department of Mechanical Engineering', yr: 2024 },
  { fName: 'Pooja', lName: 'Iyer', dept: 'Department of Civil Engineering', yr: 2023 },
  { fName: 'Rahul', lName: 'Bose', dept: 'Department of Chemical Engineering', yr: 2024 },
  { fName: 'Divya', lName: 'Chopra', dept: 'Department of Computer Science and Engineering', yr: 2025 },
  { fName: 'Siddharth', lName: 'Malhotra', dept: 'Department of Electrical Engineering', yr: 2024 },
  { fName: 'Meera', lName: 'Joshi', dept: 'Department of Mechanical Engineering', yr: 2023 },
  { fName: 'Varun', lName: 'Mishra', dept: 'Department of Civil Engineering', yr: 2025 },
  { fName: 'Neha', lName: 'Saxena', dept: 'Department of Chemical Engineering', yr: 2024 },
  { fName: 'Abhinav', lName: 'Kashyap', dept: 'Department of Computer Science and Engineering', yr: 2023 },
  { fName: 'Tanvi', lName: 'Deshmukh', dept: 'Department of Electrical Engineering', yr: 2024 },
  { fName: 'Nikhil', lName: 'Bhardwaj', dept: 'Department of Mechanical Engineering', yr: 2025 },
  { fName: 'Rhea', lName: 'Sengupta', dept: 'Department of Civil Engineering', yr: 2024 },
  { fName: 'Ishaan', lName: 'Pillai', dept: 'Department of Chemical Engineering', yr: 2023 },
  { fName: 'Kriti', lName: 'Agrawal', dept: 'Department of Computer Science and Engineering', yr: 2024 },
  { fName: 'Manish', lName: 'Trivedi', dept: 'Department of Electrical Engineering', yr: 2025 },
  { fName: 'Shreya', lName: 'Mukherjee', dept: 'Department of Mechanical Engineering', yr: 2023 },
  { fName: 'Gaurav', lName: 'Nambiar', dept: 'Department of Civil Engineering', yr: 2025 },
  { fName: 'Ananya', lName: 'Chatterjee', dept: 'Department of Chemical Engineering', yr: 2024 },
];

uniqueStudentProfiles.forEach((profile, idx) => {
  const i = idx + 6;
  const code = profile.dept.includes('Computer') ? 'CS' : profile.dept.includes('Electrical') ? 'EE' : profile.dept.includes('Mechanical') ? 'ME' : profile.dept.includes('Civil') ? 'CE' : 'CH';
  const enroll = `${profile.yr - 4}${code}10${100 + i}`;
  canonicalRegistry.push({
    id: `REG-${String(i).padStart(3, '0')}`,
    credentialId: `VDX-${profile.yr}-IITD-${String(i).padStart(3, '0')}`,
    studentName: `${profile.fName} ${profile.lName}`,
    studentEnrollmentId: enroll,
    studentEmail: `${profile.fName.toLowerCase()}.${profile.lName.toLowerCase()}@alumni.iitd.ac.in`,
    degreeName: 'Bachelor of Technology',
    department: profile.dept,
    graduationYear: profile.yr,
    documentHash: `0x111100000000000000000000000000000000000000000000000000000000${String(i).padStart(4, '0')}`,
  });
});

// =============================================================================
// GENERATE 110 POSITIVE DUPLICATE / ANOMALY PAIRS (GROUND TRUTH = BLOCKED)
// =============================================================================
const positiveEvaluationPairs = [];

// Category P1: Exact Duplicate Conferrals (25 pairs)
for (let i = 0; i < 25; i++) {
  const ref = canonicalRegistry[i % canonicalRegistry.length];
  positiveEvaluationPairs.push({
    id: `POS_EXACT_${i + 1}`,
    description: `Exact Duplicate Award for ${ref.studentName} (${ref.studentEnrollmentId})`,
    category: 'EXACT_DUPLICATE',
    record: {
      credentialId: `VDX-DUPE-EXACT-${i + 1}`,
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

// Category P2: Name Re-orderings & Typographical Variations (20 pairs)
const typos = [
  { name: 'Arav Sharma', ref: 0 },
  { name: 'Aaravv Sharma', ref: 0 },
  { name: 'Sharma Aarav', ref: 0 },
  { name: 'Preeya Nair', ref: 1 },
  { name: 'Nair Priya', ref: 1 },
  { name: 'Rohann Gupta', ref: 2 },
  { name: 'Gupta Rohan', ref: 2 },
  { name: 'Ananyaa Patel', ref: 3 },
  { name: 'Vickram Mehta', ref: 4 },
  { name: 'Adityaa Verma', ref: 5 },
  { name: 'Snehaa Reddy', ref: 6 },
  { name: 'Karan Singhaniaa', ref: 7 },
  { name: 'Poojaa Iyer', ref: 8 },
  { name: 'Rahool Bose', ref: 9 },
  { name: 'Divyaa Chopra', ref: 10 },
  { name: 'Siddhartha Malhotra', ref: 11 },
  { name: 'Meeraa Joshi', ref: 12 },
  { name: 'Varunn Mishra', ref: 13 },
  { name: 'Neha Saxenna', ref: 14 },
  { name: 'Aarav S.', ref: 0 },
];
typos.forEach((item, idx) => {
  const ref = canonicalRegistry[item.ref];
  positiveEvaluationPairs.push({
    id: `POS_TYPO_${idx + 1}`,
    description: `Fuzzy Name Typo/Reordering "${item.name}" vs "${ref.studentName}"`,
    category: 'FUZZY_NAME_VARIATION',
    record: {
      studentName: item.name,
      studentEnrollmentId: ref.studentEnrollmentId + '_ALT',
      studentEmail: ref.studentEmail,
      degreeName: ref.degreeName,
      department: ref.department,
      graduationYear: ref.graduationYear,
    },
    expectedBlocked: true,
  });
});

// Category P3: Formatting Differences in Enrollment Numbers (15 pairs)
for (let i = 0; i < 15; i++) {
  const ref = canonicalRegistry[i];
  const rawEnroll = ref.studentEnrollmentId;
  // Alter formatting: 2020-CS-10891 or 2020/CS/10891
  const formattedEnroll = `${rawEnroll.slice(0, 4)}-${rawEnroll.slice(4, 6)}-${rawEnroll.slice(6)}`;
  positiveEvaluationPairs.push({
    id: `POS_FORMAT_${i + 1}`,
    description: `Enrollment formatting discrepancy "${formattedEnroll}" for ${ref.studentName}`,
    category: 'ENROLLMENT_FORMATTING',
    record: {
      studentName: ref.studentName,
      studentEnrollmentId: formattedEnroll,
      studentEmail: ref.studentEmail,
      degreeName: ref.degreeName,
      department: ref.department,
      graduationYear: ref.graduationYear,
    },
    expectedBlocked: true,
  });
}

// Category P4: Cross-Batch Duplicate Uploads (15 pairs)
for (let i = 0; i < 15; i++) {
  const ref = canonicalRegistry[i];
  positiveEvaluationPairs.push({
    id: `POS_CROSS_BATCH_${i + 1}`,
    description: `Cross-batch re-upload of ${ref.studentName} from subsequent CSV`,
    category: 'CROSS_BATCH_DUPLICATE',
    record: {
      credentialId: `VDX-BATCH2-${i + 1}`,
      studentName: ref.studentName,
      studentEnrollmentId: ref.studentEnrollmentId,
      studentEmail: ref.studentEmail,
      degreeName: 'B.Tech', // Normalized alias
      department: ref.department.replace('Department of ', ''),
      graduationYear: ref.graduationYear,
    },
    expectedBlocked: true,
  });
}

// Category P5: Identical Parchment PDF Attachments (15 pairs)
for (let i = 0; i < 15; i++) {
  const ref = canonicalRegistry[i];
  positiveEvaluationPairs.push({
    id: `POS_IDENTICAL_DOC_${i + 1}`,
    description: `Identical parchment hash collision with ${ref.studentName}`,
    category: 'IDENTICAL_DOCUMENT_ATTACHMENT',
    record: {
      credentialId: `VDX-DOC-DUP-${i + 1}`,
      studentName: `Candidate ${i + 100}`,
      studentEnrollmentId: `2021XX99${String(i).padStart(2, '0')}`,
      studentEmail: `cand${i}@iitd.ac.in`,
      degreeName: 'Bachelor of Technology',
      department: 'Department of Electrical Engineering',
      graduationYear: 2025,
      documentHash: ref.documentHash, // Matches ref!
    },
    expectedBlocked: true,
  });
}

// Category P6: Certificate ID Collisions (10 pairs)
for (let i = 0; i < 10; i++) {
  const ref = canonicalRegistry[i];
  positiveEvaluationPairs.push({
    id: `POS_CERT_COLLISION_${i + 1}`,
    description: `Certificate ID ${ref.credentialId} claimed by different student`,
    category: 'CERTIFICATE_ID_COLLISION',
    record: {
      credentialId: ref.credentialId, // Collision!
      studentName: `Different Student ${i}`,
      studentEnrollmentId: `2022ZZ99${String(i).padStart(2, '0')}`,
      studentEmail: `diff${i}@yahoo.com`,
      degreeName: 'Bachelor of Technology',
      department: 'Department of Mechanical Engineering',
      graduationYear: 2026,
    },
    expectedBlocked: true,
  });
}

// Category P7: Passing Year & Department Conflicts (10 pairs)
for (let i = 0; i < 5; i++) {
  const ref = canonicalRegistry[i];
  positiveEvaluationPairs.push({
    id: `POS_YEAR_CONFLICT_${i + 1}`,
    description: `Passing year conflict for ${ref.studentName} (Submitted: ${ref.graduationYear + 1} vs DB: ${ref.graduationYear})`,
    category: 'YEAR_DISCREPANCY',
    record: {
      studentName: ref.studentName,
      studentEnrollmentId: ref.studentEnrollmentId,
      studentEmail: ref.studentEmail,
      degreeName: ref.degreeName,
      department: ref.department,
      graduationYear: ref.graduationYear + 1, // Year discrepancy!
    },
    expectedBlocked: true,
  });
}
for (let i = 0; i < 5; i++) {
  const ref = canonicalRegistry[i + 5];
  positiveEvaluationPairs.push({
    id: `POS_DEPT_CONFLICT_${i + 1}`,
    description: `Department mismatch for ${ref.studentName} (Submitted: Civil vs DB: CSE)`,
    category: 'DEPARTMENT_MISMATCH',
    record: {
      studentName: ref.studentName,
      studentEnrollmentId: ref.studentEnrollmentId,
      studentEmail: ref.studentEmail,
      degreeName: ref.degreeName,
      department: 'Department of Civil Engineering', // Mismatch!
      graduationYear: ref.graduationYear,
    },
    expectedBlocked: true,
  });
}

// =============================================================================
// GENERATE 110 DIFFICULT NEGATIVE PAIRS (GROUND TRUTH = APPROVED / CLEAN)
// =============================================================================
const negativeEvaluationPairs = [];

// Category N1: Distinct Students with Identical Names in Different Departments / Years (30 pairs)
for (let i = 0; i < 30; i++) {
  const commonName = ['Rahul Sharma', 'Pooja Gupta', 'Amit Verma', 'Sneha Patel', 'Aarav Kumar'][i % 5];
  const yr = 2023 + (i % 4);
  const dept = departments[(i + 1) % departments.length];
  negativeEvaluationPairs.push({
    id: `NEG_COMMON_NAME_${i + 1}`,
    description: `Common Name "${commonName}" with unique enrollment ${2021 + i} in ${dept}`,
    category: 'COMMON_NAME_DISTINCT_STUDENT',
    record: {
      credentialId: `VDX-DISTINCT-COMMON-${i + 1}`,
      studentName: commonName,
      studentEnrollmentId: `2021${dept.slice(14, 16).toUpperCase()}90${String(i).padStart(2, '0')}`,
      studentEmail: `${commonName.toLowerCase().replace(' ', '.')}${i}@iitd.ac.in`,
      degreeName: 'Bachelor of Technology',
      department: dept,
      graduationYear: yr,
      documentHash: `0x222200000000000000000000000000000000000000000000000000000000${String(i + 100).padStart(4, '0')}`,
    },
    expectedBlocked: false,
  });
}

// Category N2: Distinct Students in Same Cohort with Sequential Enrollments (25 pairs)
const cohortFirstNames = ['Tushar', 'Arjun', 'Kabir', 'Rishi', 'Mayank', 'Harsh', 'Anand', 'Samar'];
const cohortLastNames = ['Kapoor', 'Choudhury', 'Pandey', 'Rawat', 'Aggarwal', 'Sen', 'Dutta', 'Bansal'];
for (let i = 0; i < 25; i++) {
  const fName = cohortFirstNames[(i + 3) % cohortFirstNames.length];
  const lName = cohortLastNames[(i + 4) % cohortLastNames.length];
  negativeEvaluationPairs.push({
    id: `NEG_COHORT_PEER_${i + 1}`,
    description: `Cohort Peer ${fName} ${lName} with distinct enrollment`,
    category: 'DISTINCT_COHORT_STUDENT',
    record: {
      credentialId: `VDX-PEER-${i + 1}`,
      studentName: `${fName} ${lName}`,
      studentEnrollmentId: `2020CS109${String(i + 50).padStart(2, '0')}`,
      studentEmail: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@iitd.ac.in`,
      degreeName: 'Bachelor of Technology',
      department: 'Department of Computer Science and Engineering',
      graduationYear: 2024,
      documentHash: `0x333300000000000000000000000000000000000000000000000000000000${String(i + 200).padStart(4, '0')}`,
    },
    expectedBlocked: false,
  });
}

// Category N3: Legitimate Dual Degrees for Confirmed Students (20 pairs)
const dualDegreeOptions = [
  'Master of Technology in Computer Science',
  'Master of Business Administration',
  'Doctor of Philosophy in Electrical Engineering',
  'Master of Science in Mathematics',
];
for (let i = 0; i < 20; i++) {
  const ref = canonicalRegistry[i % canonicalRegistry.length];
  const dualDegree = dualDegreeOptions[i % dualDegreeOptions.length];
  negativeEvaluationPairs.push({
    id: `NEG_DUAL_DEGREE_${i + 1}`,
    description: `Legitimate Second Degree (${dualDegree}) for confirmed student ${ref.studentName}`,
    category: 'LEGITIMATE_DUAL_DEGREE',
    record: {
      credentialId: `VDX-DUAL-${i + 1}`,
      studentName: ref.studentName,
      studentEnrollmentId: ref.studentEnrollmentId,
      studentEmail: ref.studentEmail,
      degreeName: dualDegree, // Valid separate award!
      department: ref.department,
      graduationYear: ref.graduationYear + 2,
      documentHash: `0x444400000000000000000000000000000000000000000000000000000000${String(i + 300).padStart(4, '0')}`,
    },
    expectedBlocked: false,
  });
}

// Category N4: Distinct Candidates with Identical Filename but Different Hashes (15 pairs)
for (let i = 0; i < 15; i++) {
  negativeEvaluationPairs.push({
    id: `NEG_DISTINCT_FILE_${i + 1}`,
    description: `Candidate with distinct document SHA-256 binary hash`,
    category: 'DISTINCT_DOCUMENT_HASH',
    record: {
      credentialId: `VDX-FILE-OK-${i + 1}`,
      studentName: `Valid Graduate ${i + 1}`,
      studentEnrollmentId: `2021ME108${String(i).padStart(2, '0')}`,
      studentEmail: `grad${i}@iitd.ac.in`,
      degreeName: 'Bachelor of Technology',
      department: 'Department of Mechanical Engineering',
      graduationYear: 2025,
      documentHash: `0x555500000000000000000000000000000000000000000000000000000000${String(i + 400).padStart(4, '0')}`,
    },
    expectedBlocked: false,
  });
}

// Category N5: Siblings / Twins Sharing Surname and Passing Year (10 pairs)
for (let i = 0; i < 10; i++) {
  const surname = cohortLastNames[i % cohortLastNames.length];
  negativeEvaluationPairs.push({
    id: `NEG_SIBLING_${i + 1}`,
    description: `Sibling "Rohan ${surname}" distinct from "Rohit ${surname}"`,
    category: 'SIBLING_DISTINCT_STUDENT',
    record: {
      credentialId: `VDX-SIBLING-${i + 1}`,
      studentName: `Rohan ${surname}`,
      studentEnrollmentId: `2020EE107${String(i).padStart(2, '0')}`,
      studentEmail: `rohan.${surname.toLowerCase()}${i}@iitd.ac.in`,
      degreeName: 'Bachelor of Technology',
      department: 'Department of Electrical Engineering',
      graduationYear: 2024,
      documentHash: `0x666600000000000000000000000000000000000000000000000000000000${String(i + 500).padStart(4, '0')}`,
    },
    expectedBlocked: false,
  });
}

// Category N6: Post-Graduate & Diploma Advancements (10 pairs)
for (let i = 0; i < 10; i++) {
  negativeEvaluationPairs.push({
    id: `NEG_POSTGRAD_${i + 1}`,
    description: `Postgraduate scholar enrollment with unique degree`,
    category: 'POSTGRAD_ADVANCEMENT',
    record: {
      credentialId: `VDX-PG-${i + 1}`,
      studentName: `Scholar ${i + 1} Kumar`,
      studentEnrollmentId: `2023PHD10${String(i).padStart(2, '0')}`,
      studentEmail: `scholar${i}@iitd.ac.in`,
      degreeName: 'Doctor of Philosophy',
      department: 'Department of Computer Science and Engineering',
      graduationYear: 2027,
      documentHash: `0x777700000000000000000000000000000000000000000000000000000000${String(i + 600).padStart(4, '0')}`,
    },
    expectedBlocked: false,
  });
}

// =============================================================================
// RUN EVALUATION OVER THE 220 LABELLED BENCHMARK PAIRS
// =============================================================================
let TP = 0;
let TN = 0;
let FP = 0;
let FN = 0;

const failures = [];

// Evaluate 110 Positive Pairs (Ground Truth = True)
positiveEvaluationPairs.forEach((pair) => {
  const result = DeduplicationEngine.analyzeRecord(pair.record, canonicalRegistry);
  const isBlocked = result.isBlockedFromBlockchain;
  if (isBlocked) {
    TP++;
  } else {
    FN++;
    failures.push({ pair, actual: result });
  }
});

// Evaluate 110 Negative Pairs (Ground Truth = False)
negativeEvaluationPairs.forEach((pair) => {
  const result = DeduplicationEngine.analyzeRecord(pair.record, canonicalRegistry);
  const isBlocked = result.isBlockedFromBlockchain;
  if (!isBlocked) {
    TN++;
  } else {
    FP++;
    failures.push({ pair, actual: result });
  }
});

const totalPairs = positiveEvaluationPairs.length + negativeEvaluationPairs.length;
const precision = TP / (TP + FP) || 0;
const recall = TP / (TP + FN) || 0;
const specificity = TN / (TN + FP) || 0;
const f1Score = (2 * precision * recall) / (precision + recall) || 0;
const accuracy = (TP + TN) / totalPairs;

console.log(`${BOLD}Dataset Architecture Summary:${RESET}`);
console.log(`  Institutional Baseline Registry Size : ${BOLD}25 canonical students${RESET}`);
console.log(`  Positive Evaluation Pairs (P)       : ${BOLD}${positiveEvaluationPairs.length} pairs${RESET} (Exact dupes, typos, formatting, cross-batch, hash collisions)`);
console.log(`  Difficult Negative Pairs (N)         : ${BOLD}${negativeEvaluationPairs.length} pairs${RESET} (Common names, cohorts, dual degrees, distinct hashes, siblings)`);
console.log(`  Total Evaluated Benchmark Pairs     : ${BOLD}${totalPairs} pairs${RESET}\n`);

console.log(`${BOLD}Confusion Matrix Results:${RESET}`);
console.log(`  True Positives  (TP) : ${BOLD}${GREEN}${TP}${RESET} / ${positiveEvaluationPairs.length} (Duplicates & anomalies correctly caught)`);
console.log(`  True Negatives  (TN) : ${BOLD}${GREEN}${TN}${RESET} / ${negativeEvaluationPairs.length} (Clean records & dual degrees correctly approved)`);
console.log(`  False Positives (FP) : ${BOLD}${FP === 0 ? GREEN : RED}${FP}${RESET} / ${negativeEvaluationPairs.length} (Legitimate records erroneously blocked)`);
console.log(`  False Negatives (FN) : ${BOLD}${FN === 0 ? GREEN : RED}${FN}${RESET} / ${positiveEvaluationPairs.length} (Duplicates erroneously allowed through)\n`);

console.log(`${BOLD}Statistical Performance Metrics:${RESET}`);
console.log(`  Precision   : ${BOLD}${GREEN}${(precision * 100).toFixed(2)}%${RESET}`);
console.log(`  Recall      : ${BOLD}${GREEN}${(recall * 100).toFixed(2)}%${RESET}`);
console.log(`  Specificity : ${BOLD}${GREEN}${(specificity * 100).toFixed(2)}%${RESET}`);
console.log(`  F1 Score    : ${BOLD}${GREEN}${(f1Score * 100).toFixed(2)}%${RESET}`);
console.log(`  Accuracy    : ${BOLD}${GREEN}${(accuracy * 100).toFixed(2)}%${RESET}\n`);

if (failures.length > 0) {
  console.log(`${RED}Failures Detected (${failures.length}):${RESET}`);
  failures.slice(0, 5).forEach((f) => {
    console.log(`- Pair ${f.pair.id} [${f.pair.category}]: Expected Blocked=${f.pair.expectedBlocked}, Actual Blocked=${f.actual.isBlockedFromBlockchain} (${f.actual.awardClassification}) Reason: ${f.actual.detectionReason}`);
  });
  console.log('');
  process.exit(1);
} else {
  console.log(`${BOLD}${GREEN}✔ BENCHMARK COMPLETE: 220/220 PAIRS EVALUATED WITH ZERO FALSE POSITIVES AND ZERO FALSE NEGATIVES.${RESET}\n`);
}
