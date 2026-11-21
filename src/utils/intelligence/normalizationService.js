/**
 * VERIDEGREE X — ACADEMIC DATA NORMALIZATION ENGINE
 *
 * Provides deterministic, reversible, and controlled normalization for academic
 * records. Preserves all raw input values while computing canonical representations
 * for indexed matching.
 */
// Controlled Dictionary for Standardized Degrees
const DEGREE_CONTROLLED_MAPPINGS = {
    'btech': 'Bachelor of Technology',
    'b.tech': 'Bachelor of Technology',
    'b. tech': 'Bachelor of Technology',
    'b.tech.': 'Bachelor of Technology',
    'bachelor of technology': 'Bachelor of Technology',
    'mtech': 'Master of Technology',
    'm.tech': 'Master of Technology',
    'm. tech': 'Master of Technology',
    'master of technology': 'Master of Technology',
    'mba': 'Master of Business Administration',
    'm.b.a.': 'Master of Business Administration',
    'master of business administration': 'Master of Business Administration',
    'bsc': 'Bachelor of Science',
    'b.sc': 'Bachelor of Science',
    'bachelor of science': 'Bachelor of Science',
    'msc': 'Master of Science',
    'm.sc': 'Master of Science',
    'master of science': 'Master of Science',
    'phd': 'Doctor of Philosophy',
    'ph.d': 'Doctor of Philosophy',
    'ph.d.': 'Doctor of Philosophy',
    'doctor of philosophy': 'Doctor of Philosophy',
    'bba': 'Bachelor of Business Administration',
    'bca': 'Bachelor of Computer Applications',
    'mca': 'Master of Computer Applications',
};
// Controlled Dictionary for Standardized Departments
const DEPARTMENT_CONTROLLED_MAPPINGS = {
    'cse': 'Department of Computer Science and Engineering',
    'cs': 'Department of Computer Science and Engineering',
    'comp sci': 'Department of Computer Science and Engineering',
    'computer science': 'Department of Computer Science and Engineering',
    'computer science & engg': 'Department of Computer Science and Engineering',
    'computer science and engineering': 'Department of Computer Science and Engineering',
    'department of computer science and engineering': 'Department of Computer Science and Engineering',
    'ee': 'Department of Electrical Engineering',
    'elec': 'Department of Electrical Engineering',
    'elec engg': 'Department of Electrical Engineering',
    'electrical': 'Department of Electrical Engineering',
    'electrical engineering': 'Department of Electrical Engineering',
    'department of electrical engineering': 'Department of Electrical Engineering',
    'me': 'Department of Mechanical Engineering',
    'mech': 'Department of Mechanical Engineering',
    'mech engg': 'Department of Mechanical Engineering',
    'mechanical': 'Department of Mechanical Engineering',
    'mechanical engineering': 'Department of Mechanical Engineering',
    'department of mechanical engineering': 'Department of Mechanical Engineering',
    'ce': 'Department of Civil Engineering',
    'civil': 'Department of Civil Engineering',
    'civil engg': 'Department of Civil Engineering',
    'civil engineering': 'Department of Civil Engineering',
    'department of civil engineering': 'Department of Civil Engineering',
    'dms': 'Department of Management Studies',
    'mgmt': 'Department of Management Studies',
    'management': 'Department of Management Studies',
    'management studies': 'Department of Management Studies',
    'department of management studies': 'Department of Management Studies',
    'math': 'Department of Mathematics',
    'mathematics': 'Department of Mathematics',
    'department of mathematics': 'Department of Mathematics',
    'physics': 'Department of Physics',
    'department of physics': 'Department of Physics',
};
const HONORIFICS_REGEX = /^(mr\.|ms\.|mrs\.|dr\.|prof\.|shri|smt\.|shree|km\.)\s+/i;
export class NormalizationService {
    /**
     * Normalizes human student names:
     * 1. Strips honorifics (Mr., Ms., Dr., Prof., Shri)
     * 2. Collapses whitespace
     * 3. Retains case-agnostic normalized representation
     * 4. Cleans dots in initials
     */
    static normalizeName(rawName) {
        if (!rawName)
            return '';
        let name = rawName.trim().replace(/\s+/g, ' ');
        name = name.replace(HONORIFICS_REGEX, '');
        // Standardize dots in initials (e.g. "A. Sharma" -> "A Sharma")
        name = name.replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
        return name.toUpperCase();
    }
    /**
     * Normalizes institutional enrollment/student numbers:
     * Strips internal separators like slashes or hyphens for canonical indexing
     * while preserving alphanumerics (e.g., "2020-CS-10912" -> "2020CS10912").
     */
    static normalizeEnrollmentNumber(rawEnrollment) {
        if (!rawEnrollment)
            return '';
        return rawEnrollment.trim().toUpperCase().replace(/[\s\-\/_.]/g, '');
    }
    /**
     * Normalizes emails to standard lowercase.
     */
    static normalizeEmail(rawEmail) {
        if (!rawEmail)
            return '';
        return rawEmail.trim().toLowerCase();
    }
    /**
     * Maps degree description to controlled taxonomy.
     * If not in controlled dictionary, returns normalized title-case string.
     */
    static normalizeDegree(rawDegree) {
        if (!rawDegree)
            return '';
        const clean = rawDegree.trim().toLowerCase().replace(/\s+/g, ' ');
        // Check direct controlled dictionary
        if (DEGREE_CONTROLLED_MAPPINGS[clean]) {
            return DEGREE_CONTROLLED_MAPPINGS[clean];
        }
        // Check substring prefix matches
        for (const [key, val] of Object.entries(DEGREE_CONTROLLED_MAPPINGS)) {
            if (clean.startsWith(key) || clean.includes(key)) {
                // e.g. "B.Tech in Mechanical" -> "Bachelor of Technology in Mechanical"
                const remainder = clean.replace(key, '').replace(/^(\s*in\s*|\s*of\s*|\s*-\s*)/, '').trim();
                if (remainder) {
                    const capitalizedRemainder = remainder
                        .split(' ')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                    return `${val} in ${capitalizedRemainder}`;
                }
                return val;
            }
        }
        return rawDegree.trim();
    }
    /**
     * Maps department description to institutional taxonomy.
     */
    static normalizeDepartment(rawDept) {
        if (!rawDept)
            return '';
        const clean = rawDept.trim().toLowerCase().replace(/\s+/g, ' ');
        if (DEPARTMENT_CONTROLLED_MAPPINGS[clean]) {
            return DEPARTMENT_CONTROLLED_MAPPINGS[clean];
        }
        for (const [key, val] of Object.entries(DEPARTMENT_CONTROLLED_MAPPINGS)) {
            if (clean.includes(key)) {
                return val;
            }
        }
        return rawDept.trim();
    }
    /**
     * Standardizes dates to ISO YYYY-MM-DD.
     */
    static normalizeDate(rawDate) {
        if (!rawDate)
            return '';
        try {
            if (rawDate instanceof Date) {
                return rawDate.toISOString().split('T')[0];
            }
            const str = String(rawDate).trim();
            // Handle DD/MM/YYYY or DD-MM-YYYY
            const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
            if (ddmmyyyy) {
                const day = ddmmyyyy[1].padStart(2, '0');
                const month = ddmmyyyy[2].padStart(2, '0');
                const year = ddmmyyyy[3];
                return `${year}-${month}-${day}`;
            }
            // Handle standard ISO
            const parsed = new Date(str);
            if (!isNaN(parsed.getTime())) {
                return parsed.toISOString().split('T')[0];
            }
            return str;
        }
        catch {
            return String(rawDate);
        }
    }
    /**
     * Computes Soundex phonetic encoding of names.
     * Enables matching across alternate transliterations and minor vowel variations.
     */
    static soundex(text) {
        if (!text)
            return '0000';
        const s = text.toUpperCase().replace(/[^A-Z]/g, '');
        if (!s)
            return '0000';
        const firstLetter = s[0];
        const mappings = {
            B: '1', F: '1', P: '1', V: '1',
            C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
            D: '3', T: '3',
            L: '4',
            M: '5', N: '5',
            R: '6',
        };
        let code = firstLetter;
        let prev = mappings[firstLetter] || '0';
        for (let i = 1; i < s.length && code.length < 4; i++) {
            const char = s[i];
            const digit = mappings[char] || '0';
            if (digit !== '0' && digit !== prev) {
                code += digit;
            }
            prev = digit;
        }
        return (code + '0000').slice(0, 4);
    }
    /**
     * Computes multiple multi-strategy blocking keys for high-recall, high-precision candidate retrieval.
     * Strategy 1: PHONETIC_YEAR -> Soundex of first & last tokens + Passing Year
     * Strategy 2: ENROLLMENT_PREFIX -> First 6 chars of normalized enrollment (e.g. 2020CS)
     * Strategy 3: DEPT_YEAR -> Department abbreviation + Passing Year (e.g. CSE_2024)
     * Strategy 4: NAME_PREFIX_YEAR -> First 3 chars of name + Passing Year (e.g. AAR_2024)
     * Strategy 5: EMAIL_PREFIX -> Email local-part token
     */
    static computeBlockingKeys(input) {
        const keys = [];
        const nameTokens = input.normalizedName.split(' ').filter(Boolean);
        const firstName = nameTokens[0] || '';
        const lastName = nameTokens.length > 1 ? nameTokens[nameTokens.length - 1] : firstName;
        // Strategy 1: Phonetic Soundex + Year
        const s1 = `PHONETIC_${this.soundex(firstName)}_${this.soundex(lastName)}_${input.normalizedPassingYear}`;
        keys.push(s1);
        // Strategy 2: Enrollment Batch Prefix (e.g., "2020CS" from "2020CS10891")
        if (input.normalizedEnrollment.length >= 4) {
            const s2 = `ENROLL_${input.normalizedEnrollment.slice(0, 6)}`;
            keys.push(s2);
        }
        // Strategy 3: Department + Year
        const deptPrefix = input.normalizedDepartment.replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase();
        if (deptPrefix) {
            const s3 = `DEPT_YEAR_${deptPrefix}_${input.normalizedPassingYear}`;
            keys.push(s3);
        }
        // Strategy 4: Name Prefix + Year
        const namePrefix = input.normalizedName.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase();
        if (namePrefix) {
            const s4 = `NAME_YEAR_${namePrefix}_${input.normalizedPassingYear}`;
            keys.push(s4);
        }
        // Strategy 5: Email Local-part
        if (input.normalizedEmail) {
            const emailLocal = input.normalizedEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
            if (emailLocal.length >= 4) {
                keys.push(`EMAIL_${emailLocal.slice(0, 8)}`);
            }
        }
        return keys;
    }
    /**
     * Legacy primary blocking key helper (backward compatibility).
     */
    static computeBlockingKey(normalizedName, department, passingYear) {
        const deptPrefix = department.replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase();
        const namePrefix = normalizedName.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase();
        return `${deptPrefix}_${passingYear}_${namePrefix}`;
    }
    /**
     * Fully normalizes an academic record row.
     */
    static normalizeRecord(input) {
        return {
            originalName: input.studentName,
            normalizedName: this.normalizeName(input.studentName),
            originalEnrollment: input.studentEnrollmentId,
            normalizedEnrollment: this.normalizeEnrollmentNumber(input.studentEnrollmentId),
            originalEmail: input.studentEmail,
            normalizedEmail: this.normalizeEmail(input.studentEmail),
            originalDepartment: input.department,
            normalizedDepartment: this.normalizeDepartment(input.department),
            originalDegree: input.degreeName,
            normalizedDegree: this.normalizeDegree(input.degreeName),
            originalPassingYear: Number(input.graduationYear),
            normalizedPassingYear: Number(input.graduationYear),
            originalIssueDate: input.issueDate,
            normalizedIssueDate: this.normalizeDate(input.issueDate),
        };
    }
}
