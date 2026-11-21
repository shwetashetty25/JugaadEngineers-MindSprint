import React, { useRef } from 'react';
import { Credential } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Copy, Check, ShieldAlert, Award } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CertificateProps {
  credential: Credential;
  showActions?: boolean;
}

export const CertificateDocument: React.FC<CertificateProps> = ({
  credential,
  showActions = true
}) => {
  const { success } = useToast();
  const [copied, setCopied] = React.useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const verificationUrl = `${window.location.origin}/recruiter/verify?id=${encodeURIComponent(
    credential.id
  )}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(credential.id);
    setCopied(true);
    success('Copied to Clipboard', `Credential ID ${credential.id} copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isRevoked = credential.status === 'Revoked';

  return (
    <div className="space-y-4">
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono text-charcoal-muted">
            <span>ID:</span>
            <span className="font-semibold text-charcoal px-2 py-0.5 bg-charcoal-light rounded border border-charcoal-border">
              {credential.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal bg-white border border-charcoal-border rounded-lg hover:bg-charcoal-light transition-all shadow-subtle"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-forest hover:bg-forest-hover rounded-lg transition-all shadow-subtle"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download</span>
            </button>
          </div>
        </div>
      )}

      {/* Actual Certificate Parchment Canvas */}
      <div
        id="printable-certificate"
        ref={certRef}
        className={`relative bg-[#FCFBF7] border-[10px] border-[#D6CEBE] rounded-xl p-8 sm:p-12 shadow-card overflow-hidden transition-all ${
          isRevoked ? 'ring-2 ring-red-400/50' : ''
        }`}
      >
        {/* Subtle Ornamental Inner Border */}
        <div className="absolute inset-2 border-2 border-dashed border-[#C5BBA7]/60 pointer-events-none rounded-lg" />
        <div className="absolute inset-4 border border-[#B3A68F]/30 pointer-events-none rounded-md" />

        {/* Watermark Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#174B3A_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.025] pointer-events-none" />

        {/* Diagonal Revoked Stamp Overlay */}
        {isRevoked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="transform -rotate-12 border-4 border-red-600/80 px-8 py-3 rounded-xl bg-red-50/90 shadow-elevated backdrop-blur-sm text-center">
              <div className="flex items-center justify-center gap-2 text-red-700 font-serif font-black text-3xl tracking-widest uppercase">
                <ShieldAlert className="w-7 h-7" />
                REVOKED / VOID
              </div>
              <p className="text-[11px] font-sans font-medium text-red-900 mt-1 max-w-sm">
                Official decree: {credential.revocationDetails?.reason || 'Credential Nullified'}
              </p>
              <p className="text-[10px] font-mono text-red-800/80">
                {credential.revocationDetails?.revokedAt}
              </p>
            </div>
          </div>
        )}

        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
          {/* Header & Crest */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-forest/10 border border-forest/20 flex items-center justify-center text-forest shadow-inner">
              <Award className="w-8 h-8 text-forest" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal">
                {credential.universityName}
              </h2>
              <p className="text-xs uppercase tracking-widest text-[#7C715A] font-semibold mt-1">
                Office of the Academic Senate & Controller of Examinations
              </p>
            </div>
          </div>

          {/* Declaration */}
          <div className="pt-2">
            <p className="font-serif italic text-charcoal-muted text-sm sm:text-base">
              By the authority of the Board of Governors & Academic Council, this credential is conferred upon
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-forest mt-2 tracking-tight">
              {credential.studentName}
            </h1>
            <p className="text-xs font-mono text-charcoal-muted mt-1">
              Enrollment Ref: <span className="font-semibold text-charcoal">{credential.studentEnrollmentId}</span>
            </p>
          </div>

          {/* Degree Information */}
          <div className="py-2 px-6 bg-white/70 rounded-xl border border-[#E3DAC8] shadow-subtle backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-charcoal-muted font-medium">
              for having successfully fulfilled all academic requirements for the degree of
            </p>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mt-1">
              {credential.degreeName}
            </h3>
            <p className="text-sm text-charcoal-muted mt-0.5 font-medium">
              {credential.department}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-charcoal mt-2 pt-2 border-t border-charcoal-border/40">
              <span>Graduation Class of <strong className="text-forest">{credential.graduationYear}</strong></span>
              <span>•</span>
              <span>Performance: <strong className="text-forest">{credential.cgpaOrGrade}</strong></span>
              <span>•</span>
              <span>Conferred on <strong>{credential.issueDate}</strong></span>
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            {/* Signature 1 */}
            <div className="text-center sm:text-left space-y-1">
              <div className="h-10 flex items-center justify-center sm:justify-start">
                <span className="font-serif italic text-lg text-charcoal-muted font-bold font-cursive">
                  Rangan Banerjee
                </span>
              </div>
              <div className="w-full sm:w-44 h-px bg-charcoal-border mx-auto sm:mx-0" />
              <p className="text-[11px] font-semibold text-charcoal">Senate Chairman</p>
              <p className="text-[10px] text-charcoal-muted">Academic Senate</p>
            </div>

            {/* Official QR Code & Cryptographic Stamp */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="p-2 bg-white rounded-lg border border-[#DCD3C1] shadow-subtle">
                <QRCodeSVG
                  value={verificationUrl}
                  size={76}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-[9px] font-mono text-charcoal-muted tracking-tight">
                SCAN TO VERIFY AUTHENTICITY
              </p>
            </div>

            {/* Signature 2 */}
            <div className="text-center sm:text-right space-y-1">
              <div className="h-10 flex items-center justify-center sm:justify-end">
                <span className="font-serif italic text-lg text-charcoal-muted font-bold">
                  Yogeshwar Sen
                </span>
              </div>
              <div className="w-full sm:w-44 h-px bg-charcoal-border mx-auto sm:ml-auto" />
              <p className="text-[11px] font-semibold text-charcoal">Registrar</p>
              <p className="text-[10px] text-charcoal-muted">Controller of Examinations</p>
            </div>
          </div>

          {/* Bottom Cryptographic Ledger Proof Banner */}
          <div className="pt-4 border-t border-[#E3DAC8] text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-charcoal-muted gap-2">
              <div className="truncate max-w-md">
                <span className="text-[#877D69] font-medium">CRYPTOGRAPHIC HASH: </span>
                <span className="text-charcoal font-semibold">{credential.documentHash || '0x7a8...91f'}</span>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest" />
                <span>LEDGER REF: BLOCK #{credential.blockNumber || '1952104'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

