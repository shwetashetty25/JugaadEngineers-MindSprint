import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Award,
  Check,
  Copy,
  RefreshCw,
  Cpu,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

type CredentialState = 'authentic' | 'tampered' | 'revoked';

export const HeroCredentialShowcase: React.FC = () => {
  const [state, setState] = useState<CredentialState>('authentic');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0); // 0: Idle, 1: Hashing, 2: Key Verification, 3: Block Ledger Check, 4: Done
  const [laserPos, setLaserPos] = useState(0); // 0 to 100%
  const [copied, setCopied] = useState(false);
  const [hashDisplay, setHashDisplay] = useState('0x8f2a91b34c7e5d10a904e2876fc931d87f4c02eb98b631f4a9c680214a1e9411');

  // Mouse tilt for natural Apple-style float
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const { success, error } = useToast();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5; // Subtle natural 5deg max
    const rotateY = ((x - centerX) / centerX) * 5;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  // Run Sense-full Verification Protocol
  const runAudit = (targetState: CredentialState = state) => {
    setIsAuditing(true);
    setAuditStep(1);
    setLaserPos(0);

    // Laser sweeps down the document
    let progress = 0;
    const laserInterval = setInterval(() => {
      progress += 10;
      setLaserPos(progress);
      if (progress >= 100) {
        clearInterval(laserInterval);
      }
    }, 60);

    // Step 1: Compute SHA-256 Digest (with cipher scrambling effect)
    setTimeout(() => {
      setAuditStep(2);
      if (targetState === 'tampered') {
        setHashDisplay('0xFA4E821B...INVALID_HASH_INTEGRITY_FAILED');
      } else if (targetState === 'revoked') {
        setHashDisplay('0x44556677...REVOKED_BY_SENATE_DECREE');
      } else {
        setHashDisplay('0x8f2a91b34c7e5d10a904e2876fc931d87f4c02eb98b631f4a9c680214a1e9411');
      }
    }, 300);

    // Step 2: Validate ECDSA Senate Key
    setTimeout(() => {
      setAuditStep(3);
    }, 600);

    // Step 3: Ledger Merkle Proof
    setTimeout(() => {
      setAuditStep(4);
      setIsAuditing(false);

      if (targetState === 'authentic') {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F45B0B', '#A8C9C8', '#FFFFFF', '#174B3A'],
        });
        success('Verification Complete', 'Cryptographically verified in 0.2s via Block #19,521,402');
      } else if (targetState === 'tampered') {
        error('Tampering Detected', 'Document digest does not match on-chain root! Forgery detected.');
      } else {
        error('Credential Revoked', 'Degree was invalidated by Senate Decree #SR-2024-41.');
      }
    }, 950);
  };

  // Switch modes
  const handleSelectMode = (newMode: CredentialState) => {
    setState(newMode);
    runAudit(newMode);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(hashDisplay);
    setCopied(true);
    success('Digest Copied', 'SHA-256 cryptographic hash copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isAuthentic = state === 'authentic';
  const isTampered = state === 'tampered';
  const isRevoked = state === 'revoked';

  return (
    <div className="relative mx-auto max-w-lg w-full select-none space-y-4">
      {/* 1. Ultra-Sleek Apple/Linear-Style Simulation Control Bar */}
      <div className="bg-white/95 backdrop-blur-md border border-powder/70 rounded-2xl p-2.5 shadow-subtle space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-charcoal">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isAuthentic ? 'bg-[#F45B0B]' : isTampered ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isAuthentic ? 'bg-[#F45B0B]' : isTampered ? 'bg-rose-600' : 'bg-amber-600'
              }`} />
            </span>
            <span className="uppercase tracking-wider">Verification Sandbox</span>
          </div>

          {/* Unified Segmented Pill Control */}
          <div className="inline-flex items-center p-1 bg-[#EEF6F6] rounded-xl border border-powder/50 gap-1 self-start sm:self-auto">
            {/* Tab 1: Authentic */}
            <button
              type="button"
              onClick={() => handleSelectMode('authentic')}
              disabled={isAuditing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isAuthentic
                  ? 'bg-[#141A1B] text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-white/60'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAuthentic ? 'text-[#F45B0B]' : 'text-powder-dark'}`} />
              <span>Authentic</span>
            </button>

            {/* Tab 2: Tampered */}
            <button
              type="button"
              onClick={() => handleSelectMode('tampered')}
              disabled={isAuditing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isTampered
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Tamper</span>
            </button>

            {/* Tab 3: Revoked */}
            <button
              type="button"
              onClick={() => handleSelectMode('revoked')}
              disabled={isAuditing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isRevoked
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-amber-800 hover:bg-amber-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Revoked</span>
            </button>
          </div>
        </div>

        {/* Dynamic Context Helper Note */}
        <div className="px-1 text-[11px] font-mono text-charcoal-muted flex items-center justify-between border-t border-charcoal-border/40 pt-1.5">
          <span>
            {isAuthentic && '✓ IIT Delhi Senate Conferred • Verified ECDSA signature'}
            {isTampered && '⚠ Forgery simulation: Altered 1-bit breaks SHA-256 ledger root'}
            {isRevoked && '✕ Revocation decree: Block record flagged invalid by Senate'}
          </span>
          <span className="text-[10px] text-powder-dark font-bold hidden sm:inline">
            Live Telemetry
          </span>
        </div>
      </div>

      {/* 2. THE MASTER CREDENTIAL DISPLAY CARD */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out, box-shadow 0.25s ease-out',
        }}
        className={`relative bg-white rounded-3xl border-2 shadow-2xl overflow-hidden transition-all duration-300 ${
          isAuthentic
            ? 'border-powder shadow-[0_20px_50px_-12px_rgba(244,91,11,0.12)]'
            : isTampered
            ? 'border-rose-400 shadow-[0_20px_50px_-12px_rgba(225,29,72,0.2)]'
            : 'border-amber-400 shadow-[0_20px_50px_-12px_rgba(217,119,6,0.18)]'
        }`}
      >
        {/* Holographic Sheen Layer */}
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-200"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 360px at ${glare.x}% ${glare.y}%, rgba(168,201,200,0.35), rgba(244,91,11,0.15) 50%, transparent 80%)`,
          }}
        />

        {/* Dynamic Laser Scanning Beam during Audit */}
        {isAuditing && (
          <div
            className={`absolute inset-x-0 h-1.5 z-30 pointer-events-none transition-all duration-75 shadow-lg ${
              isTampered
                ? 'bg-rose-500 shadow-[0_0_20px_#E11D48]'
                : 'bg-orange shadow-[0_0_20px_#F45B0B]'
            }`}
            style={{ top: `${laserPos}%` }}
          >
            <div className="absolute right-3 -top-5 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-charcoal text-white">
              SHA-256 SCANNING {laserPos}%
            </div>
          </div>
        )}

        {/* Top Accent Ribbon */}
        <div
          className={`h-2 w-full transition-colors duration-300 ${
            isAuthentic
              ? 'bg-gradient-to-r from-powder via-orange to-powder'
              : isTampered
              ? 'bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600'
          }`}
        />

        <div className="p-6 sm:p-7 space-y-4">
          {/* Header Row: University Crest & Verification Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-inner transition-colors ${
                  isAuthentic
                    ? 'bg-powder-light border-powder text-orange'
                    : isTampered
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-amber-50 border-amber-300 text-amber-600'
                }`}
              >
                <Award className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-serif font-black text-sm sm:text-base text-charcoal leading-snug">
                  Indian Institute of Technology Delhi
                </h3>
                <p className="text-[10px] font-mono text-powder-dark font-semibold tracking-wider uppercase mt-0.5">
                  Academic Senate Registry • New Delhi
                </p>
              </div>
            </div>

            {/* Status Pill Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isAuthentic
                  ? 'bg-powder-light text-powder-dark border-powder/80 shadow-xs'
                  : isTampered
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAuthentic
                    ? 'bg-orange animate-pulse'
                    : isTampered
                    ? 'bg-rose-600'
                    : 'bg-amber-600'
                }`}
              />
              <span>
                {isAuthentic
                  ? 'VERIFIED'
                  : isTampered
                  ? 'TAMPERED / FAKE'
                  : 'REVOKED'}
              </span>
            </div>
          </div>

          {/* Tamper / Revocation Full Banner Alert */}
          {isTampered && (
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-300 text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block font-bold">Cryptographic Integrity Failed!</strong>
                <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                  Student record was altered out-of-band. The computed SHA-256 digest differs from the immutable ledger root.
                </p>
              </div>
            </div>
          )}

          {isRevoked && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block font-bold">Senate Revocation In Effect</strong>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Degree #VDX-2023-IITD-0104 was invalidated under Decree #SR-2024-41 (Academic Misconduct).
                </p>
              </div>
            </div>
          )}

          {/* Conferred Degree Parchment Container */}
          <div
            className={`p-4 rounded-2xl border transition-all space-y-3 ${
              isAuthentic
                ? 'bg-[#FCFDFD] border-powder/70 shadow-subtle'
                : isTampered
                ? 'bg-rose-50/40 border-rose-200'
                : 'bg-amber-50/40 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-charcoal-muted">
                CONFERRED CREDENTIAL
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isAuthentic ? 'text-orange' : isTampered ? 'text-rose-600 line-through' : 'text-amber-700'
                }`}
              >
                {isAuthentic ? 'VDX-2024-IITD-0891' : 'VDX-FORGERY-9921'}
              </span>
            </div>

            <div>
              <h4 className="font-serif font-black text-base sm:text-lg text-charcoal leading-snug">
                Bachelor of Technology in Computer Science & Engineering
              </h4>
              <p className="text-xs text-charcoal-muted font-medium mt-0.5">
                Department of Computer Science and Engineering
              </p>
            </div>

            {/* Candidate Metadata */}
            <div className="pt-2 border-t border-charcoal-border/50 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-charcoal-muted uppercase block font-medium">Candidate</span>
                <strong className={`font-bold ${isTampered ? 'text-rose-700 bg-rose-100 px-1 rounded' : 'text-charcoal'}`}>
                  {isAuthentic ? 'Aarav Sharma' : isTampered ? 'Unknown (Altered Name)' : 'Aditya Singhal'}
                </strong>
                <span className="text-[10px] font-mono text-charcoal-muted block">
                  {isAuthentic ? 'Roll: 2020CS10492' : 'Roll: 2019CS10901'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-charcoal-muted uppercase block font-medium">Class & Honors</span>
                <strong
                  className={`font-bold font-mono ${
                    isAuthentic ? 'text-orange' : isTampered ? 'text-rose-600 line-through' : 'text-amber-800'
                  }`}
                >
                  {isAuthentic ? 'CGPA: 9.62 (Gold Medal)' : isTampered ? 'CGPA: 10.0 (Fabricated)' : 'CGPA: 8.45'}
                </strong>
                <span className="text-[10px] text-charcoal-muted block">
                  Graduation 2024
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry & Cryptographic Pipeline Box */}
          <div className="p-3 bg-powder-light/40 rounded-2xl border border-powder/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-powder-dark font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange" />
                <span>CRYPTOGRAPHIC AUDIT PIPELINE:</span>
              </span>
              <span className="text-[10px] text-charcoal font-semibold">
                {isAuditing ? 'Auditing Nodes...' : 'Synced 0.2s ago'}
              </span>
            </div>

            {/* Step Checkmarks */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              <div
                className={`p-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  auditStep >= 2
                    ? isAuthentic
                      ? 'bg-white border-powder text-charcoal'
                      : 'bg-rose-100 border-rose-300 text-rose-800'
                    : 'bg-white/60 border-transparent text-charcoal-muted'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAuthentic ? 'bg-orange' : 'bg-rose-600'}`} />
                <span className="truncate">1. SHA-256 Hash</span>
              </div>

              <div
                className={`p-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  auditStep >= 3
                    ? isAuthentic
                      ? 'bg-white border-powder text-charcoal'
                      : 'bg-rose-100 border-rose-300 text-rose-800'
                    : 'bg-white/60 border-transparent text-charcoal-muted'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAuthentic ? 'bg-orange' : 'bg-rose-600'}`} />
                <span className="truncate">2. Senate ECDSA</span>
              </div>

              <div
                className={`p-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  auditStep >= 4
                    ? isAuthentic
                      ? 'bg-white border-powder text-charcoal'
                      : 'bg-rose-100 border-rose-300 text-rose-800'
                    : 'bg-white/60 border-transparent text-charcoal-muted'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAuthentic ? 'bg-orange' : 'bg-rose-600'}`} />
                <span className="truncate">3. Block Proof</span>
              </div>
            </div>

            {/* Live Digest Row */}
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-powder/50 text-[10px] font-mono">
              <div className="truncate pr-2">
                <span className="text-powder-dark font-bold">DIGEST: </span>
                <span className={`font-semibold ${isTampered ? 'text-rose-600' : 'text-charcoal'}`}>
                  {hashDisplay.slice(0, 26)}...
                </span>
              </div>
              <button
                onClick={handleCopyHash}
                className="p-1 hover:bg-powder-light rounded text-charcoal-muted hover:text-orange transition-colors shrink-0"
                title="Copy Digest"
              >
                {copied ? <Check className="w-3 h-3 text-orange" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Footer: Dynamic QR Code & Instant Verify CTA */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="relative p-1.5 bg-white rounded-xl border-2 border-powder/60 shadow-xs shrink-0">
                <QRCodeSVG
                  value={`http://localhost:5173/recruiter/verify?id=${isAuthentic ? 'VDX-2024-IITD-0891' : 'VDX-FORGERY'}`}
                  size={52}
                  level="M"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-charcoal block">
                  Scan to Inspect
                </span>
                <span className="text-[9px] font-mono text-powder-dark block">
                  Block #19,521,402 • Ledger Sync
                </span>
              </div>
            </div>

            {/* Run Audit Button */}
            <button
              onClick={() => runAudit(state)}
              disabled={isAuditing}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-orange hover:bg-orange-hover shadow-card hover:shadow-orange-glow transition-all disabled:opacity-70 shrink-0"
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Run Audit (0.2s)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Helper text */}
      <div className="text-center text-[11px] font-mono text-charcoal-muted flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3 text-orange" />
        <span>Click any simulator button above to see real-time cryptographic audit</span>
      </div>
    </div>
  );
};
