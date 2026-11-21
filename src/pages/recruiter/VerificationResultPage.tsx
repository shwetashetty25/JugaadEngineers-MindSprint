import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { CertificateDocument } from '../../components/common/CertificateDocument';
import { Badge } from '../../components/common/Badge';
import {
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  Building,
  GraduationCap,
  Calendar,
  Lock,
  ArrowLeft,
  Copy,
  Check,
  Printer,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Upload,
  FileCheck2,
  XCircle,
  Clock,
  Sparkles,
  FileWarning
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ethers, Contract } from 'ethers';
import { DEFAULT_REGISTRY_ADDRESS, REGISTRY_ABI, DEFAULT_SEPOLIA_RPC } from '../../contexts/WalletContext';
import { normalizeCredentialId, encodeCredentialIdToBytes32 } from '../../utils/credentialEncoder';

type VerificationState =
  | 'LOADING'
  | 'ON_CHAIN_RECORD_VERIFIED' // Credential exists & authentic on-chain, but PDF was not yet uploaded/checked
  | 'FULL_DOCUMENT_VERIFIED'   // Credential exists, authentic, AND uploaded PDF matches on-chain hash 100%
  | 'REVOKED'                  // Credential exists, but revoked
  | 'INVALID'                  // Credential invalid or PDF hash mismatch
  | 'UNAUTHORIZED_ISSUER'      // Issuer wallet is not authorized
  | 'NOT_FOUND'                // Credential does not exist on-chain
  | 'UNABLE_TO_VERIFY';        // RPC/Network failure

interface OnChainCredentialData {
  exists: boolean;
  isAuthentic: boolean;
  isRevoked: boolean;
  issuer: string;
  documentHash: string;
  metadataHash: string;
  issuedAt: number;
  revokedAt: number;
  isIssuerAuthorized: boolean;
}

export const VerificationResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCredentialById, getVerificationsForCredential } = useCredentialStore();
  const { success, error } = useToast();

  const [copied, setCopied] = useState(false);
  const [verificationState, setVerificationState] = useState<VerificationState>('LOADING');
  const [onChainData, setOnChainData] = useState<OnChainCredentialData | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // PDF Audit & Binary Hash Comparison State
  const [auditFileName, setAuditFileName] = useState<string | null>(null);
  const [auditDocHash, setAuditDocHash] = useState<string | null>(null);
  const [hashMatchStatus, setHashMatchStatus] = useState<'NONE' | 'MATCH' | 'MISMATCH'>('NONE');
  const [isAuditingFile, setIsAuditingFile] = useState(false);
  const fileAuditInputRef = useRef<HTMLInputElement>(null);

  const cleanId = normalizeCredentialId(id || '');
  const localCredential = getCredentialById(cleanId);
  const verifications = getVerificationsForCredential(cleanId);
  const latestVerification = verifications[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanId);
    setCopied(true);
    success('Copied', `Credential ID ${cleanId} copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Perform genuine on-chain verification query directly against Ethereum Sepolia
  const performOnChainVerification = async () => {
    if (!cleanId) {
      setVerificationState('NOT_FOUND');
      return;
    }

    try {
      setVerificationState('LOADING');
      setNetworkError(null);

      // Connect to Ethereum Sepolia via reliable public read-only JSON-RPC node.
      // Recruiter verification is fully public and never requires MetaMask or wallet interaction.
      const provider = new ethers.JsonRpcProvider(DEFAULT_SEPOLIA_RPC);

      const contract = new Contract(DEFAULT_REGISTRY_ADDRESS, REGISTRY_ABI, provider);

      // Deterministic bytes32 ID conversion
      const bytesId = encodeCredentialIdToBytes32(cleanId);

      // Call on-chain verifyCredential(bytes32) on deployed registry
      const result = await contract.verifyCredential(bytesId);

      const exists: boolean = Boolean(result[0] ?? result.exists);
      const isAuthentic: boolean = Boolean(result[1] ?? result.isAuthentic);
      const isRevoked: boolean = Boolean(result[2] ?? result.isRevoked);
      const issuer: string = String(result[3] ?? result.issuer);
      const documentHash: string = String(result[4] ?? result.documentHash);
      const metadataHash: string = String(result[5] ?? result.metadataHash);
      const issuedAt: number = Number(result[6] ?? result.issuedAt);
      const revokedAt: number = Number(result[7] ?? result.revokedAt);

      // STRICT ORDER OF CHECKS:
      // 1. Credential existence
      if (!exists) {
        setVerificationState('NOT_FOUND');
        setOnChainData(null);
        return;
      }

      // Check whether issuer is an active authorized institution on-chain
      let isIssuerAuthorized = false;
      try {
        isIssuerAuthorized = await contract.isUniversityRegistered(issuer);
      } catch (authErr) {
        console.warn('Could not query isUniversityRegistered:', authErr);
      }

      const chainData: OnChainCredentialData = {
        exists,
        isAuthentic,
        isRevoked,
        issuer,
        documentHash,
        metadataHash,
        issuedAt,
        revokedAt,
        isIssuerAuthorized,
      };

      setOnChainData(chainData);

      // 2. Revocation status
      if (isRevoked) {
        setVerificationState('REVOKED');
        return;
      }

      // 3. Issuer authorization
      if (!isIssuerAuthorized) {
        setVerificationState('UNAUTHORIZED_ISSUER');
        return;
      }

      // 4. Contract authenticity result
      if (!isAuthentic) {
        setVerificationState('INVALID');
        return;
      }

      // 5. PDF hash match check (if candidate PDF was already uploaded in this session)
      if (hashMatchStatus === 'MISMATCH') {
        setVerificationState('INVALID');
      } else if (hashMatchStatus === 'MATCH') {
        setVerificationState('FULL_DOCUMENT_VERIFIED');
      } else {
        // Document has not yet been supplied for bit-for-bit comparison
        setVerificationState('ON_CHAIN_RECORD_VERIFIED');
      }
    } catch (err: any) {
      console.error('On-chain verification query failed:', err);
      setNetworkError(err.message || 'Unable to connect to Ethereum Sepolia RPC node.');
      setVerificationState('UNABLE_TO_VERIFY');
    }
  };

  useEffect(() => {
    performOnChainVerification();
  }, [cleanId]);

  // Recruiter PDF Binary Audit Handler
  const handleAuditFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      error('Invalid File Type', 'Please upload an authentic PDF academic document (.pdf) for cryptographic auditing.');
      return;
    }

    try {
      setIsAuditingFile(true);
      setAuditFileName(file.name);

      // Read raw binary buffer and calculate SHA-256 digest
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const calculatedHash = '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      setAuditDocHash(calculatedHash);

      if (onChainData && onChainData.documentHash) {
        const matches = calculatedHash.toLowerCase() === onChainData.documentHash.toLowerCase();
        if (matches) {
          setHashMatchStatus('MATCH');
          if (!onChainData.isRevoked && onChainData.isIssuerAuthorized && onChainData.isAuthentic) {
            setVerificationState('FULL_DOCUMENT_VERIFIED');
          }
          success('Cryptographic Match Confirmed!', 'The uploaded PDF binary content matches the on-chain SHA-256 fingerprint bit-for-bit.');
        } else {
          setHashMatchStatus('MISMATCH');
          setVerificationState('INVALID');
          error('Document Hash Mismatch', 'The uploaded PDF does NOT match the cryptographic fingerprint anchored on Ethereum Sepolia!');
        }
      }
    } catch (err: any) {
      error('Audit Error', err.message || 'Failed to compute SHA-256 hash from file.');
    } finally {
      setIsAuditingFile(false);
    }
  };

  // 1. STATE: LOADING SKELETON
  if (verificationState === 'LOADING') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-16 animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-powder-light text-orange flex items-center justify-center mx-auto shadow-subtle animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-powder-light text-powder-dark border border-powder text-xs font-mono font-semibold">
            <span>Querying Sepolia Consensus (Chain ID: 11155111)...</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Reading Ethereum Ledger State
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto">
            Calling <code className="font-mono text-charcoal">verifyCredential()</code> on registry{' '}
            <code className="font-mono text-orange">{DEFAULT_REGISTRY_ADDRESS.slice(0, 10)}...{DEFAULT_REGISTRY_ADDRESS.slice(-6)}</code>
          </p>
        </div>
      </div>
    );
  }

  // 2. STATE: UNABLE TO VERIFY / RPC NETWORK ERROR
  if (verificationState === 'UNABLE_TO_VERIFY') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12 animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-subtle">
          <XCircle className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-semibold">
            <span>NETWORK / RPC ERROR</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-charcoal">
            Unable to Verify on Blockchain
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed">
            Could not query the Ethereum Sepolia node. {networkError}
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-charcoal-border shadow-subtle text-left max-w-md mx-auto space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Target Network:</span>
            <span className="text-charcoal">Ethereum Sepolia (11155111)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Registry Contract:</span>
            <span className="text-charcoal truncate max-w-[200px]">{DEFAULT_REGISTRY_ADDRESS}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={performOnChainVerification}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Blockchain Query</span>
          </button>
          <Link
            to="/recruiter/verify"
            className="px-4 py-2.5 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-xl transition-all"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // 3. STATE: NOT FOUND / UNREGISTERED ON-CHAIN
  if (verificationState === 'NOT_FOUND') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12 animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100/90 text-amber-700 flex items-center justify-center mx-auto shadow-subtle">
          <AlertCircle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <span>NOT FOUND / UNREGISTERED ON-CHAIN</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-charcoal">
            Credential Not Located on Blockchain
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed">
            The queried credential identifier <strong className="font-mono text-charcoal">{cleanId}</strong> does not exist
            on the Ethereum Sepolia <code className="font-mono text-orange">AcademicCredentialRegistry</code> contract.
          </p>
        </div>

        {/* Explicit Demo Simulation Notice */}
        {(cleanId.includes('VDX-2024-IITD-0891') || cleanId.includes('VDX-2023-IITD-0104') || cleanId.includes('VDX-')) && (
          <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-300 shadow-subtle text-left max-w-lg mx-auto space-y-1.5">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>DEMO / SIMULATED RECORD NOTICE</span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              Identifier <code className="font-mono font-bold text-amber-950">{cleanId}</code> is a local client-side demonstration record. It has not been broadcasted as a live transaction to the Ethereum Sepolia smart contract (<code className="font-mono text-[11px] text-amber-950">{DEFAULT_REGISTRY_ADDRESS}</code>). Because live verification reads directly from decentralized Sepolia consensus, it accurately reports <strong>NOT_FOUND</strong>.
            </p>
          </div>
        )}

        <div className="p-6 bg-white rounded-2xl border border-charcoal-border shadow-subtle text-left space-y-3 max-w-lg mx-auto">
          <h3 className="font-serif font-bold text-sm text-charcoal">
            Registry Verification Insights:
          </h3>
          <ul className="text-xs text-charcoal-muted space-y-2 list-disc pl-4">
            <li>Contract queried: <span className="font-mono text-charcoal">{DEFAULT_REGISTRY_ADDRESS}</span> on Sepolia.</li>
            <li>No on-chain issuance record or fingerprint was registered under this identifier.</li>
            <li>Confirm if the conferring institution has completed batch ledger publishing.</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={performOnChainVerification}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-check Ledger</span>
          </button>
          <Link
            to="/recruiter/verify"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Verify Another Credential</span>
          </Link>
        </div>
      </div>
    );
  }

  // 4. MAIN RESULTS VIEW (ON_CHAIN_RECORD_VERIFIED, FULL_DOCUMENT_VERIFIED, REVOKED, INVALID, UNAUTHORIZED_ISSUER)
  const isRevoked = verificationState === 'REVOKED';
  const isInvalid = verificationState === 'INVALID';
  const isUnauthorized = verificationState === 'UNAUTHORIZED_ISSUER';
  const isFullVerified = verificationState === 'FULL_DOCUMENT_VERIFIED';
  const isOnChainRecordVerified = verificationState === 'ON_CHAIN_RECORD_VERIFIED';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top back navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-charcoal-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/recruiter/verify')}
            className="p-2 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
              On-Chain Verification Result
            </h1>
            <p className="text-xs font-mono text-charcoal-muted mt-0.5">
              Target Reference: <span className="text-charcoal font-bold">{cleanId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={performOnChainVerification}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-lg transition-all shadow-subtle"
            title="Refresh on-chain state"
          >
            <RefreshCw className="w-3.5 h-3.5 text-charcoal-muted" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-lg transition-all shadow-subtle"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy ID'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-lg transition-all shadow-subtle"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Audit Proof</span>
          </button>
        </div>
      </div>

      {/* RESULT BANNER 1: REVOKED */}
      {isRevoked && (
        <div className="p-6 bg-red-50 border-2 border-red-300 rounded-2xl shadow-elevated space-y-4">
          <div className="flex items-center gap-3 text-red-700">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-2xl tracking-tight text-red-900">
                  CREDENTIAL OFFICIALLY REVOKED
                </span>
                <Badge status="REVOKED" size="sm" />
              </div>
              <p className="text-xs text-red-800 mt-0.5 font-medium">
                This academic credential has been permanently revoked by the issuing university on Ethereum Sepolia.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-xl border border-red-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-red-900 font-semibold">On-Chain Revocation Status:</span>
              <strong className="text-red-900 font-bold">Decree Recorded in Smart Contract</strong>
            </div>
            {onChainData?.revokedAt ? (
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Revocation Block Timestamp:</span>
                <span className="font-mono text-charcoal">
                  {new Date(onChainData.revokedAt * 1000).toUTCString()}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Conferring Authority:</span>
              <span className="font-mono text-charcoal">{onChainData?.issuer}</span>
            </div>
          </div>
        </div>
      )}

      {/* RESULT BANNER 2: UNAUTHORIZED ISSUER */}
      {isUnauthorized && (
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-elevated space-y-3">
          <div className="flex items-center gap-3 text-amber-900">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <span className="font-serif font-black text-2xl tracking-tight text-amber-950">
                UNAUTHORIZED ISSUER WALLET
              </span>
              <p className="text-xs text-amber-800 mt-0.5">
                The wallet that issued this credential is not registered or has been deactivated by the admin.
              </p>
            </div>
          </div>
          <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Signing Address:</span>
              <span className="text-charcoal font-bold">{onChainData?.issuer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">University Registry Status:</span>
              <span className="text-amber-800 font-bold">NOT_ACTIVE / UNAUTHORIZED</span>
            </div>
          </div>
        </div>
      )}

      {/* RESULT BANNER 3: INVALID / HASH MISMATCH */}
      {isInvalid && (
        <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-elevated space-y-3">
          <div className="flex items-center gap-3 text-rose-900">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7 text-rose-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-2xl tracking-tight text-rose-950">
                  DOCUMENT HASH MISMATCH / INVALID
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                  TAMPER DETECTED
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                The cryptographic SHA-256 fingerprint of the supplied document differs from the immutable record on Ethereum Sepolia.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RESULT BANNER 4A: ON-CHAIN RECORD VERIFIED (DOCUMENT NOT ATTACHED YET) */}
      {isOnChainRecordVerified && (
        <div className="p-6 bg-sky-50 border-2 border-sky-300 rounded-2xl shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 text-sky-700">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-sky-950">
                  ON-CHAIN RECORD VERIFIED
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  DOCUMENT NOT CHECKED
                </span>
              </div>
              <p className="text-xs text-sky-800 mt-0.5">
                Authentic credential anchored by authorized university issuer on Ethereum Sepolia. (Attach applicant's PDF below to audit byte-level authenticity).
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-sky-800/80 font-mono">
              On-Chain Registration Time
            </p>
            <p className="font-mono text-xs font-semibold text-sky-950">
              {onChainData?.issuedAt ? new Date(onChainData.issuedAt * 1000).toLocaleString() : 'Confirmed'}
            </p>
          </div>
        </div>
      )}

      {/* RESULT BANNER 4B: FULL DOCUMENT VERIFIED (BOTH ON-CHAIN & PDF HASH MATCH) */}
      {isFullVerified && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-emerald-950">
                  FULL DOCUMENT VERIFIED & 100% MATCH
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-400">
                  BIT-FOR-BIT IDENTICAL
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Both Ethereum Sepolia consensus and uploaded PDF SHA-256 fingerprint verified with zero discrepancy.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-emerald-800/80 font-mono">
              Cryptographic Audit
            </p>
            <p className="font-mono text-xs font-semibold text-emerald-950">
              SHA-256 Match Confirmed
            </p>
          </div>
        </div>
      )}

      {/* CRYPTOGRAPHIC PDF AUDIT DROPZONE (FOR RECRUITERS) */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-charcoal-border/70 pb-3 gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-charcoal flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-forest" />
              <span>Independent Document Binary Audit</span>
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Upload the applicant's raw degree PDF to verify if its SHA-256 byte digest matches the on-chain ledger fingerprint bit-for-bit.
            </p>
          </div>
          {hashMatchStatus === 'MATCH' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>100% Bit-for-Bit Match</span>
            </span>
          )}
          {hashMatchStatus === 'MISMATCH' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 border border-red-300 text-xs font-bold shrink-0">
              <XCircle className="w-3.5 h-3.5 text-red-700" />
              <span>Tamper Detected</span>
            </span>
          )}
          {hashMatchStatus === 'NONE' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-light text-charcoal-muted border border-charcoal-border text-xs font-mono font-medium shrink-0">
              <span>DOCUMENT NOT CHECKED</span>
            </span>
          )}
        </div>

        <input
          type="file"
          ref={fileAuditInputRef}
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleAuditFileUpload(e.target.files[0]);
            }
          }}
        />

        <div
          onClick={() => fileAuditInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) {
              handleAuditFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className="border-2 border-dashed border-charcoal-border hover:border-forest/50 rounded-xl p-5 text-center bg-background cursor-pointer transition-colors"
        >
          <Upload className="w-6 h-6 text-charcoal-muted mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-charcoal">
            {isAuditingFile ? 'Computing Real SHA-256 Binary Digest...' : 'Drag & drop or click to upload PDF for cryptographic comparison'}
          </p>
          <p className="text-[11px] text-charcoal-muted mt-0.5">
            Client-side Web Crypto SubtleCrypto binary arrayBuffer audit (No file leaves your machine)
          </p>
        </div>

        {auditDocHash && (
          <div className="p-3 bg-charcoal-light/70 rounded-xl border border-charcoal-border space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-charcoal-muted">Uploaded File:</span>
              <span className="text-charcoal font-semibold">{auditFileName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-charcoal-muted">Uploaded SHA-256:</span>
              <span className="text-charcoal break-all font-bold">{auditDocHash}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-charcoal-border/50">
              <span className="text-charcoal-muted">On-Chain Sepolia Fingerprint:</span>
              <span className="text-forest break-all font-bold">{onChainData?.documentHash}</span>
            </div>
          </div>
        )}
      </div>

      {/* CORE CREDENTIAL VERIFICATION BREAKDOWN CARD */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-lg text-charcoal border-b border-charcoal-border/70 pb-2 flex items-center justify-between">
          <span>Cryptographic Ledger Attestation</span>
          <span className="text-xs font-mono font-normal text-charcoal-muted">
            Registry: <code className="text-forest font-bold">{DEFAULT_REGISTRY_ADDRESS.slice(0, 8)}...{DEFAULT_REGISTRY_ADDRESS.slice(-6)}</code>
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-background rounded-xl border border-charcoal-border/70 space-y-1">
            <span className="text-[11px] text-charcoal-muted uppercase tracking-wider font-mono">
              Candidate Academic Record
            </span>
            <p className="font-serif font-bold text-base text-charcoal">
              {localCredential?.studentName || 'Verified Scholar Claim'}
            </p>
            <p className="text-[11px] font-mono text-charcoal-muted">
              Enrollment: {localCredential?.studentEnrollmentId || cleanId}
            </p>
          </div>

          <div className="p-3.5 bg-background rounded-xl border border-charcoal-border/70 space-y-1">
            <span className="text-[11px] text-charcoal-muted uppercase tracking-wider font-mono">
              Authorized Issuer Wallet
            </span>
            <p className="font-mono font-bold text-xs text-charcoal break-all">
              {onChainData?.issuer}
            </p>
            <p className="text-[11px] text-forest font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{onChainData?.isIssuerAuthorized ? 'Authorized Institutional Issuer' : 'Unauthorized Issuer'}</span>
            </p>
          </div>

          <div className="p-3.5 bg-background rounded-xl border border-charcoal-border/70 space-y-1">
            <span className="text-[11px] text-charcoal-muted uppercase tracking-wider font-mono">
              Conferred Degree Title
            </span>
            <p className="font-semibold text-charcoal">
              {localCredential?.degreeName || 'Official Conferred Degree'}
            </p>
            <p className="text-[11px] text-charcoal-muted">
              {localCredential?.department || 'Academic Senate Registry'}
            </p>
          </div>

          <div className="p-3.5 bg-background rounded-xl border border-charcoal-border/70 space-y-1">
            <span className="text-[11px] text-charcoal-muted uppercase tracking-wider font-mono">
              Conferral & Status
            </span>
            <p className="font-semibold text-forest">
              {localCredential?.graduationYear ? `Class of ${localCredential.graduationYear}` : 'Verified Academic Tenure'}
            </p>
            <p className="text-[11px] text-charcoal">
              On-Chain State: <strong className="font-mono">{isRevoked ? 'REVOKED' : 'ACTIVE_AUTHENTIC'}</strong>
            </p>
          </div>
        </div>

        {/* Cryptographic Ledger Breakdown Details */}
        <div className="p-4 bg-charcoal-light/70 rounded-xl border border-charcoal-border text-[11px] font-mono space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between text-charcoal-muted gap-1">
            <span className="shrink-0">On-Chain Document SHA-256:</span>
            <span className="text-charcoal font-semibold break-all">{onChainData?.documentHash}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between text-charcoal-muted gap-1">
            <span className="shrink-0">On-Chain Canonical Metadata Hash:</span>
            <span className="text-charcoal break-all">{onChainData?.metadataHash}</span>
          </div>
          <div className="flex justify-between items-center text-charcoal-muted pt-2 border-t border-charcoal-border/50">
            <span>Ledger Proof:</span>
            <div className="flex items-center gap-2">
              <a
                href={`https://sepolia.etherscan.io/address/${DEFAULT_REGISTRY_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-powder-dark hover:text-orange underline font-mono"
              >
                <span>View Registry Contract on Etherscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Certified Document Preview (if local metadata is present) */}
      {localCredential && (
        <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-3">
          <h3 className="font-serif font-bold text-lg text-charcoal">
            Conferred Degree Document Preview
          </h3>
          <CertificateDocument credential={localCredential} showActions={false} />
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Link
          to="/recruiter/verify"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Verify Another Degree</span>
        </Link>

        <Link
          to="/recruiter/history"
          className="px-4 py-2 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-xl transition-all shadow-subtle"
        >
          View Verification History Log
        </Link>
      </div>
    </div>
  );
};
