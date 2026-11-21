import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '../../context/ToastContext';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Lock,
  Eye,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const ShareCredentialPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { credentials } = useCredentialStore();
  const { success } = useToast();

  const studentEmail = 'aarav.sharma@alumni.iitd.ac.in';
  const myCredentials = credentials.filter(
    (c) => c.studentEmail.toLowerCase() === studentEmail.toLowerCase()
  );

  const [selectedCredId, setSelectedCredId] = useState<string>(
    id || myCredentials[0]?.id || credentials[0]?.id || ''
  );
  const [includeCgpa, setIncludeCgpa] = useState(true);
  const [includeEnrollmentId, setIncludeEnrollmentId] = useState(true);
  const [copied, setCopied] = useState(false);

  const selectedCred = credentials.find((c) => c.id === selectedCredId) || myCredentials[0] || credentials[0];

  const verificationUrl = `${window.location.origin}/recruiter/verify?id=${encodeURIComponent(
    selectedCred?.id || ''
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    success('Link Copied', 'Direct recruiter verification URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-charcoal-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
          Share Verifiable Degree
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
          Generate tamper-proof QR codes and instant recruiter links for your resume, LinkedIn, or job applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Configuration & Privacy Controls */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Select Credential to Share
              </label>
              <select
                value={selectedCredId}
                onChange={(e) => setSelectedCredId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border bg-white text-charcoal focus:border-forest outline-none font-medium"
              >
                {myCredentials.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.degreeName} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Privacy Controls */}
            <div className="pt-2 border-t border-charcoal-border/60 space-y-3">
              <span className="text-xs font-semibold text-charcoal block">
                Sharing Permissions (Student-Controlled)
              </span>

              <label className="flex items-center gap-3 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCgpa}
                  onChange={(e) => setIncludeCgpa(e.target.checked)}
                  className="rounded border-charcoal-border text-forest focus:ring-forest w-3.5 h-3.5"
                />
                <span className="text-charcoal">Include CGPA / Academic Grade in QR Payload</span>
              </label>

              <label className="flex items-center gap-3 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEnrollmentId}
                  onChange={(e) => setIncludeEnrollmentId(e.target.checked)}
                  className="rounded border-charcoal-border text-forest focus:ring-forest w-3.5 h-3.5"
                />
                <span className="text-charcoal">Include Enrollment / Roll Reference</span>
              </label>
            </div>

            {/* Direct Verification Link Box */}
            <div className="pt-2 border-t border-charcoal-border/60 space-y-2">
              <label className="block text-xs font-semibold text-charcoal">
                Direct Recruiter Verification URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={verificationUrl}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-charcoal-border bg-charcoal-light/40 text-charcoal outline-none select-all"
                />
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Note Guarantee */}
          <div className="p-4 bg-forest-light/60 rounded-2xl border border-forest/15 flex items-start gap-3 text-xs text-charcoal-muted leading-relaxed">
            <Lock className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div>
              <strong className="text-forest font-semibold block mb-0.5">
                Zero-Knowledge Privacy Note:
              </strong>
              You maintain sovereign ownership of your academic credentials. Only entities who scan
              this specific QR code or access your link can read your degree cryptographic proof.
            </div>
          </div>
        </div>

        {/* Right: Dynamic QR Code Presentation Preview */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-charcoal-border p-6 shadow-card text-center space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-muted font-medium">
              Live Verifiable QR Stamp
            </span>

            <div className="p-4 bg-white border border-charcoal-border rounded-2xl shadow-subtle inline-block mx-auto">
              <QRCodeSVG
                value={verificationUrl}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-charcoal">
                {selectedCred?.studentName}
              </h3>
              <p className="text-xs text-forest font-mono font-semibold">
                {selectedCred?.id}
              </p>
              <p className="text-xs text-charcoal-muted mt-1 max-w-xs mx-auto">
                {selectedCred?.degreeName} • {selectedCred?.universityName}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-charcoal bg-charcoal-light hover:bg-charcoal hover:text-white rounded-xl transition-all"
            >
              <span>Test Recruiter View in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

