/**
 * VERIDEGREE X — GLOBAL ACADEMIC DATABASE DEDUPLICATION & IDENTITY RESOLUTION ENGINE
 *
 * Analyzes incoming candidate records against:
 * 1. Current batch records
 * 2. Previous upload batches
 * 3. Existing student database
 * 4. Existing credential records and Ethereum Sepolia on-chain state
 */
import { NormalizationService } from './normalizationService';
import { FuzzyMatcher } from './fuzzyMatcher';
export { NormalizationService, FuzzyMatcher };
export class DeduplicationEngine {
    // Matching Threshold Constants
    static HIGH_CONFIDENCE_NAME_THRESHOLD = 0.88;
    static MODERATE_NAME_THRESHOLD = 0.75;
    static CONFLICT_NAME_THRESHOLD = 0.50;
    /**
     * Evaluates an incoming academic record against the global university database.
     */
    static analyzeRecord(incoming, existingDatabase) {
        // 1. Validate mandatory fields
        if (!incoming.studentName?.trim() || !incoming.studentEnrollmentId?.trim()) {
            return {
                incomingRecordId: incoming.credentialId || incoming.id || 'INCOMING_ROW',
                studentClassification: 'INSUFFICIENT_INFORMATION',
                awardClassification: 'NEEDS_REGISTRAR_REVIEW',
                confidenceScore: 0.0,
                isBlockedFromBlockchain: true,
                detectionReason: 'Missing mandatory identification fields (Student Name or Enrollment Number).',
                aiExplanation: 'INSUFFICIENT INFORMATION: Cannot perform identity resolution because either the Student Name or Enrollment Number was omitted. Recommendation: Request student registry correction.',
                fieldDiffs: [],
                suggestedAction: 'REJECT_CONFLICT',
            };
        }
        const normIncoming = NormalizationService.normalizeRecord(incoming);
        const incomingCredId = incoming.credentialId ? incoming.credentialId.trim().toUpperCase() : '';
        const incomingCertNum = incoming.certificateNumber ? incoming.certificateNumber.trim().toUpperCase() : incomingCredId;
        const incomingDocHash = incoming.documentHash ? incoming.documentHash.trim().toLowerCase() : '';
        // Search existing records for matches
        for (const existing of existingDatabase) {
            if (existing.id && incoming.id && existing.id === incoming.id)
                continue;
            const normExisting = NormalizationService.normalizeRecord(existing);
            const existingCredId = existing.credentialId ? existing.credentialId.trim().toUpperCase() : '';
            const existingCertNum = existing.certificateNumber ? existing.certificateNumber.trim().toUpperCase() : existingCredId;
            const existingDocHash = existing.documentHash ? existing.documentHash.trim().toLowerCase() : '';
            const existingTxHash = existing.blockchainTxHash ? existing.blockchainTxHash.trim() : '';
            // --- CHECK A: Duplicate Certificate/Credential ID ---
            if (incomingCredId && existingCredId && incomingCredId === existingCredId) {
                const nameSim = FuzzyMatcher.nameSimilarity(normIncoming.normalizedName, normExisting.normalizedName);
                const isSameStudent = normIncoming.normalizedEnrollment === normExisting.normalizedEnrollment;
                // Check if already anchored on Ethereum Sepolia
                if (existingTxHash) {
                    return {
                        incomingRecordId: incomingCredId,
                        matchedRecordId: existingCredId,
                        studentClassification: isSameStudent ? 'SAME_STUDENT_CONFIRMED' : 'IDENTITY_CONFLICT',
                        awardClassification: 'ON_CHAIN_ALREADY_ISSUED',
                        confidenceScore: 1.0,
                        isBlockedFromBlockchain: true,
                        detectionReason: `Credential ID ${incomingCredId} has already been anchored on Ethereum Sepolia in Tx: ${existingTxHash.slice(0, 10)}...`,
                        aiExplanation: `BLOCKCHAIN DUPLICATE GATE: Credential ID ${incomingCredId} already exists on the Ethereum Sepolia ledger (Tx: ${existingTxHash}). Re-issuance is halted to prevent duplicate records and wasted gas. Recommendation: Inspect existing on-chain credential.`,
                        fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                        suggestedAction: 'LINK_AS_DUPLICATE',
                    };
                }
                if (!isSameStudent && nameSim < this.CONFLICT_NAME_THRESHOLD) {
                    return {
                        incomingRecordId: incomingCredId,
                        matchedRecordId: existingCredId,
                        studentClassification: 'IDENTITY_CONFLICT',
                        awardClassification: 'DUPLICATE_CERTIFICATE_ID',
                        confidenceScore: 0.99,
                        isBlockedFromBlockchain: true,
                        detectionReason: `Credential ID ${incomingCredId} is already assigned to another student (${existing.studentName}, ${existing.studentEnrollmentId}).`,
                        aiExplanation: `CRITICAL IDENTITY CONFLICT: Certificate ID collision detected. Credential ID ${incomingCredId} is already assigned to a completely different student: "${existing.studentName}" (${existing.studentEnrollmentId}). Issuance is strictly blocked. Recommendation: Re-assign a unique Certificate ID.`,
                        fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                        suggestedAction: 'REJECT_CONFLICT',
                    };
                }
                return {
                    incomingRecordId: incomingCredId,
                    matchedRecordId: existingCredId,
                    studentClassification: 'SAME_STUDENT_CONFIRMED',
                    awardClassification: 'EXACT_DUPLICATE_CREDENTIAL',
                    confidenceScore: 1.0,
                    isBlockedFromBlockchain: true,
                    detectionReason: `Exact duplicate credential record with ID ${incomingCredId} is already in the database.`,
                    aiExplanation: `EXACT DUPLICATE: Record with Credential ID ${incomingCredId} already exists in the institutional database for student ${existing.studentName}. Recommendation: Link duplicate to existing canonical record.`,
                    fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                    suggestedAction: 'LINK_AS_DUPLICATE',
                };
            }
            // --- CHECK B: Identical Document PDF Binary SHA-256 Hash ---
            if (incomingDocHash && existingDocHash && incomingDocHash === existingDocHash) {
                const isSameStudent = normIncoming.normalizedEnrollment === normExisting.normalizedEnrollment;
                return {
                    incomingRecordId: incomingCredId || 'INCOMING_RECORD',
                    matchedRecordId: existingCredId || existing.id,
                    studentClassification: isSameStudent ? 'SAME_STUDENT_CONFIRMED' : 'IDENTITY_CONFLICT',
                    awardClassification: 'DUPLICATE_DOCUMENT_HASH',
                    confidenceScore: 0.95,
                    isBlockedFromBlockchain: true,
                    detectionReason: `Identical document binary detected: Uploaded PDF shares the exact same SHA-256 hash (${incomingDocHash.slice(0, 10)}...) with ${existing.studentName} (${existingCredId || existing.studentEnrollmentId}).`,
                    aiExplanation: `IDENTICAL DOCUMENT ATTACHMENT: The cryptographic SHA-256 digest of this uploaded degree parchment matches an existing record for ${existing.studentName}. This indicates an identical PDF file attachment (such as a re-upload of the same certificate, use of an unchanged parchment template, or an accidental file attachment duplicate). Recommendation: Registrar review required to verify whether this parchment was intended for a different graduate or is a legitimate re-issuance before blockchain attestation.`,
                    fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                    suggestedAction: 'REQUIRE_REGISTRAR_REVIEW',
                };
            }
            // --- CHECK C: Student Identity Resolution (Level A: Enrollment Match) ---
            if (normIncoming.normalizedEnrollment === normExisting.normalizedEnrollment) {
                const nameSim = FuzzyMatcher.nameSimilarity(normIncoming.normalizedName, normExisting.normalizedName);
                // Case C1: Same Enrollment Number, but Names Completely Differ -> IDENTITY CONFLICT
                if (nameSim < this.CONFLICT_NAME_THRESHOLD) {
                    return {
                        incomingRecordId: incomingCredId || incoming.studentEnrollmentId,
                        matchedRecordId: existingCredId || existing.studentEnrollmentId,
                        studentClassification: 'IDENTITY_CONFLICT',
                        awardClassification: 'NEEDS_REGISTRAR_REVIEW',
                        confidenceScore: 0.95,
                        isBlockedFromBlockchain: true,
                        detectionReason: `Enrollment Number ${incoming.studentEnrollmentId} belongs to "${existing.studentName}", but incoming row specifies "${incoming.studentName}" (Similarity: ${(nameSim * 100).toFixed(1)}%).`,
                        aiExplanation: `SEVERE IDENTITY CONFLICT: Enrollment number "${incoming.studentEnrollmentId}" is already registered to "${existing.studentName}" in the institutional database. The incoming record claims the same enrollment number for "${incoming.studentName}". Recommendation: Halt issuance immediately and verify physical registrar ledger.`,
                        fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                        suggestedAction: 'REJECT_CONFLICT',
                    };
                }
                // Case C2: Confirmed Same Student -> Now Evaluate Degree Award Details
                const isSameDegree = normIncoming.normalizedDegree === normExisting.normalizedDegree;
                const isSameDept = normIncoming.normalizedDepartment === normExisting.normalizedDepartment;
                const isSameYear = normIncoming.normalizedPassingYear === normExisting.normalizedPassingYear;
                // Subcase C2a: Same Student + Same Degree + DIFFERENT Department -> Department Conflict
                if (isSameDegree && !isSameDept) {
                    return {
                        incomingRecordId: incomingCredId || incoming.studentEnrollmentId,
                        matchedRecordId: existingCredId || existing.id,
                        studentClassification: 'SAME_STUDENT_CONFIRMED',
                        awardClassification: 'NEEDS_REGISTRAR_REVIEW',
                        confidenceScore: 0.88,
                        isBlockedFromBlockchain: true,
                        detectionReason: `Department mismatch: Student is registered in ${existing.department} for ${existing.degreeName}, but incoming record specifies ${incoming.department}.`,
                        aiExplanation: `DEPARTMENT CONFLICT: Major or academic branch mismatch detected. Registered department is "${existing.department}", while submitted department is "${incoming.department}". Recommendation: Verify student transcript branch change.`,
                        fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                        suggestedAction: 'REQUIRE_REGISTRAR_REVIEW',
                    };
                }
                // Subcase C2b: Same Student + Same Degree + DIFFERENT Passing Year -> Passing Year Discrepancy
                if (isSameDegree && !isSameYear) {
                    return {
                        incomingRecordId: incomingCredId || incoming.studentEnrollmentId,
                        matchedRecordId: existingCredId || existing.id,
                        studentClassification: 'SAME_STUDENT_CONFIRMED',
                        awardClassification: 'NEEDS_REGISTRAR_REVIEW',
                        confidenceScore: 0.90,
                        isBlockedFromBlockchain: true,
                        detectionReason: `Passing year conflict: Student ${incoming.studentName} has existing ${existing.degreeName} with graduation year ${existing.graduationYear}, but incoming record specifies ${incoming.graduationYear}.`,
                        aiExplanation: `GRADUATION YEAR CONFLICT: Existing database record lists graduation year ${existing.graduationYear} for ${incoming.degreeName}, while the incoming submission indicates ${incoming.graduationYear}. This could be a back-paper completion or a clerical entry error. Recommendation: Registrar review required before blockchain anchoring.`,
                        fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                        suggestedAction: 'REQUIRE_REGISTRAR_REVIEW',
                    };
                }
                // Subcase C2c: Same Student + Same Degree + Same Year + Same Dept -> DUPLICATE DEGREE AWARD
                if (isSameDegree && isSameYear && isSameDept) {
                    return {
                        incomingRecordId: incomingCredId || incoming.studentEnrollmentId,
                        matchedRecordId: existingCredId || existing.id,
                        studentClassification: 'SAME_STUDENT_CONFIRMED',
                        awardClassification: 'DUPLICATE_DEGREE_AWARD',
                        confidenceScore: 0.98,
                        isBlockedFromBlockchain: true,
                        detectionReason: `Student ${incoming.studentName} (${incoming.studentEnrollmentId}) already has an identical ${incoming.degreeName} recorded for Year ${incoming.graduationYear}.`,
                        aiExplanation: `DUPLICATE DEGREE AWARD: Student ${incoming.studentName} has already been awarded ${incoming.degreeName} in ${incoming.graduationYear} (Existing ID: ${existingCredId || 'DB_RECORD'}). Duplicate conferrals of the same award are prohibited. Recommendation: Link duplicate to canonical degree award.`,
                        fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                        suggestedAction: 'LINK_AS_DUPLICATE',
                    };
                }
                // Subcase C2d: Same Student + DIFFERENT Degree (e.g. B.Tech vs M.Tech or MBA) -> LEGITIMATE DUAL DEGREE!
                return {
                    incomingRecordId: incomingCredId || incoming.studentEnrollmentId,
                    matchedRecordId: existingCredId || existing.id,
                    studentClassification: 'SAME_STUDENT_CONFIRMED',
                    awardClassification: 'LEGITIMATE_DUAL_DEGREE',
                    confidenceScore: 0.95,
                    isBlockedFromBlockchain: false, // ALLOWED!
                    detectionReason: `Legitimate multiple academic credential: Student holds existing ${existing.degreeName} (${existing.graduationYear}) and incoming is ${incoming.degreeName} (${incoming.graduationYear}).`,
                    aiExplanation: `VALID SUBSEQUENT DEGREE: Student ${incoming.studentName} is confirmed in the academic database. This record represents a legitimate separate degree (${incoming.degreeName}, Class of ${incoming.graduationYear}) distinct from previous ${existing.degreeName} (${existing.graduationYear}). Recommendation: Approved for credential issuance.`,
                    fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                    suggestedAction: 'ALLOW_DUAL_DEGREE_ISSUANCE',
                };
            }
            // --- CHECK D: Multi-Field & Fuzzy Matching (Different Enrollment, Similar Name) ---
            const nameSim = FuzzyMatcher.nameSimilarity(normIncoming.normalizedName, normExisting.normalizedName);
            const isSameDept = normIncoming.normalizedDepartment === normExisting.normalizedDepartment;
            const isSameYear = normIncoming.normalizedPassingYear === normExisting.normalizedPassingYear;
            const isSameEmail = normIncoming.normalizedEmail && normExisting.normalizedEmail && normIncoming.normalizedEmail === normExisting.normalizedEmail;
            // Case D1: Identical Email address across different enrollment numbers
            if (isSameEmail && normIncoming.normalizedEnrollment !== normExisting.normalizedEnrollment) {
                return {
                    incomingRecordId: incomingCredId || incoming.studentEnrollmentId,
                    matchedRecordId: existingCredId || existing.studentEnrollmentId,
                    studentClassification: 'IDENTITY_CONFLICT',
                    awardClassification: 'NEEDS_REGISTRAR_REVIEW',
                    confidenceScore: 0.88,
                    isBlockedFromBlockchain: true,
                    detectionReason: `Email address "${incoming.studentEmail}" is already linked to Enrollment Number ${existing.studentEnrollmentId} (${existing.studentName}), but incoming has ${incoming.studentEnrollmentId}.`,
                    aiExplanation: `EMAIL COLLISION: Institutional email ${incoming.studentEmail} is already registered under enrollment ${existing.studentEnrollmentId}. Recommendation: Require registrar review to confirm if enrollment ID changed during degree upgrade.`,
                    fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                    suggestedAction: 'REQUIRE_REGISTRAR_REVIEW',
                };
            }
            // Case D2: High Name Similarity in Same Department & Year (Possible Spelling Variation or Middle Name)
            if (nameSim >= this.HIGH_CONFIDENCE_NAME_THRESHOLD && isSameDept && isSameYear) {
                return {
                    incomingRecordId: incomingCredId || incoming.studentEnrollmentId,
                    matchedRecordId: existingCredId || existing.studentEnrollmentId,
                    studentClassification: 'POSSIBLE_SAME_STUDENT',
                    awardClassification: 'NEEDS_REGISTRAR_REVIEW',
                    confidenceScore: nameSim,
                    isBlockedFromBlockchain: true,
                    detectionReason: `High name similarity (${(nameSim * 100).toFixed(1)}%) between "${incoming.studentName}" and existing "${existing.studentName}" in ${incoming.department} (${incoming.graduationYear}).`,
                    aiExplanation: `POSSIBLE SAME STUDENT: Name "${incoming.studentName}" is ${(nameSim * 100).toFixed(1)}% similar to existing student "${existing.studentName}" in the same department (${incoming.department}) and passing year (${incoming.graduationYear}), but enrollment numbers differ (${incoming.studentEnrollmentId} vs ${existing.studentEnrollmentId}). Recommendation: Verify whether this is a typographical correction or separate students.`,
                    fieldDiffs: this.buildFieldDiffs(normIncoming, normExisting, incomingDocHash, existingDocHash),
                    suggestedAction: 'REQUIRE_REGISTRAR_REVIEW',
                };
            }
        }
        // --- CASE E: No conflicts or duplicates detected -> Clean Unique Record ---
        return {
            incomingRecordId: incomingCredId || incoming.studentEnrollmentId,
            studentClassification: 'DIFFERENT_STUDENT',
            awardClassification: 'UNIQUE_RECORD',
            confidenceScore: 1.0,
            isBlockedFromBlockchain: false,
            detectionReason: 'No duplicates or identity conflicts detected across institutional registry.',
            aiExplanation: 'VALID UNIQUE RECORD: Student identity, enrollment number, and degree award details are unique and validated against all existing database records. Approved for blockchain attestation.',
            fieldDiffs: [],
            suggestedAction: 'APPROVE_FOR_ISSUANCE',
        };
    }
    /**
     * Generates field-by-field comparison diffs between incoming and existing records.
     */
    static buildFieldDiffs(incoming, existing, incomingDocHash, existingDocHash) {
        const nameSim = FuzzyMatcher.nameSimilarity(incoming.normalizedName, existing.normalizedName);
        const diffs = [
            {
                field: 'Student Full Name',
                incomingValue: incoming.originalName,
                existingValue: existing.originalName,
                isMatch: incoming.normalizedName === existing.normalizedName,
                similarityScore: nameSim,
                significance: 'CRITICAL',
            },
            {
                field: 'Enrollment Number',
                incomingValue: incoming.originalEnrollment,
                existingValue: existing.originalEnrollment,
                isMatch: incoming.normalizedEnrollment === existing.normalizedEnrollment,
                significance: 'CRITICAL',
            },
            {
                field: 'Institutional Email',
                incomingValue: incoming.originalEmail,
                existingValue: existing.originalEmail,
                isMatch: incoming.normalizedEmail === existing.normalizedEmail,
                significance: 'IMPORTANT',
            },
            {
                field: 'Degree Program',
                incomingValue: incoming.originalDegree,
                existingValue: existing.originalDegree,
                isMatch: incoming.normalizedDegree === existing.normalizedDegree,
                significance: 'CRITICAL',
            },
            {
                field: 'Department',
                incomingValue: incoming.originalDepartment,
                existingValue: existing.originalDepartment,
                isMatch: incoming.normalizedDepartment === existing.normalizedDepartment,
                significance: 'IMPORTANT',
            },
            {
                field: 'Graduation Year',
                incomingValue: incoming.originalPassingYear,
                existingValue: existing.originalPassingYear,
                isMatch: incoming.normalizedPassingYear === existing.normalizedPassingYear,
                significance: 'IMPORTANT',
            },
        ];
        if (incomingDocHash || existingDocHash) {
            diffs.push({
                field: 'Document PDF SHA-256',
                incomingValue: incomingDocHash ? `${incomingDocHash.slice(0, 10)}...` : 'Not Attached',
                existingValue: existingDocHash ? `${existingDocHash.slice(0, 10)}...` : 'Not Attached',
                isMatch: Boolean(incomingDocHash && existingDocHash && incomingDocHash === existingDocHash),
                significance: 'CRITICAL',
            });
        }
        return diffs;
    }
}
