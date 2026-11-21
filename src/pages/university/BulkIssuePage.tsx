import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useToast } from '../../context/ToastContext';
import { useWallet } from '../../contexts/WalletContext';
import { normalizeCredentialId, encodeCredentialIdToBytes32 } from '../../utils/credentialEncoder';
import { ethers } from 'ethers';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Shield,
  XCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParsedRecord {
  studentName: string;
  studentEmail: string;
  studentEnrollmentId: string;
  degreeName: string;
  department: string;
  graduationYear: number;
  issueDate: string;
  cgpaOrGrade: string;
  credentialId: string;
  isValid: boolean;
  errors: string[];
  status?: 'IDLE' | 'SIGNING' | 'CONFIRMED' | 'FAILED';
  txHash?: string;
  blockNumber?: number;
  errorMsg?: string;
}

const SAMPLE_CSV_CONTENT = `studentName,studentEmail,studentEnrollmentId,degreeName,department,graduationYear,issueDate,cgpaOrGrade,credentialId
Aditi Deshmukh,aditi.d@alumni.iitd.ac.in,2020CS10912,B.Tech in Computer Science,Computer Science & Engg,2024,2024-06-25,9.52 / 10.0,VDX-2024-IITD-8821
Tarun Aggarwal,tarun.a@alumni.iitd.ac.in,2020EE10451,B.Tech in Electrical Engineering,Electrical Engineering,2024,2024-06-25,9.15 / 10.0,VDX-2024-IITD-8822
Meghna Sengupta,meghna.s@alumni.iitd.ac.in,2020ME10782,B.Tech in Mechanical Engineering,Mechanical Engineering,2024,2024-06-25,8.90 / 10.0,VDX-2024-IITD-8823
Rishabh Pant,rishabh.p@alumni.iitd.ac.in,2020CE10319,B.Tech in Civil Engineering,Civil Engineering,2024,2024-06-25,8.74 / 10.0,VDX-2024-IITD-8824
Simran Kaur,simran.k@dms.iitd.ac.in,2022SM7089,Master of Business Administration,Department of Management Studies,2024,2024-06-25,9.40 / 10.0,VDX-2024-IITD-8825`;

export const BulkIssuePage: React.FC = () => {
  const { universities, issueCredential, analyzeBatchRecords } = useCredentialStore();
  const currentUniv = universities[0];
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const { account, isSepolia, isDemoWallet, hasMetaMask, issueCredentialOnChain, connectWallet } = useWallet();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [records, setRecords] = useState<ParsedRecord[]>([
    {
      studentName: 'Aditi Deshmukh',
      studentEmail: 'aditi.d@alumni.iitd.ac.in',
      studentEnrollmentId: '2020CS10912',
      degreeName: 'B.Tech in Computer Science',
      department: 'Computer Science & Engg',
      graduationYear: 2024,
      issueDate: '2024-06-25',
      cgpaOrGrade: '9.52 / 10.0',
      credentialId: 'VDX-2024-IITD-8821',
      isValid: true,
      errors: [],
      status: 'IDLE'
    },
    {
      studentName: 'Tarun Aggarwal',
      studentEmail: 'tarun.a@alumni.iitd.ac.in',
      studentEnrollmentId: '2020EE10451',
      degreeName: 'B.Tech in Electrical Engineering',
      department: 'Electrical Engineering',
      graduationYear: 2024,
      issueDate: '2024-06-25',
      cgpaOrGrade: '9.15 / 10.0',
      credentialId: 'VDX-2024-IITD-8822',
      isValid: true,
      errors: [],
      status: 'IDLE'
    },
    {
      studentName: 'Meghna Sengupta',
      studentEmail: 'meghna.s@alumni.iitd.ac.in',
      studentEnrollmentId: '2020ME10782',
      degreeName: 'B.Tech in Mechanical Engineering',
      department: 'Mechanical Engineering',
      graduationYear: 2024,
      issueDate: '2024-06-25',
      cgpaOrGrade: '8.90 / 10.0',
      credentialId: 'VDX-2024-IITD-8823',
      isValid: true,
      errors: [],
      status: 'IDLE'
    },
    {
      studentName: 'Rishabh Pant',
      studentEmail: 'rishabh.p@alumni.iitd.ac.in',
      studentEnrollmentId: '2020CE10319',
      degreeName: 'B.Tech in Civil Engineering',
      department: 'Civil Engineering',
      graduationYear: 2024,
      issueDate: '2024-06-25',
      cgpaOrGrade: '8.74 / 10.0',
      credentialId: 'VDX-2024-IITD-8824',
      isValid: true,
      errors: [],
      status: 'IDLE'
    },
    {
      studentName: 'Simran Kaur',
      studentEmail: 'simran.k@dms.iitd.ac.in',
      studentEnrollmentId: '2022SM7089',
      degreeName: 'Master of Business Administration',
      department: 'Department of Management Studies',
      graduationYear: 2024,
      issueDate: '2024-06-25',
      cgpaOrGrade: '9.40 / 10.0',
      credentialId: 'VDX-2024-IITD-8825',
      isValid: true,
      errors: [],
      status: 'IDLE'
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);

  const validCount = records.filter((r) => r.isValid).length;
  const invalidCount = records.length - validCount;
  const confirmedCount = records.filter((r) => r.status === 'CONFIRMED').length;

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'veridegree_degree_batch_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    success('Sample CSV Downloaded', 'Use this schema to prepare bulk student degree records.');
  };

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rawRows.length === 0) {
        error('Empty File', 'The selected file does not contain any record rows.');
        return;
      }

      const parsed: ParsedRecord[] = rawRows.map((row, idx) => {
        const studentName = row['Student Name'] || row.studentName || row.name || '';
        const studentEnrollmentId = row['Enrollment Number'] || row.studentEnrollmentId || row.enrollmentId || '';
        const studentEmail = row['Email'] || row.studentEmail || row.email || '';
        const degreeName = row['Degree Name'] || row.degreeName || row.degree || '';
        const department = row['Department'] || row.department || '';
        const graduationYear = Number(row['Passing Year'] || row.graduationYear || row.year || 2024);
        const issueDate = row['Issue Date'] || row.issueDate || '2024-06-25';
        const cgpaOrGrade = row['Grade'] || row.cgpaOrGrade || '9.0 / 10.0';
        const credentialId = row['Certificate ID'] || row.credentialId || `VDX-2024-IITD-${Math.floor(1000 + Math.random() * 9000)}`;

        const errors: string[] = [];
        if (!studentName) errors.push('Missing Student Name');
        if (!studentEnrollmentId) errors.push('Missing Enrollment Number');
        if (!degreeName) errors.push('Missing Degree Name');

        return {
          studentName,
          studentEmail,
          studentEnrollmentId,
          degreeName,
          department,
          graduationYear,
          issueDate,
          cgpaOrGrade,
          credentialId,
          isValid: errors.length === 0,
          errors,
          status: 'IDLE' as const,
        };
      });

      setRecords(parsed);
      analyzeBatchRecords(file.name, parsed);

      success('File Uploaded & Evaluated', `Loaded ${parsed.length} rows from ${file.name}. Cross-batch deduplication completed.`);
    } catch (err: any) {
      console.error('File parsing failed:', err);
      error('Upload Failed', err.message || 'Could not parse uploaded spreadsheet.');
    }
  };

  const handleConfirmBatch = async () => {
    if (validCount === 0) {
      error('No Valid Records', 'Please ensure there are valid records to issue.');
      return;
    }

    if (!account) {
      error('Wallet Required', 'Please connect your university MetaMask wallet on Ethereum Sepolia to issue credentials.');
      return;
    }

    if (isDemoWallet) {
      error(
        'Real Issuance Blocked',
        'You are currently in Demo Mode. Real on-chain bulk issuance requires an authorized university MetaMask wallet on Ethereum Sepolia.'
      );
      return;
    }

    if (!isSepolia) {
      error('Wrong Network', 'Please switch your MetaMask network to Ethereum Sepolia (Chain ID: 11155111).');
      return;
    }

    setIsProcessing(true);
    let successfulCount = 0;

    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (!rec.isValid || rec.status === 'CONFIRMED') continue;

      setCurrentProcessingIndex(i);
      setRecords((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, status: 'SIGNING', errorMsg: undefined } : r))
      );

      try {
        const cleanId = normalizeCredentialId(rec.credentialId);
        const bytesCredId = encodeCredentialIdToBytes32(cleanId);

        // Generate deterministic document and metadata hashes
        const docPayload = JSON.stringify({
          credentialId: cleanId,
          studentName: rec.studentName,
          enrollmentId: rec.studentEnrollmentId,
          degreeName: rec.degreeName,
          university: currentUniv.name,
          issueDate: rec.issueDate
        });
        const docHash = ethers.sha256(ethers.toUtf8Bytes(docPayload));

        const metaPayload = JSON.stringify({
          credentialId: cleanId,
          cgpaOrGrade: rec.cgpaOrGrade,
          department: rec.department,
          graduationYear: rec.graduationYear
        });
        const metaHash = ethers.sha256(ethers.toUtf8Bytes(metaPayload));

        info('Signing Record', `Confirming record ${i + 1}/${records.length} (${rec.studentName}) in MetaMask...`);
        const onChainResult = await issueCredentialOnChain(bytesCredId, docHash, metaHash);

        // Save into local store with real confirmed hashes
        issueCredential({
          id: cleanId,
          studentName: rec.studentName,
          studentEmail: rec.studentEmail,
          studentEnrollmentId: rec.studentEnrollmentId,
          degreeName: rec.degreeName,
          degreeType: rec.degreeName.toLowerCase().includes('master') || rec.degreeName.toLowerCase().includes('mba') ? 'Master' : 'Bachelor',
          department: rec.department,
          universityId: currentUniv.id,
          universityName: currentUniv.name,
          graduationYear: rec.graduationYear,
          issueDate: rec.issueDate,
          cgpaOrGrade: rec.cgpaOrGrade,
          status: 'Active',
          documentHash: docHash,
          merkleRoot: metaHash,
          blockNumber: onChainResult.blockNumber,
          metadata: {
            blockchainTxHash: onChainResult.txHash
          }
        });

        successfulCount++;
        setRecords((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: 'CONFIRMED',
                  txHash: onChainResult.txHash,
                  blockNumber: onChainResult.blockNumber
                }
              : r
          )
        );
      } catch (err: any) {
        console.error(`Error issuing record ${rec.credentialId}:`, err);
        setRecords((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: 'FAILED',
                  errorMsg: err.message || 'On-chain transaction failed'
                }
              : r
          )
        );
        // If user cancelled, pause batch
        if (err.message?.toLowerCase().includes('rejected') || err.code === 4001) {
          error('Batch Paused', 'Transaction signature was rejected in MetaMask.');
          break;
        }
      }
    }

    setIsProcessing(false);
    setCurrentProcessingIndex(null);

    if (successfulCount > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      success('Batch Issuance Complete', `Successfully confirmed ${successfulCount} records on Ethereum Sepolia.`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Bulk Credential Issuance
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Confer and anchor entire graduating batches with verifiable individual transaction tracking.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-xl shadow-subtle transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-forest" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Wallet Status Callout */}
      {isDemoWallet && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>
              <strong>Demo Mode:</strong> You are connected with the Demo Registrar Wallet (0x7099...79C8). Real on-chain bulk issuance is disabled to prevent simulated transaction creation. Connect an authorized university MetaMask wallet to anchor records on Sepolia.
            </span>
          </div>
          <button
            onClick={connectWallet}
            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-bold hover:bg-amber-100 shrink-0"
          >
            Connect MetaMask
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-8 shadow-card space-y-4 text-center">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-charcoal-border hover:border-forest/50 rounded-xl p-8 bg-background cursor-pointer transition-all space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-charcoal">
              Upload Student Batch (CSV or XLSX)
            </h3>
            <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto leading-relaxed">
              Drag and drop your exported graduation roster or click to browse files. AI Deduplication engine automatically evaluates every row against the global university database.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-charcoal-border rounded-lg text-xs font-mono text-forest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active batch loaded ({records.length} records ready)</span>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleRealUpload}
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />

        {/* Validation Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-background rounded-xl border border-charcoal-border text-left">
            <p className="text-[11px] text-charcoal-muted font-medium">Total Detected Records</p>
            <p className="font-serif text-xl font-bold text-charcoal">{records.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-left">
            <p className="text-[11px] text-emerald-800 font-medium">Valid Ready to Issue</p>
            <p className="font-serif text-xl font-bold text-emerald-900">{validCount}</p>
          </div>
          <div className="p-3 bg-background rounded-xl border border-charcoal-border text-left">
            <p className="text-[11px] text-charcoal-muted font-medium">Confirmed On-Chain</p>
            <p className="font-serif text-xl font-bold text-forest">{confirmedCount}</p>
          </div>
          <div className="p-3 bg-background rounded-xl border border-charcoal-border text-left">
            <p className="text-[11px] text-charcoal-muted font-medium">Validation Errors</p>
            <p className="font-serif text-xl font-bold text-charcoal">{invalidCount}</p>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-2xl border border-charcoal-border shadow-subtle overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal">
              Batch Records Preview & Execution
            </h3>
            <p className="text-xs text-charcoal-muted">
              Inspect student roster and track individual cryptographic transaction anchoring
            </p>
          </div>

          <button
            onClick={handleConfirmBatch}
            disabled={isProcessing || validCount === 0 || isDemoWallet}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-card transition-all disabled:opacity-50 shrink-0"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Anchoring Batch ({currentProcessingIndex !== null ? `Record ${currentProcessingIndex + 1}/${records.length}` : 'Processing'}...)...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Confirm & Issue All On-Chain ({validCount})</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-light/70 text-charcoal font-semibold border-y border-charcoal-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Credential ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Enrollment ID</th>
                <th className="py-3 px-4">Degree</th>
                <th className="py-3 px-4">Performance</th>
                <th className="py-3 px-4">On-Chain Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/50">
              {records.map((r, i) => (
                <tr key={i} className="hover:bg-charcoal-light/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-forest">
                    {r.credentialId}
                  </td>
                  <td className="py-3 px-4 font-medium text-charcoal">
                    <div>{r.studentName}</div>
                    <div className="text-[10px] text-charcoal-muted font-mono">{r.studentEmail}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-charcoal-muted">
                    {r.studentEnrollmentId}
                  </td>
                  <td className="py-3 px-4 text-charcoal">
                    {r.degreeName}
                  </td>
                  <td className="py-3 px-4 font-medium text-charcoal">
                    {r.cgpaOrGrade}
                  </td>
                  <td className="py-3 px-4">
                    {r.status === 'CONFIRMED' ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmed (Block #{r.blockNumber})
                        </span>
                        {r.txHash && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${r.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-forest underline flex items-center gap-1"
                          >
                            <span>Tx: {r.txHash.slice(0, 8)}...</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ) : r.status === 'SIGNING' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-powder-light text-powder-dark border border-powder animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Signing in MetaMask...
                      </span>
                    ) : r.status === 'FAILED' ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Failed
                        </span>
                        {r.errorMsg && (
                          <div className="text-[9px] text-rose-600 truncate max-w-[150px]" title={r.errorMsg}>
                            {r.errorMsg}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
