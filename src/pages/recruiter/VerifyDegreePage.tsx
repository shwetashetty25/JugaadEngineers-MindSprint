import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useToast } from '../../context/ToastContext';
import { GsapReveal } from '../../components/common/GsapReveal';
import {
  QrCode,
  Search,
  Camera,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const VerifyDegreePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [credentialId, setCredentialId] = useState(initialId);
  const [activeTab, setActiveTab] = useState<'ID' | 'SCAN'>('ID');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const navigate = useNavigate();
  const { verifyCredential, recruiterOrg } = useCredentialStore();
  const { success, error } = useToast();

  useEffect(() => {
    if (initialId) {
      setCredentialId(initialId);
    }
  }, [initialId]);

  const handleVerifyId = (idToVerify: string) => {
    const cleanId = idToVerify.trim().toUpperCase();
    if (!cleanId) {
      error('Input Required', 'Please enter a valid Credential ID.');
      return;
    }

    // Call store verify method which logs the background verification check
    verifyCredential(cleanId, {
      organization: recruiterOrg.name,
      verifierName: recruiterOrg.recruiterName,
      verifierEmail: recruiterOrg.email,
      method: activeTab === 'SCAN' ? 'QR_SCAN' : 'MANUAL_ID'
    });

    navigate(`/recruiter/result/${encodeURIComponent(cleanId)}`);
  };

  const handleSimulateScan = (scannedId: string) => {
    setIsScanning(true);
    setCameraActive(true);
    setTimeout(() => {
      setIsScanning(false);
      success('QR Code Captured', `Decoded credential reference: ${scannedId}`);
      handleVerifyId(scannedId);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with GSAP Reveal */}
      <GsapReveal type="fade-down" duration={0.7} className="text-center space-y-2 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-light text-forest text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant Cryptographic Verifier</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal">
          Verify Academic Credential
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-lg mx-auto">
          Authenticate candidate degrees in seconds. Scan a candidate's CV QR code or enter their Credential ID.
        </p>
      </GsapReveal>

      {/* Mode Tabs */}
      <GsapReveal type="fade-up" delay={0.08} duration={0.6} className="bg-white rounded-2xl border border-charcoal-border p-2 shadow-subtle flex gap-2">
        <button
          onClick={() => setActiveTab('ID')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ID'
              ? 'bg-forest text-white shadow-subtle'
              : 'text-charcoal hover:bg-charcoal-light'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Option A: Enter Credential ID</span>
        </button>

        <button
          onClick={() => setActiveTab('SCAN')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'SCAN'
              ? 'bg-forest text-white shadow-subtle'
              : 'text-charcoal hover:bg-charcoal-light'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Option B: Scan QR Code</span>
        </button>
      </GsapReveal>

      {/* Option A: Manual ID Entry */}
      {activeTab === 'ID' && (
        <GsapReveal type="scale-up" duration={0.7} className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyId(credentialId);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Credential Identifier (VDX Number)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  placeholder="e.g. VDX-2024-IITD-0891"
                  className="w-full pl-10 pr-4 py-3 text-sm font-mono rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-card transition-all"
            >
              <span>Verify Credential Authenticity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Test Chips */}
          <div className="pt-4 border-t border-charcoal-border/70 space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted font-semibold block">
              Try Interactive Test Scenarios:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCredentialId('VDX-2024-IITD-0891');
                  handleVerifyId('VDX-2024-IITD-0891');
                }}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Valid Degree</span>
                </div>
                <p className="font-mono text-[11px] text-charcoal truncate">VDX-2024-IITD-0891</p>
                <p className="text-[10px] text-charcoal-muted mt-0.5">Aarav Sharma (B.Tech)</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCredentialId('VDX-2023-IITD-0104');
                  handleVerifyId('VDX-2023-IITD-0104');
                }}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-xs mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Revoked Degree</span>
                </div>
                <p className="font-mono text-[11px] text-charcoal truncate">VDX-2023-IITD-0104</p>
                <p className="text-[10px] text-charcoal-muted mt-0.5">Aditya Singhal (Voided)</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCredentialId('VDX-9999-FAKE-0000');
                  handleVerifyId('VDX-9999-FAKE-0000');
                }}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Not Found</span>
                </div>
                <p className="font-mono text-[11px] text-charcoal truncate">VDX-9999-FAKE-0000</p>
                <p className="text-[10px] text-charcoal-muted mt-0.5">Unknown Candidate</p>
              </button>
            </div>
          </div>
        </GsapReveal>
      )}

      {/* Option B: QR Code Camera Scanner */}
      {activeTab === 'SCAN' && (
        <GsapReveal type="scale-up" duration={0.7} className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card space-y-6 text-center">
          <div className="relative mx-auto max-w-sm aspect-square rounded-2xl bg-charcoal overflow-hidden flex flex-col items-center justify-center p-6 border-4 border-charcoal-border">
            {/* Camera Viewfinder Overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none" />

            {/* Scanning Line Animation */}
            {isScanning && (
              <div className="absolute left-8 right-8 h-1 bg-emerald-400 shadow-[0_0_12px_#10B981] animate-bounce" />
            )}

            <div className="z-10 space-y-3 text-white text-center">
              <Camera className="w-10 h-10 text-emerald-400 mx-auto" />
              <div>
                <p className="text-xs font-semibold">Camera Scanner Active</p>
                <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs">
                  Center the graduate's degree QR code inside the viewfinder frame.
                </p>
              </div>
            </div>
          </div>

          {/* Scanner Simulation Actions */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted font-semibold block">
              Simulate Live Camera Scans:
            </span>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleSimulateScan('VDX-2024-IITD-0891')}
                className="px-4 py-2 text-xs font-semibold text-charcoal bg-background hover:bg-charcoal-light border border-charcoal-border rounded-xl shadow-subtle transition-all"
              >
                Scan Aarav's QR (Valid B.Tech)
              </button>

              <button
                type="button"
                onClick={() => handleSimulateScan('VDX-2023-IITD-0104')}
                className="px-4 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-subtle transition-all"
              >
                Scan Aditya's QR (Revoked)
              </button>
            </div>
          </div>
        </GsapReveal>
      )}
    </div>
  );
};

