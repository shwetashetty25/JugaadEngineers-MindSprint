import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { CertificateDocument } from '../../components/common/CertificateDocument';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Share2, QrCode, Download, Printer, Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const StudentCredentialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCredentialById } = useCredentialStore();
  const { success } = useToast();

  const credential = id ? getCredentialById(id) : undefined;
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!credential) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          Degree Not Found
        </h2>
        <Link
          to="/student/credentials"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-forest rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Wallet</span>
        </Link>
      </div>
    );
  }

  const verificationUrl = `${window.location.origin}/recruiter/verify?id=${encodeURIComponent(
    credential.id
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    success('Verification Link Copied', 'Direct recruiter verification URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-charcoal">
                Degree Certificate View
              </h1>
              <Badge status={credential.status} size="sm" />
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                DEMO SIMULATION
              </span>
            </div>
            <p className="font-mono text-xs text-charcoal-muted mt-0.5">
              Ref: {credential.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-lg transition-all shadow-subtle"
          >
            <QrCode className="w-4 h-4 text-forest" />
            <span>Generate QR</span>
          </button>
          <Link
            to={`/student/share/${credential.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-lg transition-all shadow-subtle"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Credential</span>
          </Link>
        </div>
      </div>

      {/* Certificate Display */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
        <CertificateDocument credential={credential} showActions={true} />
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Student Verifiable QR Code"
        description="Share this dynamic QR code with employers or attach it to your resume for instant verification."
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <div className="p-4 bg-white border border-charcoal-border rounded-2xl shadow-subtle inline-block mx-auto">
            <QRCodeSVG value={verificationUrl} size={180} level="H" includeMargin={true} />
          </div>

          <div className="space-y-1">
            <p className="font-mono text-xs font-bold text-forest">{credential.id}</p>
            <p className="text-xs text-charcoal-muted">
              Point recruiter camera at this code to open instant authenticity proof.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopyLink}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-charcoal bg-charcoal-light hover:bg-charcoal-border/70 rounded-xl transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-forest" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Direct Verification Link'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

