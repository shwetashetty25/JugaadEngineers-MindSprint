import React, { useState, useRef } from 'react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Database,
  Search,
  Filter,
  Download,
  Upload,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  History,
  Info,
  X,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DuplicateGroup, DuplicateMatchType, DuplicateReviewStatus, AuditLogEntry } from '../../types';
import { NormalizationService } from '../../utils/intelligence/normalizationService';

export const AcademicIntelligencePage: React.FC = () => {
  const {
    duplicateGroups,
    uploadBatches,
    auditLogs,
    intelligenceSummary,
    resolveDuplicateGroup,
    analyzeBatchRecords,
    credentials,
    currentUserEmail,
  } = useCredentialStore();

  const { success, error, info: toastInfo } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatchType, setSelectedMatchType] = useState<string>('ALL');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<string>('ALL');
  const [activeGroup, setActiveGroup] = useState<DuplicateGroup | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Duplicate Groups
  const filteredGroups = duplicateGroups.filter((g) => {
    const matchesSearch =
      g.incomingRecord?.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.incomingRecord?.studentEnrollmentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.incomingRecord?.credentialId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.detectionReason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedMatchType === 'ALL' || g.matchType === selectedMatchType;
    const matchesStatus = selectedReviewStatus === 'ALL' || g.reviewStatus === selectedReviewStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenCompare = (group: DuplicateGroup) => {
    setActiveGroup(group);
    setResolutionNotes(group.resolutionNotes || '');
    setIsCompareModalOpen(true);
  };

  const handleResolve = (
    action:
      | 'SAME_STUDENT_CONFIRMED'
      | 'KEPT_AS_SEPARATE'
      | 'RECORD_MERGED'
      | 'MARKED_AS_CONFLICT'
      | 'APPROVED_FOR_BLOCKCHAIN'
      | 'REJECTED_INVALID'
  ) => {
    if (!activeGroup) return;

    const ok = resolveDuplicateGroup(activeGroup.id, action, resolutionNotes);
    if (ok) {
      success('Review Status Updated', `Duplicate group ${activeGroup.id} resolved as ${action.replace(/_/g, ' ')}.`);
      setIsCompareModalOpen(false);
      setActiveGroup(null);
    } else {
      error('Resolution Error', 'Could not save registrar decision.');
    }
  };

  // CSV/XLSX Bulk File Upload & Intelligence Processing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setIsAnalyzing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rawRows.length === 0) {
        error('Empty Dataset', 'Uploaded file contains no rows.');
        setIsAnalyzing(false);
        return;
      }

      // Map rows to canonical schema
      const mappedRows = rawRows.map((row, idx) => ({
        studentName: row['Student Name'] || row.studentName || row.name || `Student ${idx + 1}`,
        studentEnrollmentId: row['Enrollment Number'] || row.studentEnrollmentId || row.enrollmentId || `ENR${idx + 1}`,
        studentEmail: row['Email'] || row.studentEmail || row.email || `student${idx + 1}@alumni.iitd.ac.in`,
        degreeName: row['Degree Name'] || row.degreeName || row.degree || 'Bachelor of Technology',
        department: row['Department'] || row.department || 'Department of Computer Science and Engineering',
        graduationYear: Number(row['Passing Year'] || row.graduationYear || row.year || 2024),
        credentialId: row['Certificate ID'] || row.credentialId || `VDX-2024-IITD-${Math.floor(1000 + Math.random() * 9000)}`,
        certificateNumber: row['Certificate ID'] || row.certificateNumber,
        issueDate: row['Issue Date'] || row.issueDate || '2024-06-25',
        cgpaOrGrade: row['Grade'] || row.cgpaOrGrade || '9.0 / 10.0',
        documentHash: row.documentHash,
      }));

      // Execute global database deduplication
      const analysisResult = analyzeBatchRecords(file.name, mappedRows);

      setIsAnalyzing(false);
      setIsUploadModalOpen(false);

      success(
        'Batch Analyzed Successfully',
        `Processed ${analysisResult.summary.total} records. Found ${analysisResult.summary.unique} unique, ${analysisResult.summary.exactDuplicates} exact duplicates, ${analysisResult.summary.possibleDuplicates} fuzzy matches, and ${analysisResult.summary.conflicts} conflicts.`
      );
    } catch (err: any) {
      console.error('Batch processing error:', err);
      error('Analysis Failed', err.message || 'Failed to parse Excel/CSV dataset.');
      setIsAnalyzing(false);
    }
  };

  const downloadValidationReport = () => {
    const reportData = duplicateGroups.map((g, idx) => ({
      Index: idx + 1,
      GroupID: g.id,
      MatchType: g.matchType,
      ConfidenceScore: `${(g.confidenceScore * 100).toFixed(1)}%`,
      ReviewStatus: g.reviewStatus,
      StudentName: g.incomingRecord?.studentName,
      EnrollmentNumber: g.incomingRecord?.studentEnrollmentId,
      Degree: g.incomingRecord?.degreeName,
      Department: g.incomingRecord?.department,
      GraduationYear: g.incomingRecord?.graduationYear,
      MatchedRecordID: g.canonicalRecordId || 'N/A',
      DetectionReason: g.detectionReason,
      AIExplanation: g.aiExplanation || '',
      ResolvedBy: g.resolvedBy || 'Unresolved',
      ResolvedAt: g.resolvedAt || 'N/A',
      Notes: g.resolutionNotes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Validation_Audit_Report');
    XLSX.writeFile(workbook, `VeriDegree_Academic_Validation_Report_${Date.now()}.xlsx`);
    success('Report Downloaded', 'Audit report exported as Excel spreadsheet.');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-forest-light text-forest text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Database Intelligence & Identity Resolution</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Academic Database Intelligence Engine
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed max-w-3xl">
            Global multi-batch deduplication, cross-roster identity verification, and pre-issuance Ethereum Sepolia safety gating.
            Prevents duplicate, conflicting, or erroneous academic credentials from anchoring to the blockchain ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Import Dataset (CSV/XLSX)</span>
          </button>
          <button
            onClick={downloadValidationReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-xl shadow-subtle transition-all"
            title="Export complete validation report"
          >
            <Download className="w-4 h-4 text-forest" />
            <span>Export Report</span>
          </button>
          <button
            onClick={() => setIsAuditDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-xl shadow-subtle transition-all"
            title="View chronological audit history"
          >
            <History className="w-4 h-4 text-forest" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Intelligence Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-charcoal-border shadow-xs">
          <p className="text-[11px] font-medium text-charcoal-muted uppercase tracking-wider">Total Database Records</p>
          <p className="font-serif text-2xl font-bold text-charcoal mt-1">{intelligenceSummary.totalRecords}</p>
          <p className="text-[10px] text-charcoal-muted mt-0.5">Across all batches</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <p className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">Unique Verified</p>
          <p className="font-serif text-2xl font-bold text-emerald-900 mt-1">{intelligenceSummary.uniqueRecords}</p>
          <p className="text-[10px] text-emerald-700 mt-0.5">Ready for blockchain</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/40 shadow-xs">
          <p className="text-[11px] font-medium text-rose-800 uppercase tracking-wider">Identity Conflicts</p>
          <p className="font-serif text-2xl font-bold text-rose-900 mt-1">{intelligenceSummary.conflictingRecords}</p>
          <p className="text-[10px] text-rose-700 mt-0.5">Strictly blocked</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <p className="text-[11px] font-medium text-amber-800 uppercase tracking-wider">Exact Duplicates</p>
          <p className="font-serif text-2xl font-bold text-amber-900 mt-1">{intelligenceSummary.exactDuplicates}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Linked to canonical</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-powder shadow-xs">
          <p className="text-[11px] font-medium text-powder-dark uppercase tracking-wider">Fuzzy Candidates</p>
          <p className="font-serif text-2xl font-bold text-charcoal mt-1">{intelligenceSummary.possibleDuplicates}</p>
          <p className="text-[10px] text-charcoal-muted mt-0.5">Name/spelling variations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-forest/30 bg-forest-light/30 shadow-xs">
          <p className="text-[11px] font-medium text-forest uppercase tracking-wider">Pending Reviews</p>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{intelligenceSummary.pendingReviews}</p>
          <p className="text-[10px] text-forest/80 mt-0.5">Registrar action needed</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-4 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, enrollment ID, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-charcoal-border focus:border-forest focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-muted font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Match Type:</span>
          </div>
          <select
            value={selectedMatchType}
            onChange={(e) => setSelectedMatchType(e.target.value)}
            className="py-1.5 px-2.5 text-xs rounded-xl bg-background border border-charcoal-border font-medium focus:outline-none"
          >
            <option value="ALL">All Match Types ({duplicateGroups.length})</option>
            <option value="EXACT_DUPLICATE">Exact Duplicates</option>
            <option value="IDENTITY_CONFLICT">Identity Conflicts</option>
            <option value="POSSIBLE_SAME_STUDENT">Possible Same Student</option>
            <option value="DUPLICATE_DEGREE">Duplicate Degree Awards</option>
            <option value="DUPLICATE_CERTIFICATE_ID">Duplicate Certificate ID</option>
            <option value="ON_CHAIN_ALREADY_ISSUED">On-Chain Anchored Records</option>
          </select>

          <select
            value={selectedReviewStatus}
            onChange={(e) => setSelectedReviewStatus(e.target.value)}
            className="py-1.5 px-2.5 text-xs rounded-xl bg-background border border-charcoal-border font-medium focus:outline-none"
          >
            <option value="ALL">All Review Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="RESOLVED_MERGED">Merged / Linked</option>
            <option value="RESOLVED_SEPARATE">Kept Separate</option>
            <option value="REJECTED">Rejected</option>
            <option value="RESOLVED_CORRECTION">Correction Requested</option>
          </select>
        </div>
      </div>

      {/* Main Review & Deduplication Queue Table */}
      <div className="bg-white rounded-2xl border border-charcoal-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-charcoal-border/70 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-charcoal">
              Global Deduplication & Identity Resolution Queue
            </h3>
            <p className="text-xs text-charcoal-muted">
              Displaying {filteredGroups.length} records requiring attention or resolved by registrar.
            </p>
          </div>
          <span className="text-xs font-mono text-forest bg-forest-light px-2.5 py-1 rounded-full font-bold">
            Live Registry Scoped: IIT Delhi
          </span>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-forest/40 mx-auto" />
            <h4 className="font-serif font-bold text-charcoal">No Deduplication Flags Detected</h4>
            <p className="text-xs text-charcoal-muted max-w-md mx-auto">
              All records in the current view are either unique, approved for blockchain attestation, or match the active search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-light/70 text-charcoal font-semibold border-b border-charcoal-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Match Classification</th>
                  <th className="py-3 px-4">Incoming Candidate</th>
                  <th className="py-3 px-4">Matched Database Record</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">AI Diagnostic Analysis</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border/50">
                {filteredGroups.map((group) => {
                  const isConflict = group.matchType === 'IDENTITY_CONFLICT' || group.matchType === 'DUPLICATE_CERTIFICATE_ID';
                  const isFuzzy = group.matchType === 'POSSIBLE_SAME_STUDENT';
                  const isExact = group.matchType === 'EXACT_DUPLICATE' || group.matchType === 'ON_CHAIN_ALREADY_ISSUED';

                  return (
                    <tr key={group.id} className="hover:bg-charcoal-light/30 transition-colors">
                      {/* Match Classification */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isConflict
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isFuzzy
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-purple-100 text-purple-800 border border-purple-300'
                          }`}
                        >
                          {isConflict ? (
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                          ) : isFuzzy ? (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          ) : (
                            <Database className="w-3 h-3 text-purple-600" />
                          )}
                          <span>{group.matchType.replace(/_/g, ' ')}</span>
                        </span>
                      </td>

                      {/* Incoming Candidate */}
                      <td className="py-3.5 px-4 font-medium text-charcoal">
                        <div className="font-bold">{group.incomingRecord?.studentName}</div>
                        <div className="font-mono text-[10px] text-charcoal-muted">
                          ID: {group.incomingRecord?.studentEnrollmentId} • {group.incomingRecord?.degreeName?.slice(0, 22)}...
                        </div>
                      </td>

                      {/* Matched Database Record */}
                      <td className="py-3.5 px-4 text-charcoal">
                        <div className="font-bold">{group.matchedRecord?.studentName || 'Existing DB Record'}</div>
                        <div className="font-mono text-[10px] text-charcoal-muted">
                          {group.canonicalRecordId || group.matchedRecord?.studentEnrollmentId || 'Pre-existing Record'}
                        </div>
                      </td>

                      {/* Confidence */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-charcoal">
                          {(group.confidenceScore * 100).toFixed(1)}%
                        </div>
                        <div className="w-16 bg-powder-light rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              group.confidenceScore >= 0.95 ? 'bg-forest' : group.confidenceScore >= 0.75 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${group.confidenceScore * 100}%` }}
                          />
                        </div>
                      </td>

                      {/* AI Diagnostic Snippet */}
                      <td className="py-3.5 px-4 text-charcoal-muted max-w-xs">
                        <p className="line-clamp-2 text-[11px] leading-snug">
                          {group.aiExplanation || group.detectionReason}
                        </p>
                      </td>

                      {/* Review Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            group.reviewStatus === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                              : group.reviewStatus === 'RESOLVED_MERGED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-charcoal-light text-charcoal border border-charcoal-border'
                          }`}
                        >
                          {group.reviewStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenCompare(group)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest text-white hover:bg-forest-hover font-bold text-[11px] shadow-xs transition-all"
                        >
                          <span>Compare Diff</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side-by-Side Record Comparison Modal (Module 8) */}
      {isCompareModalOpen && activeGroup && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-charcoal-border shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-charcoal-border/80 flex items-center justify-between bg-charcoal-light/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-forest bg-forest-light px-2.5 py-0.5 rounded-full">
                    Group ID: {activeGroup.id}
                  </span>
                  <span className="text-xs font-mono text-charcoal-muted">
                    Confidence: {(activeGroup.confidenceScore * 100).toFixed(1)}%
                  </span>
                </div>
                <h2 className="font-serif text-xl font-bold text-charcoal">
                  Side-by-Side Identity Resolution & Field Comparison
                </h2>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* AI Diagnostic Explanation Box */}
              <div className="p-4 rounded-xl bg-forest-light/40 border border-forest/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-forest">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Diagnostic Recommendation</span>
                </div>
                <p className="text-xs text-charcoal leading-relaxed font-sans">
                  {activeGroup.aiExplanation || activeGroup.detectionReason}
                </p>
              </div>

              {/* Side-by-Side Diff Table */}
              <div className="border border-charcoal-border rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-charcoal-light text-charcoal font-semibold border-b border-charcoal-border uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 w-1/4">Field Attribute</th>
                      <th className="py-2.5 px-4 w-3/8 text-forest font-bold">Incoming Candidate Record</th>
                      <th className="py-2.5 px-4 w-3/8 text-charcoal font-bold">Existing Database Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-border/50">
                    {activeGroup.fieldDiffs.map((diff, i) => (
                      <tr key={i} className={!diff.isMatch ? 'bg-amber-50/50' : ''}>
                        <td className="py-2.5 px-4 font-semibold text-charcoal flex items-center justify-between">
                          <span>{diff.field}</span>
                          {!diff.isMatch && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-rose-100 text-rose-700">
                              Diff
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-charcoal">
                          <span className={!diff.isMatch ? 'text-amber-900 font-bold' : 'text-charcoal'}>
                            {String(diff.incomingValue ?? 'N/A')}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-charcoal">
                          <span className={!diff.isMatch ? 'text-charcoal font-bold' : 'text-charcoal'}>
                            {String(diff.existingValue ?? 'N/A')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Registrar Resolution Notes Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-charcoal">
                  Registrar Resolution Notes (Recorded into Audit Ledger) *
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record justification for merge, conflict, or approval..."
                  className="w-full p-2.5 text-xs rounded-xl border border-charcoal-border bg-background focus:border-forest focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-charcoal-border bg-charcoal-light/30 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-white rounded-lg"
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleResolve('MARKED_AS_CONFLICT')}
                  className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
                >
                  Flag as Conflict
                </button>
                <button
                  onClick={() => handleResolve('KEPT_AS_SEPARATE')}
                  className="px-3.5 py-2 text-xs font-bold text-charcoal bg-white hover:bg-charcoal-light border border-charcoal-border rounded-xl transition-all"
                >
                  Keep as Separate Students
                </button>
                <button
                  onClick={() => handleResolve('SAME_STUDENT_CONFIRMED')}
                  className="px-4 py-2 text-xs font-bold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all"
                >
                  Confirm Same Student & Link Duplicate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Import & Deduplication Modal (Module 2) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-charcoal-border shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-border">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-forest" />
                <h3 className="font-serif font-bold text-lg text-charcoal">
                  Import & Deduplicate Academic Batch
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-charcoal-muted hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              Upload graduation rosters in <strong>.CSV</strong> or <strong>.XLSX</strong> format. The AI Intelligence Engine
              will automatically execute multi-field identity matching, candidate fuzzy blocking, and blockchain duplicate checks.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-charcoal-border hover:border-forest/60 rounded-xl p-8 text-center cursor-pointer bg-background transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal">Click to choose CSV or Excel spreadsheet</p>
                <p className="text-[11px] text-charcoal-muted mt-0.5">Supports .xlsx, .xls, and .csv files up to 25 MB</p>
              </div>
              {uploadFileName && (
                <p className="text-xs font-mono font-bold text-forest">{uploadFileName}</p>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />

            {isAnalyzing && (
              <div className="space-y-2 text-center p-3 bg-forest-light rounded-xl">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-forest">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Global Deduplication & Sepolia Pre-Flight Gating...</span>
                </div>
                <p className="text-[10px] text-forest/80">Indexing blocking keys and comparing against existing database...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Trail Drawer (Module 7 & 11) */}
      {isAuditDrawerOpen && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-charcoal-border">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-forest" />
                  <h3 className="font-serif font-bold text-lg text-charcoal">
                    Registrar Audit Ledger
                  </h3>
                </div>
                <button
                  onClick={() => setIsAuditDrawerOpen(false)}
                  className="p-1 rounded-lg text-charcoal-muted hover:text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-charcoal-muted">
                Immutable chronological log of all batch uploads, deduplication flags, and registrar resolution decisions.
              </p>

              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-charcoal-muted text-center py-8">No audit log entries recorded yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-charcoal-border bg-background space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal text-[11px] font-mono">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-charcoal-muted font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-charcoal-muted text-[11px] leading-relaxed">
                        {log.decisionReason || 'System action executed.'}
                      </p>
                      <div className="text-[10px] text-forest font-mono">
                        Actor: {log.performedBy}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setIsAuditDrawerOpen(false)}
              className="w-full py-2.5 text-xs font-semibold text-charcoal bg-charcoal-light hover:bg-charcoal-border/50 rounded-xl"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

