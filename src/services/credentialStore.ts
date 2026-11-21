import {
  Credential,
  University,
  StudentRecord,
  VerificationRecord,
  RecruiterOrg,
  UserRole,
  AcademicRecord,
  UploadBatch,
  DuplicateGroup,
  AuditLogEntry,
  IntelligenceSummary,
  DuplicateMatchType,
  DuplicateReviewStatus,
} from '../types';
import {
  INITIAL_CREDENTIALS,
  INITIAL_UNIVERSITIES,
  INITIAL_STUDENTS,
  INITIAL_VERIFICATIONS,
  INITIAL_RECRUITER_ORG,
} from '../data/mockData';
import { DeduplicationEngine, AcademicRecordInput, DuplicateAnalysisResult } from '../utils/intelligence/deduplicationEngine';
import { NormalizationService } from '../utils/intelligence/normalizationService';

const STORAGE_KEYS = {
  CREDENTIALS: 'vdx_credentials_v1',
  UNIVERSITIES: 'vdx_universities_v1',
  STUDENTS: 'vdx_students_v1',
  VERIFICATIONS: 'vdx_verifications_v1',
  RECRUITER_ORG: 'vdx_recruiter_org_v1',
  CURRENT_ROLE: 'vdx_current_role_v1',
  CURRENT_USER_EMAIL: 'vdx_current_user_email_v1',
  ACADEMIC_RECORDS: 'vdx_academic_records_v1',
  UPLOAD_BATCHES: 'vdx_upload_batches_v1',
  DUPLICATE_GROUPS: 'vdx_duplicate_groups_v1',
  AUDIT_LOGS: 'vdx_audit_logs_v1',
};

const INITIAL_DUPLICATE_GROUPS: DuplicateGroup[] = [
  {
    id: 'dup_grp_001',
    universityId: 'univ_iitd',
    batchId: 'batch_2024_06_roster',
    canonicalRecordId: 'VDX-2024-IITD-0891',
    incomingRecord: {
      studentName: 'Aarav Sharma',
      studentEnrollmentId: '2020CS10891',
      studentEmail: 'aarav.sharma@alumni.iitd.ac.in',
      degreeName: 'B.Tech in Computer Science',
      department: 'Computer Science & Engg',
      graduationYear: 2024,
      credentialId: 'VDX-2024-IITD-0891',
      cgpaOrGrade: '9.42 / 10.0',
    },
    matchedRecord: {
      studentName: 'Aarav Sharma',
      studentEnrollmentId: '2020CS10891',
      studentEmail: 'aarav.sharma@alumni.iitd.ac.in',
      degreeName: 'Bachelor of Technology in Computer Science & Engineering',
      department: 'Department of Computer Science and Engineering',
      graduationYear: 2024,
      credentialId: 'VDX-2024-IITD-0891',
      cgpaOrGrade: '9.42 / 10.0',
      blockchainTxHash: '0xbb763a062f11117aa277d4c128e0b8333b90c2df86b0da089de535d53d60a1c0',
    },
    matchType: 'EXACT_DUPLICATE',
    confidenceScore: 1.0,
    detectionReason: 'Exact duplicate credential ID VDX-2024-IITD-0891 already anchored on Ethereum Sepolia ledger.',
    aiExplanation: 'BLOCKCHAIN DUPLICATE GATE: Record VDX-2024-IITD-0891 is already confirmed in Sepolia block #12183381. Re-submitting this record would cause EVM revert and wasted gas. Recommendation: Link incoming duplicate to canonical record.',
    reviewStatus: 'PENDING',
    fieldDiffs: [
      { field: 'Student Full Name', incomingValue: 'Aarav Sharma', existingValue: 'Aarav Sharma', isMatch: true, similarityScore: 1.0, significance: 'CRITICAL' },
      { field: 'Enrollment Number', incomingValue: '2020CS10891', existingValue: '2020CS10891', isMatch: true, significance: 'CRITICAL' },
      { field: 'Degree Program', incomingValue: 'B.Tech in Computer Science', existingValue: 'Bachelor of Technology in Computer Science & Engineering', isMatch: true, significance: 'CRITICAL' },
      { field: 'Graduation Year', incomingValue: 2024, existingValue: 2024, isMatch: true, significance: 'IMPORTANT' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dup_grp_002',
    universityId: 'univ_iitd',
    batchId: 'batch_2024_06_roster',
    canonicalRecordId: 'VDX-2020-IITD-0451',
    incomingRecord: {
      studentName: 'Pooja Mehta',
      studentEnrollmentId: '2020EE10451',
      studentEmail: 'pooja.m@alumni.iitd.ac.in',
      degreeName: 'B.Tech in Electrical Engineering',
      department: 'Electrical Engineering',
      graduationYear: 2024,
      credentialId: 'VDX-2024-IITD-8822',
      cgpaOrGrade: '9.10 / 10.0',
    },
    matchedRecord: {
      studentName: 'Tarun Aggarwal',
      studentEnrollmentId: '2020EE10451',
      studentEmail: 'tarun.a@alumni.iitd.ac.in',
      degreeName: 'B.Tech in Electrical Engineering',
      department: 'Department of Electrical Engineering',
      graduationYear: 2024,
      credentialId: 'VDX-2020-IITD-0451',
      cgpaOrGrade: '9.15 / 10.0',
    },
    matchType: 'IDENTITY_CONFLICT',
    confidenceScore: 0.96,
    detectionReason: 'Enrollment Number 2020EE10451 is already registered to "Tarun Aggarwal", but incoming record lists "Pooja Mehta".',
    aiExplanation: 'CRITICAL IDENTITY CONFLICT: The institutional enrollment number 2020EE10451 was assigned to Tarun Aggarwal in 2020. The incoming row assigns the exact same number to Pooja Mehta (Name similarity 21.4%). Recommendation: Reject issuance and request physical enrollment ledger verification.',
    reviewStatus: 'PENDING',
    fieldDiffs: [
      { field: 'Student Full Name', incomingValue: 'Pooja Mehta', existingValue: 'Tarun Aggarwal', isMatch: false, similarityScore: 0.214, significance: 'CRITICAL' },
      { field: 'Enrollment Number', incomingValue: '2020EE10451', existingValue: '2020EE10451', isMatch: true, significance: 'CRITICAL' },
      { field: 'Institutional Email', incomingValue: 'pooja.m@alumni.iitd.ac.in', existingValue: 'tarun.a@alumni.iitd.ac.in', isMatch: false, significance: 'IMPORTANT' },
      { field: 'Department', incomingValue: 'Electrical Engineering', existingValue: 'Department of Electrical Engineering', isMatch: true, significance: 'IMPORTANT' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dup_grp_003',
    universityId: 'univ_iitd',
    batchId: 'batch_2024_06_roster',
    canonicalRecordId: 'VDX-2024-IITD-8821',
    incomingRecord: {
      studentName: 'Aditi S Deshmukh',
      studentEnrollmentId: '2020CS10912-A',
      studentEmail: 'aditi.deshmukh@alumni.iitd.ac.in',
      degreeName: 'B.Tech in Computer Science',
      department: 'Computer Science & Engg',
      graduationYear: 2024,
      credentialId: 'VDX-2024-IITD-8899',
      cgpaOrGrade: '9.52 / 10.0',
    },
    matchedRecord: {
      studentName: 'Aditi Deshmukh',
      studentEnrollmentId: '2020CS10912',
      studentEmail: 'aditi.d@alumni.iitd.ac.in',
      degreeName: 'B.Tech in Computer Science',
      department: 'Department of Computer Science and Engineering',
      graduationYear: 2024,
      credentialId: 'VDX-2024-IITD-8821',
      cgpaOrGrade: '9.52 / 10.0',
    },
    matchType: 'POSSIBLE_SAME_STUDENT',
    confidenceScore: 0.942,
    detectionReason: 'Name "Aditi S Deshmukh" has 94.2% fuzzy similarity to existing student "Aditi Deshmukh" in same department & graduation year.',
    aiExplanation: 'POSSIBLE SAME STUDENT: Middle initial "S" was added to existing student Aditi Deshmukh in Department of Computer Science. Enrollment numbers share canonical root (2020CS10912 vs 2020CS10912-A). Recommendation: Registrar review required to confirm single identity.',
    reviewStatus: 'PENDING',
    fieldDiffs: [
      { field: 'Student Full Name', incomingValue: 'Aditi S Deshmukh', existingValue: 'Aditi Deshmukh', isMatch: false, similarityScore: 0.942, significance: 'CRITICAL' },
      { field: 'Enrollment Number', incomingValue: '2020CS10912-A', existingValue: '2020CS10912', isMatch: false, significance: 'CRITICAL' },
      { field: 'Department', incomingValue: 'Computer Science & Engg', existingValue: 'Department of Computer Science and Engineering', isMatch: true, significance: 'IMPORTANT' },
      { field: 'Graduation Year', incomingValue: 2024, existingValue: 2024, isMatch: true, significance: 'IMPORTANT' },
    ],
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_UPLOAD_BATCHES: UploadBatch[] = [
  {
    id: 'batch_2024_06_roster',
    universityId: 'univ_iitd',
    filename: 'IITD_CSE_2024_Graduation_Final.xlsx',
    totalRecords: 120,
    processedRecords: 120,
    validRecords: 114,
    duplicateRecords: 4,
    conflictingRecords: 2,
    batchStatus: 'REVIEW_REQUIRED',
    uploadTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    uploadedBy: 'registrar.office@iitd.ac.in',
    validationReport: {
      validCount: 114,
      duplicateCount: 4,
      conflictCount: 2,
      errorRows: [
        { rowNumber: 14, reason: 'Exact duplicate credential ID VDX-2024-IITD-0891 on-chain', rowData: { id: 'VDX-2024-IITD-0891' } },
        { rowNumber: 42, reason: 'Enrollment number 2020EE10451 already assigned to Tarun Aggarwal', rowData: { id: 'VDX-2024-IITD-8822' } },
      ],
    },
  },
  {
    id: 'batch_2024_05_mech',
    universityId: 'univ_iitd',
    filename: 'IITD_MECH_2024_Batch.csv',
    totalRecords: 85,
    processedRecords: 85,
    validRecords: 85,
    duplicateRecords: 0,
    conflictingRecords: 0,
    batchStatus: 'COMPLETED',
    uploadTimestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    uploadedBy: 'registrar.office@iitd.ac.in',
    validationReport: {
      validCount: 85,
      duplicateCount: 0,
      conflictCount: 0,
      errorRows: [],
    },
  },
];

class CredentialStore {
  private credentials: Credential[] = [];
  private universities: University[] = [];
  private students: StudentRecord[] = [];
  private verifications: VerificationRecord[] = [];
  private recruiterOrg: RecruiterOrg = INITIAL_RECRUITER_ORG;
  private currentRole: UserRole = 'university';
  private currentUserEmail: string = 'registrar.office@iitd.ac.in';
  private uploadBatches: UploadBatch[] = [];
  private duplicateGroups: DuplicateGroup[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedCreds = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      this.credentials = storedCreds ? JSON.parse(storedCreds) : [...INITIAL_CREDENTIALS];

      const storedUnivs = localStorage.getItem(STORAGE_KEYS.UNIVERSITIES);
      this.universities = storedUnivs ? JSON.parse(storedUnivs) : [...INITIAL_UNIVERSITIES];

      const storedStuds = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      this.students = storedStuds ? JSON.parse(storedStuds) : [...INITIAL_STUDENTS];

      const storedVerifs = localStorage.getItem(STORAGE_KEYS.VERIFICATIONS);
      this.verifications = storedVerifs ? JSON.parse(storedVerifs) : [...INITIAL_VERIFICATIONS];

      const storedOrg = localStorage.getItem(STORAGE_KEYS.RECRUITER_ORG);
      this.recruiterOrg = storedOrg ? JSON.parse(storedOrg) : INITIAL_RECRUITER_ORG;

      const storedBatches = localStorage.getItem(STORAGE_KEYS.UPLOAD_BATCHES);
      this.uploadBatches = storedBatches ? JSON.parse(storedBatches) : [...INITIAL_UPLOAD_BATCHES];

      const storedDups = localStorage.getItem(STORAGE_KEYS.DUPLICATE_GROUPS);
      this.duplicateGroups = storedDups ? JSON.parse(storedDups) : [...INITIAL_DUPLICATE_GROUPS];

      const storedAudits = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedAudits ? JSON.parse(storedAudits) : [];

      const storedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) as UserRole | null;
      if (storedRole) this.currentRole = storedRole;

      const storedEmail = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
      if (storedEmail) this.currentUserEmail = storedEmail;
    } catch (e) {
      console.warn('Could not load from localStorage, using initial mock data', e);
      this.credentials = [...INITIAL_CREDENTIALS];
      this.universities = [...INITIAL_UNIVERSITIES];
      this.students = [...INITIAL_STUDENTS];
      this.verifications = [...INITIAL_VERIFICATIONS];
      this.recruiterOrg = INITIAL_RECRUITER_ORG;
      this.uploadBatches = [...INITIAL_UPLOAD_BATCHES];
      this.duplicateGroups = [...INITIAL_DUPLICATE_GROUPS];
      this.auditLogs = [];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(this.credentials));
      localStorage.setItem(STORAGE_KEYS.UNIVERSITIES, JSON.stringify(this.universities));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students));
      localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(this.verifications));
      localStorage.setItem(STORAGE_KEYS.RECRUITER_ORG, JSON.stringify(this.recruiterOrg));
      localStorage.setItem(STORAGE_KEYS.UPLOAD_BATCHES, JSON.stringify(this.uploadBatches));
      localStorage.setItem(STORAGE_KEYS.DUPLICATE_GROUPS, JSON.stringify(this.duplicateGroups));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, this.currentRole);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, this.currentUserEmail);
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- Role & Session Management ---
  public getCurrentRole(): UserRole {
    return this.currentRole;
  }

  public setRole(role: UserRole) {
    this.currentRole = role;
    if (role === 'university') {
      this.currentUserEmail = 'registrar.office@iitd.ac.in';
    } else if (role === 'student') {
      this.currentUserEmail = 'aarav.sharma@alumni.iitd.ac.in';
    } else if (role === 'recruiter') {
      this.currentUserEmail = 'ksinghania@google.com';
    }
    this.persist();
  }

  public getCurrentUserEmail(): string {
    return this.currentUserEmail;
  }

  public setCurrentUserEmail(email: string) {
    this.currentUserEmail = email;
    this.persist();
  }

  // --- Credentials API ---
  public getCredentials(): Credential[] {
    return [...this.credentials];
  }

  public getCredentialById(id: string): Credential | undefined {
    return this.credentials.find(
      (c) => c.id.toLowerCase().trim() === id.toLowerCase().trim()
    );
  }

  public getCredentialsByUniversity(univId: string): Credential[] {
    return this.credentials.filter((c) => c.universityId === univId);
  }

  public getCredentialsByStudentEmail(email: string): Credential[] {
    return this.credentials.filter(
      (c) => c.studentEmail.toLowerCase() === email.toLowerCase()
    );
  }

  public issueCredential(newCred: Omit<Credential, 'documentHash' | 'merkleRoot' | 'blockNumber' | 'status'> & {
    status?: Credential['status'];
    documentHash?: string;
    merkleRoot?: string;
    blockNumber?: number;
  }): Credential {
    const credential: Credential = {
      ...newCred,
      status: newCred.status || 'Active',
      documentHash: newCred.documentHash || '',
      merkleRoot: newCred.merkleRoot || '',
      blockNumber: newCred.blockNumber,
    };

    // Add or update student record
    const existingStudent = this.students.find(
      (s) => s.email.toLowerCase() === newCred.studentEmail.toLowerCase()
    );

    if (existingStudent) {
      if (!existingStudent.credentials.includes(credential.id)) {
        existingStudent.credentials.push(credential.id);
        existingStudent.degreesCount = existingStudent.credentials.length;
      }
    } else {
      this.students.unshift({
        id: `stud_${Date.now()}`,
        name: credential.studentName,
        email: credential.studentEmail,
        enrollmentId: credential.studentEnrollmentId,
        department: credential.department,
        universityName: credential.universityName,
        degreesCount: 1,
        status: 'Graduated',
        credentials: [credential.id],
      });
    }

    this.credentials.unshift(credential);

    // Audit log
    this.addAuditLog({
      recordId: credential.id,
      action: 'APPROVED_FOR_BLOCKCHAIN',
      newValue: { id: credential.id, studentName: credential.studentName },
      decisionReason: 'Credential anchored to blockchain ledger.',
      performedBy: this.currentUserEmail,
    });

    this.persist();
    return credential;
  }

  public bulkIssueCredentials(
    records: Array<{
      studentName: string;
      studentEmail: string;
      studentEnrollmentId: string;
      degreeName: string;
      department: string;
      universityId: string;
      universityName: string;
      graduationYear: number;
      issueDate: string;
      cgpaOrGrade: string;
      credentialId: string;
      documentHash?: string;
      merkleRoot?: string;
      blockNumber?: number;
    }>
  ): { issuedCount: number; credentials: Credential[] } {
    const issued: Credential[] = [];
    for (const r of records) {
      const cred = this.issueCredential({
        id: r.credentialId,
        studentName: r.studentName,
        studentEmail: r.studentEmail,
        studentEnrollmentId: r.studentEnrollmentId,
        degreeName: r.degreeName,
        degreeType: r.degreeName.toLowerCase().includes('master') || r.degreeName.toLowerCase().includes('mba') ? 'Master' : 'Bachelor',
        department: r.department,
        universityId: r.universityId,
        universityName: r.universityName,
        graduationYear: r.graduationYear,
        issueDate: r.issueDate,
        cgpaOrGrade: r.cgpaOrGrade,
        documentHash: r.documentHash,
        merkleRoot: r.merkleRoot,
        blockNumber: r.blockNumber,
      });
      issued.push(cred);
    }
    return { issuedCount: issued.length, credentials: issued };
  }

  public revokeCredential(credentialId: string, reason: string, notes?: string): boolean {
    const cred = this.getCredentialById(credentialId);
    if (!cred) return false;

    cred.status = 'Revoked';
    cred.revocationDetails = {
      revokedAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }) + ' IST',
      revokedBy: this.currentUserEmail,
      reason,
      notes,
    };

    this.addAuditLog({
      recordId: credentialId,
      action: 'STATUS_CHANGED',
      previousValue: { status: 'Active' },
      newValue: { status: 'Revoked', reason },
      decisionReason: reason,
      performedBy: this.currentUserEmail,
    });

    this.persist();
    return true;
  }

  // --- Global Deduplication & Academic Intelligence API ---

  public getDuplicateGroups(): DuplicateGroup[] {
    return [...this.duplicateGroups];
  }

  public getDuplicateGroupById(id: string): DuplicateGroup | undefined {
    return this.duplicateGroups.find((g) => g.id === id);
  }

  public getUploadBatches(): UploadBatch[] {
    return [...this.uploadBatches];
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public addAuditLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    this.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log,
    });
    // Keep max 200 audit logs in localStorage
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
  }

  /**
   * Evaluates an uploaded dataset against the global academic database.
   */
  public analyzeBatchRecords(
    filename: string,
    rawRecords: Array<{
      studentName: string;
      studentEnrollmentId: string;
      studentEmail: string;
      degreeName: string;
      department: string;
      graduationYear: number;
      credentialId: string;
      certificateNumber?: string;
      issueDate?: string;
      cgpaOrGrade?: string;
      documentHash?: string;
    }>
  ): {
    batchId: string;
    results: DuplicateAnalysisResult[];
    summary: {
      total: number;
      unique: number;
      exactDuplicates: number;
      possibleDuplicates: number;
      conflicts: number;
    };
  } {
    const batchId = `batch_${Date.now()}`;
    const existingDbInputs: AcademicRecordInput[] = this.credentials.map((c) => ({
      id: c.id,
      credentialId: c.id,
      studentName: c.studentName,
      studentEnrollmentId: c.studentEnrollmentId,
      studentEmail: c.studentEmail,
      degreeName: c.degreeName,
      department: c.department,
      graduationYear: c.graduationYear,
      documentHash: c.documentHash,
      blockchainTxHash: c.metadata?.blockchainTxHash,
      universityId: c.universityId,
    }));

    const results: DuplicateAnalysisResult[] = [];
    const createdDuplicateGroups: DuplicateGroup[] = [];
    const errorRows: Array<{ rowNumber: number; reason: string; rowData: any }> = [];

    let unique = 0;
    let exactDuplicates = 0;
    let possibleDuplicates = 0;
    let conflicts = 0;

    // Track records within current batch to catch intra-batch duplicates as well
    const batchContext = [...existingDbInputs];

    for (let i = 0; i < rawRecords.length; i++) {
      const row = rawRecords[i];
      const analysis = DeduplicationEngine.analyzeRecord(row, batchContext);
      results.push(analysis);

      if (analysis.awardClassification === 'UNIQUE_RECORD' || analysis.awardClassification === 'LEGITIMATE_DUAL_DEGREE') {
        unique++;
        // Add to batch context so subsequent rows in same file are evaluated against it
        batchContext.push({
          id: row.credentialId,
          credentialId: row.credentialId,
          studentName: row.studentName,
          studentEnrollmentId: row.studentEnrollmentId,
          studentEmail: row.studentEmail,
          degreeName: row.degreeName,
          department: row.department,
          graduationYear: row.graduationYear,
          documentHash: row.documentHash,
        });
      } else if (analysis.awardClassification === 'EXACT_DUPLICATE_CREDENTIAL' || analysis.awardClassification === 'ON_CHAIN_ALREADY_ISSUED') {
        exactDuplicates++;
        errorRows.push({ rowNumber: i + 1, reason: analysis.detectionReason, rowData: row });
      } else if (analysis.studentClassification === 'POSSIBLE_SAME_STUDENT') {
        possibleDuplicates++;
        errorRows.push({ rowNumber: i + 1, reason: analysis.detectionReason, rowData: row });
      } else {
        conflicts++;
        errorRows.push({ rowNumber: i + 1, reason: analysis.detectionReason, rowData: row });
      }

      // If duplicate or conflict, generate DuplicateGroup for registrar review
      if (analysis.awardClassification !== 'UNIQUE_RECORD' && analysis.awardClassification !== 'LEGITIMATE_DUAL_DEGREE') {
        const matched = this.credentials.find((c) => c.id === analysis.matchedRecordId) || batchContext.find((c) => c.id === analysis.matchedRecordId);
        
        let matchType: DuplicateMatchType = 'EXACT_DUPLICATE';
        if (analysis.awardClassification === 'ON_CHAIN_ALREADY_ISSUED') matchType = 'ON_CHAIN_ALREADY_ISSUED';
        else if (analysis.studentClassification === 'IDENTITY_CONFLICT') matchType = 'IDENTITY_CONFLICT';
        else if (analysis.studentClassification === 'POSSIBLE_SAME_STUDENT') matchType = 'POSSIBLE_SAME_STUDENT';
        else if (analysis.awardClassification === 'DUPLICATE_DEGREE_AWARD') matchType = 'DUPLICATE_DEGREE';
        else if (analysis.awardClassification === 'DUPLICATE_CERTIFICATE_ID') matchType = 'DUPLICATE_CERTIFICATE_ID';
        else if (analysis.awardClassification === 'DUPLICATE_DOCUMENT_HASH') matchType = 'DUPLICATE_DOCUMENT_HASH';

        const dupGroup: DuplicateGroup = {
          id: `dup_${Date.now()}_${i}`,
          universityId: 'univ_iitd',
          batchId,
          canonicalRecordId: analysis.matchedRecordId,
          incomingRecord: row,
          matchedRecord: matched || {},
          matchType,
          confidenceScore: analysis.confidenceScore,
          detectionReason: analysis.detectionReason,
          aiExplanation: analysis.aiExplanation,
          reviewStatus: 'PENDING',
          fieldDiffs: analysis.fieldDiffs,
          createdAt: new Date().toISOString(),
        };

        createdDuplicateGroups.push(dupGroup);
      }
    }

    // Save Duplicate Groups
    this.duplicateGroups = [...createdDuplicateGroups, ...this.duplicateGroups];

    // Save Upload Batch
    const newBatch: UploadBatch = {
      id: batchId,
      universityId: 'univ_iitd',
      filename,
      totalRecords: rawRecords.length,
      processedRecords: rawRecords.length,
      validRecords: unique,
      duplicateRecords: exactDuplicates,
      conflictingRecords: conflicts + possibleDuplicates,
      batchStatus: createdDuplicateGroups.length > 0 ? 'REVIEW_REQUIRED' : 'VALIDATED',
      uploadTimestamp: new Date().toISOString(),
      uploadedBy: this.currentUserEmail,
      rawRecords,
      validationReport: {
        validCount: unique,
        duplicateCount: exactDuplicates,
        conflictCount: conflicts + possibleDuplicates,
        errorRows,
      },
    };

    this.uploadBatches.unshift(newBatch);

    this.addAuditLog({
      batchId,
      action: 'BATCH_UPLOADED',
      newValue: { filename, totalRecords: rawRecords.length, duplicatesFound: createdDuplicateGroups.length },
      decisionReason: `Processed batch of ${rawRecords.length} records. Identified ${createdDuplicateGroups.length} duplicates/conflicts.`,
      performedBy: this.currentUserEmail,
    });

    this.persist();

    return {
      batchId,
      results,
      summary: {
        total: rawRecords.length,
        unique,
        exactDuplicates,
        possibleDuplicates,
        conflicts,
      },
    };
  }

  /**
   * Resolves a DuplicateGroup through Registrar Review action.
   */
  public resolveDuplicateGroup(
    groupId: string,
    action:
      | 'SAME_STUDENT_CONFIRMED'
      | 'KEPT_AS_SEPARATE'
      | 'RECORD_MERGED'
      | 'MARKED_AS_CONFLICT'
      | 'APPROVED_FOR_BLOCKCHAIN'
      | 'REJECTED_INVALID',
    notes: string,
    performedBy: string = this.currentUserEmail
  ): boolean {
    // RBAC: Enforce registrar role authorization
    if (this.currentRole !== 'university') {
      console.warn('Unauthorized: Only authorized university registrars can resolve academic duplicate groups.');
      return false;
    }

    const group = this.duplicateGroups.find((g) => g.id === groupId);
    if (!group) return false;

    let reviewStatus: DuplicateReviewStatus = 'PENDING';

    if (action === 'SAME_STUDENT_CONFIRMED' || action === 'RECORD_MERGED') {
      reviewStatus = 'RESOLVED_MERGED';
    } else if (action === 'KEPT_AS_SEPARATE') {
      reviewStatus = 'RESOLVED_SEPARATE';
    } else if (action === 'REJECTED_INVALID') {
      reviewStatus = 'REJECTED';
    } else if (action === 'APPROVED_FOR_BLOCKCHAIN') {
      reviewStatus = 'RESOLVED_SEPARATE';
    } else if (action === 'MARKED_AS_CONFLICT') {
      reviewStatus = 'RESOLVED_CORRECTION';
    }

    group.reviewStatus = reviewStatus;
    group.resolvedBy = performedBy;
    group.resolvedAt = new Date().toISOString();
    group.resolutionNotes = notes;

    // Preserve and update record status (never permanently delete)
    const credId = group.incomingRecord?.credentialId;
    if (credId) {
      const existingCred = this.getCredentialById(credId);
      if (existingCred) {
        if (action === 'REJECTED_INVALID') {
          (existingCred as any).status = 'REJECTED';
        } else if (action === 'MARKED_AS_CONFLICT') {
          (existingCred as any).status = 'QUARANTINED';
        } else if (action === 'SAME_STUDENT_CONFIRMED' || action === 'RECORD_MERGED') {
          (existingCred as any).status = 'DUPLICATE_LINKED';
          (existingCred as any).canonicalRecordId = group.canonicalRecordId;
        }
      }
    }

    this.addAuditLog({
      batchId: group.batchId,
      recordId: group.incomingRecord?.credentialId || groupId,
      action,
      previousValue: { reviewStatus: 'PENDING' },
      newValue: { reviewStatus, resolutionNotes: notes },
      decisionReason: notes || `Registrar resolved as ${action}`,
      performedBy,
    });

    this.persist();
    return true;
  }

  /**
   * Computes comprehensive database intelligence KPIs.
   */
  public getIntelligenceSummary(): IntelligenceSummary {
    const totalCredentials = this.credentials.length;
    const totalStudents = this.students.length;
    const exactDuplicates = this.duplicateGroups.filter((g) => g.matchType === 'EXACT_DUPLICATE' || g.matchType === 'ON_CHAIN_ALREADY_ISSUED').length;
    const possibleDuplicates = this.duplicateGroups.filter((g) => g.matchType === 'POSSIBLE_SAME_STUDENT').length;
    const conflictingRecords = this.duplicateGroups.filter((g) => g.matchType === 'IDENTITY_CONFLICT' || g.matchType === 'DUPLICATE_CERTIFICATE_ID').length;
    const pendingReviews = this.duplicateGroups.filter((g) => g.reviewStatus === 'PENDING').length;
    const totalRecords = totalCredentials + exactDuplicates + possibleDuplicates + conflictingRecords;
    const uniqueRecords = Math.max(0, totalRecords - exactDuplicates - conflictingRecords);

    return {
      totalRecords,
      totalStudents,
      totalAcademicRecords: totalCredentials,
      totalCredentials,
      uniqueRecords,
      exactDuplicates,
      possibleDuplicates,
      conflictingRecords,
      invalidRecords: conflictingRecords,
      pendingReviews,
      readyForIssuance: this.credentials.filter((c) => c.status === 'Active').length,
    };
  }

  // --- Verifications & General APIs ---
  public verifyCredential(
    credentialId: string,
    verifierInfo: {
      organization?: string;
      verifierName?: string;
      verifierEmail?: string;
      method: 'MANUAL_ID' | 'QR_SCAN';
    }
  ): {
    result: 'VERIFIED' | 'REVOKED' | 'NOT_FOUND';
    credential?: Credential;
    record: VerificationRecord;
  } {
    const cred = this.getCredentialById(credentialId);

    let result: 'VERIFIED' | 'REVOKED' | 'NOT_FOUND' = 'NOT_FOUND';
    if (cred) {
      result = cred.status === 'Revoked' ? 'REVOKED' : 'VERIFIED';
    }

    const record: VerificationRecord = {
      id: `vr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      credentialId: credentialId.trim().toUpperCase(),
      studentName: cred ? cred.studentName : 'Unknown Candidate',
      degreeName: cred ? cred.degreeName : 'Unknown',
      universityName: cred ? cred.universityName : 'Unknown',
      verifierOrganization: verifierInfo.organization || 'Anonymous Verifier',
      verifierName: verifierInfo.verifierName || 'Enterprise Verifier',
      verifierEmail: verifierInfo.verifierEmail || 'verify@recruiter.com',
      timestamp: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }) + ' IST',
      result,
      verificationMethod: verifierInfo.method,
      ipLocation: 'New Delhi / Cloudflare Edge (VeriDegree Network)',
    };

    this.verifications.unshift(record);
    this.persist();

    return { result, credential: cred, record };
  }

  public getVerifications(): VerificationRecord[] {
    return [...this.verifications];
  }

  public getVerificationsForCredential(credId: string): VerificationRecord[] {
    return this.verifications.filter(
      (v) => v.credentialId.toLowerCase() === credId.toLowerCase()
    );
  }

  public getVerificationsForStudent(studentName: string): VerificationRecord[] {
    return this.verifications.filter(
      (v) => v.studentName.toLowerCase() === studentName.toLowerCase()
    );
  }

  public getUniversities(): University[] {
    return [...this.universities];
  }

  public getUniversityById(id: string): University | undefined {
    return this.universities.find((u) => u.id === id);
  }

  public getStudents(): StudentRecord[] {
    return [...this.students];
  }

  public getRecruiterOrg(): RecruiterOrg {
    return { ...this.recruiterOrg };
  }

  public updateUniversity(id: string, updates: Partial<University>): boolean {
    const univ = this.getUniversityById(id);
    if (!univ) return false;
    Object.assign(univ, updates);
    this.persist();
    return true;
  }

  public updateStudent(id: string, updates: Partial<StudentRecord>): boolean {
    const s = this.students.find((item) => item.id === id);
    if (!s) return false;
    Object.assign(s, updates);
    this.persist();
    return true;
  }

  public updateRecruiterOrg(updates: Partial<RecruiterOrg>) {
    Object.assign(this.recruiterOrg, updates);
    this.persist();
  }

  public resetToDefault() {
    this.credentials = [...INITIAL_CREDENTIALS];
    this.universities = [...INITIAL_UNIVERSITIES];
    this.students = [...INITIAL_STUDENTS];
    this.verifications = [...INITIAL_VERIFICATIONS];
    this.recruiterOrg = INITIAL_RECRUITER_ORG;
    this.uploadBatches = [...INITIAL_UPLOAD_BATCHES];
    this.duplicateGroups = [...INITIAL_DUPLICATE_GROUPS];
    this.auditLogs = [];
    this.currentRole = 'university';
    this.currentUserEmail = 'registrar.office@iitd.ac.in';
    this.persist();
  }
}

export const credentialStore = new CredentialStore();
