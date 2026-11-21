export type UserRole = 'university' | 'student' | 'recruiter';

export type CredentialStatus = 'Active' | 'Revoked' | 'Pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  institutionId?: string;
  studentId?: string;
  organizationId?: string;
}

export interface University {
  id: string;
  name: string;
  code: string;
  officialEmail: string;
  website: string;
  country: string;
  state: string;
  logo: string;
  accreditationStatus: string;
  authorizedSignatory: string;
  signatoryDesignation: string;
  establishedYear: number;
}

export interface Credential {
  id: string; // e.g. VDX-2024-IITD-0891
  studentName: string;
  studentEmail: string;
  studentEnrollmentId: string;
  degreeName: string;
  degreeType: 'Bachelor' | 'Master' | 'Doctorate' | 'Diploma';
  department: string;
  universityId: string;
  universityName: string;
  universityLogo?: string;
  graduationYear: number;
  issueDate: string; // YYYY-MM-DD
  cgpaOrGrade: string; // e.g. "9.4 / 10.0" or "First Class with Distinction"
  status: CredentialStatus;
  documentHash?: string; // cryptographic representation (mock SHA-256 for display)
  merkleRoot?: string;
  blockNumber?: number; // mock future ledger ref
  isSimulated?: boolean;
  issuanceMode?: 'LIVE_BLOCKCHAIN' | 'DEMO_SIMULATED';
  blockchainTxHash?: string;
  revocationDetails?: {
    revokedAt: string;
    revokedBy: string;
    reason: string;
    notes?: string;
  };
  metadata?: {
    specialization?: string;
    honors?: string;
    creditsCompleted?: number;
    blockchainTxHash?: string;
  };
}

export interface VerificationRecord {
  id: string;
  credentialId: string;
  studentName: string;
  degreeName: string;
  universityName: string;
  verifierOrganization: string;
  verifierName: string;
  verifierEmail: string;
  timestamp: string;
  result: 'VERIFIED' | 'REVOKED' | 'NOT_FOUND';
  verificationMethod: 'MANUAL_ID' | 'QR_SCAN';
  ipLocation?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  enrollmentId: string;
  department: string;
  universityName: string;
  degreesCount: number;
  status: 'Active' | 'Graduated' | 'Alumni';
  credentials: string[]; // Credential IDs
}

export interface RecruiterOrg {
  id: string;
  name: string;
  recruiterName: string;
  email: string;
  website: string;
  industry: string;
  verificationVolume: number;
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  studentEnrollmentId: string;
  degreeName: string;
  normalizedDegreeName: string;
  department: string;
  specialization?: string;
  passingYear: number;
  academicStatus: 'Active' | 'Completed' | 'Suspended';
  universityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadBatch {
  id: string;
  universityId: string;
  filename: string;
  totalRecords: number;
  processedRecords: number;
  validRecords: number;
  duplicateRecords: number;
  conflictingRecords: number;
  batchStatus: 'PENDING' | 'PROCESSING' | 'VALIDATED' | 'REVIEW_REQUIRED' | 'COMPLETED' | 'FAILED';
  uploadTimestamp: string;
  uploadedBy: string;
  rawRecords?: any[];
  validationReport?: {
    validCount: number;
    duplicateCount: number;
    conflictCount: number;
    errorRows: Array<{ rowNumber: number; reason: string; rowData: any }>;
  };
}

export type DuplicateMatchType =
  | 'EXACT_DUPLICATE'
  | 'POSSIBLE_SAME_STUDENT'
  | 'IDENTITY_CONFLICT'
  | 'DUPLICATE_DEGREE'
  | 'DUPLICATE_CERTIFICATE_ID'
  | 'DUPLICATE_DOCUMENT_HASH'
  | 'ON_CHAIN_ALREADY_ISSUED';

export type DuplicateReviewStatus =
  | 'PENDING'
  | 'RESOLVED_MERGED'
  | 'RESOLVED_SEPARATE'
  | 'REJECTED'
  | 'RESOLVED_CORRECTION';

export interface DuplicateGroup {
  id: string;
  universityId: string;
  batchId?: string;
  canonicalRecordId?: string;
  incomingRecord: any;
  matchedRecord: any;
  matchType: DuplicateMatchType;
  confidenceScore: number; // 0.0 to 1.0
  detectionReason: string;
  aiExplanation?: string;
  reviewStatus: DuplicateReviewStatus;
  fieldDiffs: Array<{
    field: string;
    incomingValue: any;
    existingValue: any;
    isMatch: boolean;
    similarityScore?: number;
    significance: 'CRITICAL' | 'IMPORTANT' | 'INFORMATIONAL';
  }>;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  batchId?: string;
  recordId?: string;
  action:
    | 'BATCH_UPLOADED'
    | 'DUPLICATE_FLAGGED'
    | 'SAME_STUDENT_CONFIRMED'
    | 'KEPT_AS_SEPARATE'
    | 'RECORD_MERGED'
    | 'MARKED_AS_CONFLICT'
    | 'APPROVED_FOR_BLOCKCHAIN'
    | 'REJECTED_INVALID'
    | 'STATUS_CHANGED';
  previousValue?: any;
  newValue?: any;
  decisionReason?: string;
  performedBy: string;
  timestamp: string;
}

export interface IntelligenceSummary {
  totalRecords: number;
  totalStudents: number;
  totalAcademicRecords: number;
  totalCredentials: number;
  uniqueRecords: number;
  exactDuplicates: number;
  possibleDuplicates: number;
  conflictingRecords: number;
  invalidRecords: number;
  pendingReviews: number;
  readyForIssuance: number;
}


