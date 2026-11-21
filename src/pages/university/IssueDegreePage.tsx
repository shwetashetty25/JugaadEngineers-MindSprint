import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useToast } from '../../context/ToastContext';
import { useWallet } from '../../contexts/WalletContext';
import { Modal } from '../../components/common/Modal';
import { ethers } from 'ethers';
import { normalizeCredentialId, encodeCredentialIdToBytes32 } from '../../utils/credentialEncoder';
import {
  FilePlus2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRight,
  Info,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const IssueDegreePage: React.FC = () => {
  const { universities, issueCredential, getCredentialById } = useCredentialStore();
  const currentUniv = universities[0]; // IIT Delhi
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const { account, connectWallet, isSepolia, isDemoWallet, hasMetaMask, issueCredentialOnChain } = useWallet();

  const [studentName, setStudentName] = useState('Ananya Sen Sharma');
  const [studentEmail, setStudentEmail] = useState('ananya.sen@alumni.iitd.ac.in');
  const [studentEnrollmentId, setStudentEnrollmentId] = useState('2020CS10982');
  const [degreeName, setDegreeName] = useState('Bachelor of Technology in Computer Science & Engineering');
  const [department, setDepartment] = useState('Department of Computer Science and Engineering');
  const [graduationYear, setGraduationYear] = useState<number>(2024);
  const [issueDate, setIssueDate] = useState('2024-06-25');
  const [cgpaOrGrade, setCgpaOrGrade] = useState('9.48 / 10.0 (First Class with Distinction)');
  const [credentialId, setCredentialId] = useState(`VDX-2024-IITD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [fileSizeText, setFileSizeText] = useState<string>('');
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateId = () => {
    setCredentialId(`VDX-2024-IITD-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate PDF extension and MIME type
    const isPdfName = file.name.toLowerCase().endsWith('.pdf');
    const isPdfType = file.type === 'application/pdf';
    if (!isPdfName && !isPdfType) {
      error('Invalid File Type', 'Please upload an authentic PDF academic document (.pdf).');
      return;
    }

    try {
      setIsHashing(true);
      setUploadedFile(file);
      setUploadedFileName(file.name);

      const sizeKb = (file.size / 1024).toFixed(1);
      const sizeText = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${sizeKb} KB`;
      setFileSizeText(sizeText);

      // Read real binary array buffer from uploaded file
      const buffer = await file.arrayBuffer();

      // Cryptographic SHA-256 binary digest via Web Crypto API (SubtleCrypto)
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      setDocumentHash(hashHex);
      success('PDF Cryptographically Hashed', `SHA-256: ${hashHex.slice(0, 10)}...${hashHex.slice(-6)}`);
    } catch (err: any) {
      error('Hashing Error', err.message || 'Failed to compute SHA-256 hash from file buffer.');
      setDocumentHash(null);
      setUploadedFile(null);
      setUploadedFileName('');
    } finally {
      setIsHashing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !studentEnrollmentId || !degreeName) {
      error('Incomplete Fields', 'Please fill in all mandatory degree issuance fields.');
      return;
    }
    if (!uploadedFile || !documentHash) {
      error('PDF Document Required', 'Please upload an official PDF degree parchment before issuing.');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmIssue = async () => {
    if (!documentHash) {
      error('Document Hash Missing', 'Real binary document hash not computed. Please re-upload the PDF.');
      return;
    }

    setIsSubmitting(true);
    const cleanId = normalizeCredentialId(credentialId);

    // Duplicate Check: Verify if ID is already issued in local registry
    const existingCred = getCredentialById(cleanId);
    if (existingCred) {
      error('Duplicate Credential ID', `A credential with ID "${cleanId}" has already been issued locally.`);
      setIsSubmitting(false);
      return;
    }

    if (isDemoWallet) {
      error(
        'Real Issuance Blocked in Demo Mode',
        'The Demo Registrar Wallet (0x7099...79C8) cannot broadcast live transactions to Ethereum Sepolia. Please connect an authorized university wallet via MetaMask.'
      );
      setIsSubmitting(false);
      return;
    }

    if (!hasMetaMask) {
      error(
        'MetaMask Required',
        'MetaMask is required to sign live transactions on Ethereum Sepolia. Please install the MetaMask extension from metamask.io.'
      );
      setIsSubmitting(false);
      return;
    }

    // Deterministic canonical metadata hash (RFC 8785 key sorted)
    const canonicalMetadata = {
      credentialId: cleanId,
      degreeName,
      department,
      graduationYear: Number(graduationYear),
      institution: currentUniv.name,
      issueDate,
      studentName,
      studentNumber: studentEnrollmentId,
    };
    const canonicalMetadataString = JSON.stringify(canonicalMetadata, Object.keys(canonicalMetadata).sort());
    const metadataHash = ethers.sha256(ethers.toUtf8Bytes(canonicalMetadataString));

    let txHash: string | undefined = undefined;
    let blockNumber: number | undefined = undefined;

    try {
      if (!account) {
        error('Wallet Required', 'Please connect your university MetaMask wallet on Ethereum Sepolia before issuing.');
        setIsSubmitting(false);
        return;
      }

      info('MetaMask Prompt', 'Please sign the issueCredential() transaction in your MetaMask wallet...');
      const bytesCredId = encodeCredentialIdToBytes32(cleanId);
      const onChainResult = await issueCredentialOnChain(bytesCredId, documentHash, metadataHash);
      txHash = onChainResult.txHash;
      blockNumber = onChainResult.blockNumber;
      setLastTxHash(txHash);

      // 2. Persist record to credential store with real binary documentHash
      const created = issueCredential({
        id: cleanId,
        studentName,
        studentEmail,
        studentEnrollmentId,
        degreeName,
        degreeType: degreeName.toLowerCase().includes('master') || degreeName.toLowerCase().includes('mba') ? 'Master' : 'Bachelor',
        department,
        universityId: currentUniv.id,
        universityName: currentUniv.name,
        graduationYear: Number(graduationYear),
        issueDate,
        cgpaOrGrade,
        status: 'Active',
        documentHash,
        merkleRoot: metadataHash,
        blockNumber,
        metadata: {
          specialization: 'Core Systems',
          honors: 'Distinction',
          blockchainTxHash: txHash,
        },
      });

      setIsSubmitting(false);
      setIsConfirmModalOpen(false);

      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#F45B0B', '#A8C9C8', '#FFFFFF', '#141A1B'],
      });

      success('Credential Issued & Anchored!', `Degree ${created.id} conferred to ${created.studentName}`);
      navigate(`/university/credentials/${created.id}`);
    } catch (err: any) {
      setIsSubmitting(false);
      error('Issuance Failed', err.message || 'Could not complete blockchain transaction.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Issue Digital Academic Degree
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Mint a tamper-evident digital credential directly to the student's VeriDegree X wallet.
          </p>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
          account && isSepolia && !isDemoWallet
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : isDemoWallet
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-charcoal-light border-charcoal-border text-charcoal-muted'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            account && isSepolia && !isDemoWallet
              ? 'bg-emerald-500 animate-pulse'
              : isDemoWallet
              ? 'bg-amber-500'
              : 'bg-charcoal-muted'
          }`} />
          <span>
            {account && isSepolia && !isDemoWallet
              ? 'Ethereum Sepolia • Live Ledger Active'
              : isDemoWallet
              ? 'Demo Mode • Read-Only Simulation'
              : 'MetaMask Required for Issuance'}
          </span>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Student Information */}
          <div className="md:col-span-2 pb-2 border-b border-charcoal-border/60">
            <h3 className="font-serif font-bold text-base text-charcoal">
              1. Student Details
            </h3>
            <p className="text-xs text-charcoal-muted">
              Official student academic registry information
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Student Full Name *
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
              placeholder="e.g. Aarav Sharma"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Student Institutional / Personal Email *
            </label>
            <input
              type="email"
              required
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
              placeholder="e.g. student@alumni.iitd.ac.in"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Enrollment / Roll Number *
            </label>
            <input
              type="text"
              required
              value={studentEnrollmentId}
              onChange={(e) => setStudentEnrollmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all font-mono"
              placeholder="e.g. 2020CS10492"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Department / Academic Faculty *
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
              placeholder="e.g. Department of Computer Science & Engineering"
            />
          </div>

          {/* Section 2: Degree Information */}
          <div className="md:col-span-2 pt-4 pb-2 border-b border-charcoal-border/60">
            <h3 className="font-serif font-bold text-base text-charcoal">
              2. Degree & Award Specification
            </h3>
            <p className="text-xs text-charcoal-muted">
              Academic honors, performance metric, and conferral date
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Conferred Degree Title *
            </label>
            <input
              type="text"
              required
              value={degreeName}
              onChange={(e) => setDegreeName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
              placeholder="e.g. Bachelor of Technology in Computer Science & Engineering"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Graduation Year *
            </label>
            <input
              type="number"
              required
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Conferral / Issue Date *
            </label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              CGPA / Honors / Grade *
            </label>
            <input
              type="text"
              required
              value={cgpaOrGrade}
              onChange={(e) => setCgpaOrGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
              placeholder="e.g. 9.48 / 10.0 (First Class with Distinction)"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-charcoal">
                Unique Credential ID *
              </label>
              <button
                type="button"
                onClick={handleGenerateId}
                className="text-xs text-forest hover:underline font-mono"
              >
                Auto-generate
              </button>
            </div>
            <input
              type="text"
              required
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all font-mono font-semibold text-forest"
            />
          </div>

          {/* Section 3: Document Upload Preview */}
          <div className="md:col-span-2 pt-4 pb-2 border-b border-charcoal-border/60">
            <h3 className="font-serif font-bold text-base text-charcoal">
              3. Degree Parchment Scan / Supporting Artifact
            </h3>
            <p className="text-xs text-charcoal-muted">
              Attach the official degree parchment or transcript PDF to compute its cryptographic SHA-256 fingerprint
            </p>
          </div>

          <div className="md:col-span-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-charcoal-border hover:border-forest/50 rounded-xl p-6 text-center bg-background cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-charcoal-muted mx-auto mb-2" />
              <p className="text-xs font-semibold text-charcoal">
                {isHashing ? 'Computing Cryptographic SHA-256 Digest...' : 'Click or drag & drop degree parchment PDF'}
              </p>
              <p className="text-[11px] text-charcoal-muted mt-1">
                Supported format: Official PDF (.pdf) • Real Binary ArrayBuffer Hashing
              </p>
              {uploadedFileName && documentHash && (
                <div className="mt-3 inline-flex flex-col sm:flex-row items-center gap-2 px-3.5 py-2 bg-white border border-charcoal-border rounded-lg text-xs font-mono text-forest shadow-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                    <span>{uploadedFileName}</span>
                    {fileSizeText && <span className="text-[10px] text-charcoal-muted">({fileSizeText})</span>}
                  </div>
                  <div className="hidden sm:inline text-charcoal-muted">•</div>
                  <span className="text-[11px] text-charcoal-dark break-all" title={documentHash}>
                    SHA-256: {documentHash.slice(0, 10)}...{documentHash.slice(-8)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/university/credentials')}
            className="px-4 py-2.5 rounded-xl border border-charcoal-border text-xs font-semibold text-charcoal hover:bg-charcoal-light transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-card transition-all"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Issue Degree Credential</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Degree Issuance"
        description="Please review the academic credential parameters before finalizing issuance."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-xl border border-charcoal-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Student:</span>
              <strong className="text-charcoal">{studentName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Email:</span>
              <span className="font-mono">{studentEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Enrollment ID:</span>
              <span className="font-mono font-semibold">{studentEnrollmentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Degree:</span>
              <strong className="text-charcoal">{degreeName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Performance:</span>
              <span className="text-forest font-semibold">{cgpaOrGrade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Assigned Credential ID:</span>
              <span className="font-mono font-bold text-forest">{credentialId}</span>
            </div>
            {documentHash && (
              <div className="flex justify-between items-center pt-1 border-t border-charcoal-border/40">
                <span className="text-charcoal-muted">Binary PDF SHA-256:</span>
                <span className="font-mono text-[10px] text-forest font-bold truncate max-w-[220px]" title={documentHash}>
                  {documentHash}
                </span>
              </div>
            )}
          </div>

          {/* Web3 Blockchain Issuer Callout */}
          <div className="p-3.5 bg-powder-light/60 rounded-xl border border-powder text-xs text-charcoal space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-powder-dark uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange" />
                <span>Blockchain Attestation</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-orange border border-powder">
                Ethereum Sepolia
              </span>
            </div>

            <div className="text-[11px] font-mono text-charcoal-muted space-y-1">
              <div className="flex justify-between items-center">
                <span>Signing Authority:</span>
                <span className={`font-bold ${isDemoWallet ? 'text-amber-600' : 'text-charcoal'}`}>
                  {account
                    ? `${account.slice(0, 8)}...${account.slice(-6)} ${isDemoWallet ? '(Demo Wallet - No Real Minting)' : '(Authorized Wallet)'}`
                    : 'MetaMask Not Connected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Contract Target:</span>
                <span className="text-charcoal truncate max-w-[200px]" title="0x98D5a89f0fbdCD2Af870380fE5094d833Fd60dCc">
                  0x98D5...0dCc (Sepolia)
                </span>
              </div>
            </div>

            {(!account || isDemoWallet) && (
              <div className="pt-1">
                {isDemoWallet && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-2 font-sans">
                    ⚠️ Demo Registrar Wallet is connected. Real on-chain issuance is disabled to prevent fake transaction creation. Connect an authorized MetaMask wallet to mint on Sepolia.
                  </p>
                )}
                <button
                  type="button"
                  onClick={connectWallet}
                  className="w-full py-1.5 px-3 rounded-lg bg-white border border-powder hover:border-orange text-xs font-bold text-charcoal flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <span>🦊 Connect University MetaMask</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-charcoal-light rounded-lg"
            >
              Back to Edit
            </button>
            <button
              onClick={handleConfirmIssue}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-orange hover:bg-orange-hover rounded-xl shadow-card shadow-orange/20 hover:shadow-orange-glow transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <span>Broadcasting to Sepolia...</span>
              ) : (
                <>
                  <span>{account ? 'Sign & Mint on Sepolia' : 'Anchor Credential'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

