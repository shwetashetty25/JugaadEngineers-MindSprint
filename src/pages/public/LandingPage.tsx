import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Badge } from '../../components/common/Badge';
import { GsapReveal } from '../../components/common/GsapReveal';
import {
  ShieldCheck,
  Award,
  Lock,
  ArrowRight,
  FileCheck2,
  Users,
  Search,
  Building,
  QrCode,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Copy,
  Check,
  FileSpreadsheet,
  Zap,
  Globe,
  Database,
  KeyRound,
  CheckCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { HeroCredentialShowcase } from '../../components/credentials/HeroCredentialShowcase';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();

  // Hero Interactive Credential Showcase State
  const [heroCardState, setHeroCardState] = useState<'authentic' | 'revoked' | 'ledger'>('authentic');
  const [copiedHash, setCopiedHash] = useState(false);

  // Live Verifier search input
  const [quickVerifyId, setQuickVerifyId] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState<'university' | 'student' | 'recruiter'>('university');

  const heroRef = useRef<HTMLDivElement>(null);

  // GSAP Hero Entrance Timeline adhering to modern-web-guidance
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    // Respect reduced-motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', {
        opacity: 0,
        y: -24,
        duration: 0.65,
      })
        .from(
          '.hero-headline',
          {
            opacity: 0,
            y: 35,
            duration: 0.85,
          },
          '-=0.35'
        )
        .from(
          '.hero-desc',
          {
            opacity: 0,
            y: 25,
            duration: 0.75,
          },
          '-=0.5'
        )
        .from(
          '.hero-cta-btn',
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.12,
          },
          '-=0.45'
        )
        .from(
          '.hero-metric-item',
          {
            opacity: 0,
            y: 18,
            duration: 0.55,
            stagger: 0.1,
          },
          '-=0.35'
        )
        .from(
          '.hero-showcase-card',
          {
            opacity: 0,
            scale: 0.93,
            duration: 0.95,
          },
          '-=0.7'
        );
    }, el);

    return () => {
      ctx.revert();
    };
  }, []);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    success('Hash Copied', 'Cryptographic SHA-256 digest copied to clipboard');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleQuickVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickVerifyId.trim().toUpperCase() || 'VDX-2024-IITD-0891';
    navigate(`/recruiter/result/${encodeURIComponent(clean)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-charcoal selection:bg-orange selection:text-white">
      <Navbar />

      {/* Hero Section with Powder Blue & Racing Orange Ambient Lighting */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Powder Blue soft diffuse aura & subtle warm orange halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(168,201,200,0.35),rgba(244,91,11,0.05),transparent)] pointer-events-none -z-10" />

        <div ref={heroRef} className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Trust Badge with Powder Blue & Racing Orange */}
              <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-powder-light border border-powder/50 text-powder-dark text-xs font-semibold tracking-wide shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange"></span>
                </span>
                <span>Next-Gen Academic Credential Ledger</span>
                <span className="text-powder-muted">|</span>
                <span className="font-mono text-[11px] text-orange font-bold">W3C Verifiable Standard</span>
              </div>

              {/* Main Headline */}
              <h1 className="hero-headline font-serif text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-charcoal leading-[1.07]">
                Your achievements deserve{' '}
                <span className="text-orange relative inline-block">
                  undeniable trust.
                  <span className="absolute bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-orange via-powder to-orange/40 rounded-full" />
                </span>
              </h1>

              {/* Supporting Value Proposition */}
              <p className="hero-desc text-base sm:text-lg text-charcoal-muted max-w-2xl font-normal leading-relaxed">
                Store, manage and verify academic credentials through a secure digital credential network.
                Universities issue with cryptographic certainty, students own their credentials in sovereign wallets,
                and recruiters verify authenticity in <strong className="text-charcoal font-semibold">0.2 seconds</strong>.
              </p>

              {/* Primary CTAs with Vibrant Racing Orange & Pure White */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/select-role"
                  className="hero-cta-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-orange hover:bg-orange-hover rounded-xl shadow-card shadow-orange/20 hover:shadow-orange-glow transition-all"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/recruiter/verify"
                  className="hero-cta-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold text-charcoal bg-white border border-powder hover:border-orange hover:bg-powder-light rounded-xl shadow-subtle transition-all"
                >
                  <Search className="w-4 h-4 text-orange" />
                  <span>Verify a Degree (Instant)</span>
                </Link>
              </div>

              {/* Live Metric Badges */}
              <div className="pt-6 border-t border-charcoal-border/70 grid grid-cols-3 gap-6 max-w-lg">
                <div className="hero-metric-item">
                  <p className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">0.2s</p>
                  <p className="text-xs text-charcoal-muted font-medium mt-0.5">Verification speed</p>
                </div>
                <div className="hero-metric-item">
                  <p className="font-serif text-2xl sm:text-3xl font-extrabold text-orange">100%</p>
                  <p className="text-xs text-charcoal-muted font-medium mt-0.5">Cryptographic integrity</p>
                </div>
                <div className="hero-metric-item">
                  <p className="font-serif text-2xl sm:text-3xl font-extrabold text-powder-dark">Zero</p>
                  <p className="text-xs text-charcoal-muted font-medium mt-0.5">Registrar paperwork</p>
                </div>
              </div>
            </div>

            {/* Right Column: High-End Interactive Digital Credential Showcase */}
            <div className="hero-showcase-card lg:col-span-5 relative">
              <HeroCredentialShowcase />
            </div>
          </div>

          {/* High-End Instant Verification Command Console with GSAP Reveal */}
          <GsapReveal
            type="scale-up"
            delay={0.1}
            duration={0.8}
            className="relative bg-gradient-to-b from-white via-white to-[#F6FAFA] rounded-3xl border-2 border-powder/70 p-6 sm:p-8 shadow-[0_20px_50px_-15px_rgba(20,26,27,0.06)] space-y-6"
          >
            {/* Ambient Corner Glow Accent */}
            <div className="absolute top-0 right-0 w-72 h-32 bg-gradient-to-bl from-powder/20 via-orange/5 to-transparent pointer-events-none rounded-tr-3xl" />

            {/* Header: Title & Network Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-charcoal-border/50 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange/10 border border-orange/30 flex items-center justify-center text-orange shrink-0">
                    <Zap className="w-4 h-4 fill-orange/20" />
                  </div>
                  <h3 className="font-serif font-black text-xl text-charcoal tracking-tight">
                    Instant Verification Sandbox
                  </h3>
                </div>
                <p className="text-xs text-charcoal-muted max-w-xl pl-10">
                  Query the decentralized ledger in real-time. Enter any student Credential ID to inspect ECDSA cryptographic signatures and senate revocation status.
                </p>
              </div>

              {/* Live Telemetry Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-powder-light/80 border border-powder/60 text-[11px] font-mono text-powder-dark font-bold shrink-0 self-start sm:self-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange" />
                </span>
                <span>Ledger Online • 0.18s Latency</span>
              </div>
            </div>

            {/* Primary Command Search Bar */}
            <form onSubmit={handleQuickVerifySubmit} className="relative z-10">
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center p-1.5 bg-white rounded-2xl border-2 border-charcoal-border/80 focus-within:border-orange focus-within:shadow-[0_0_20px_rgba(244,91,11,0.15)] transition-all gap-2">
                <div className="relative flex-1 flex items-center pl-3.5">
                  <Search className="w-5 h-5 text-orange shrink-0" />
                  <input
                    type="text"
                    value={quickVerifyId}
                    onChange={(e) => setQuickVerifyId(e.target.value)}
                    placeholder="Enter Credential ID (e.g. VDX-2024-IITD-0891)..."
                    className="w-full pl-3 pr-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-charcoal placeholder:text-charcoal-muted/60 placeholder:font-normal bg-transparent outline-none uppercase tracking-wide"
                  />
                  {quickVerifyId && (
                    <button
                      type="button"
                      onClick={() => setQuickVerifyId('')}
                      className="px-2 py-1 text-[11px] font-mono text-charcoal-muted hover:text-charcoal transition-colors shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-orange hover:bg-orange-hover rounded-xl shadow-card shadow-orange/25 hover:shadow-orange-glow transition-all whitespace-nowrap shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Verify Credential</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Structured Preset Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-charcoal-border/40 text-xs relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-charcoal-muted uppercase tracking-wider">
                  Test Presets:
                </span>

                <button
                  type="button"
                  onClick={() => setQuickVerifyId('VDX-2024-IITD-0891')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all ${
                    quickVerifyId === 'VDX-2024-IITD-0891'
                      ? 'bg-[#141A1B] text-white border-[#141A1B] shadow-xs'
                      : 'bg-white hover:bg-powder-light text-charcoal border-powder/70'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-orange" />
                  <span className="font-bold">VDX-2024-IITD-0891</span>
                  <span className="text-[10px] text-powder-dark font-sans font-semibold">(Authentic)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickVerifyId('VDX-2023-IITD-0104')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all ${
                    quickVerifyId === 'VDX-2023-IITD-0104'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span className="font-bold">VDX-2023-IITD-0104</span>
                  <span className="text-[10px] text-rose-700 font-sans font-semibold">(Revoked)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickVerifyId('VDX-9999-FAKE-0000')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all ${
                    quickVerifyId === 'VDX-9999-FAKE-0000'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span className="font-bold">VDX-9999-FAKE</span>
                  <span className="text-[10px] text-amber-700 font-sans font-semibold">(Tampered/NotFound)</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-charcoal-muted flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-powder-light border border-powder text-[10px] font-bold text-charcoal">
                  Enter ↵
                </kbd>
                <span>to verify</span>
              </div>
            </div>
          </GsapReveal>
        </div>
      </section>

      {/* Accredited Institutions Marquee Bar with GSAP Stagger Reveal */}
      <section className="py-8 bg-white border-y border-charcoal-border px-4 sm:px-6 lg:px-8">
        <GsapReveal
          type="fade-up"
          stagger={0.08}
          selector=".partner-badge"
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-charcoal-muted font-bold whitespace-nowrap">
            Participating Institutions
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-serif font-bold text-charcoal opacity-85">
            <span className="partner-badge flex items-center gap-2 hover:opacity-100 transition-opacity">
              <span>🏛️</span>
              <span>IIT Delhi</span>
            </span>
            <span className="partner-badge flex items-center gap-2 hover:opacity-100 transition-opacity">
              <span>🎓</span>
              <span>BITS Pilani</span>
            </span>
            <span className="partner-badge flex items-center gap-2 hover:opacity-100 transition-opacity">
              <span>📜</span>
              <span>University of Delhi</span>
            </span>
            <span className="partner-badge flex items-center gap-2 hover:opacity-100 transition-opacity">
              <span>🏢</span>
              <span>IIM Ahmedabad (DMS)</span>
            </span>
            <span className="partner-badge flex items-center gap-2 hover:opacity-100 transition-opacity">
              <span>🛡️</span>
              <span>NLU Bangalore</span>
            </span>
          </div>

          <div className="text-xs font-mono text-orange font-semibold flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            <span>Senate Gateway Live</span>
          </div>
        </GsapReveal>
      </section>

      {/* Problem vs Solution Split Section with Obsidian Dark & Racing Orange */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto space-y-12">
          <GsapReveal type="fade-up" className="max-w-2xl text-left space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-orange font-bold">
              The Education Trust Crisis
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal">
              Why traditional paper degrees fail modern hiring.
            </h2>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Recruiters lose billions to forged certificates, universities drown in registrar emails, and students carry zero digital ownership.
            </p>
          </GsapReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Broken Way */}
            <GsapReveal
              type="fade-right"
              duration={0.8}
              className="p-8 rounded-3xl bg-white border border-charcoal-border shadow-subtle space-y-5"
            >
              <div className="flex items-center gap-2 text-rose-700 font-serif font-bold text-lg">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>The Legacy Paper Model</span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-charcoal-muted">
                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                  <strong className="text-rose-900 block font-semibold">1. Forged PDFs & Fake Certificates</strong>
                  <p className="text-rose-800/80 leading-relaxed text-xs">
                    Adobe Photoshop and fake online diploma mills produce indistinguishable PDF degrees in minutes.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                  <strong className="text-rose-900 block font-semibold">2. 3 to 4 Weeks Manual Verification Lag</strong>
                  <p className="text-rose-800/80 leading-relaxed text-xs">
                    Background check agencies wait weeks for university registrars to manually pull physical archives.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                  <strong className="text-rose-900 block font-semibold">3. Irrevocable After Physical Issuance</strong>
                  <p className="text-rose-800/80 leading-relaxed text-xs">
                    If a graduate commits fraud or disciplinary misconduct, universities have no way to cancel physical paper.
                  </p>
                </div>
              </div>
            </GsapReveal>

            {/* The VeriDegree X Standard in Obsidian Dark with Powder Blue and Racing Orange accents */}
            <GsapReveal
              type="fade-left"
              duration={0.8}
              className="p-8 rounded-3xl bg-[#111617] text-white border border-powder/20 shadow-elevated space-y-5"
            >
              <div className="flex items-center gap-2 text-powder font-serif font-bold text-lg">
                <ShieldCheck className="w-5 h-5 text-orange" />
                <span>The VeriDegree X Cryptographic Standard</span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-gray-300">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <strong className="text-white block font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                    1. Mathematical Proof of Authenticity
                  </strong>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Every degree is hashed with SHA-256 and signed with official Senate keys. Zero chance of tampering.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <strong className="text-white block font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                    2. Sub-Second Instant Verification
                  </strong>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Recruiters scan a candidate QR code or query the Credential ID to get cryptographic truth in 0.2s.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <strong className="text-white block font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                    3. Instant Revocation Registry
                  </strong>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Universities can publish disciplinary nullification decrees in real-time, reflecting across all verification nodes.
                  </p>
                </div>
              </div>
            </GsapReveal>
          </div>
        </div>
      </section>

      {/* Interactive 3-Role Ecosystem Explorer */}
      <section className="py-16 md:py-24 bg-white border-y border-charcoal-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <GsapReveal type="fade-up" className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-orange font-bold">
              Integrated Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal">
              Engineered for Universities, Students & Recruiters
            </h2>
            <p className="text-sm text-charcoal-muted">
              Explore how each stakeholder interacts with the VeriDegree X credential network.
            </p>
          </GsapReveal>

          {/* Interactive Role Tabs */}
          <GsapReveal
            type="scale-up"
            delay={0.08}
            className="flex items-center justify-center gap-2 p-1 bg-charcoal-light rounded-2xl max-w-md mx-auto"
          >
            <button
              onClick={() => setActiveRoleTab('university')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                activeRoleTab === 'university'
                  ? 'bg-orange text-white shadow-xs'
                  : 'text-charcoal hover:bg-white/60'
              }`}
            >
              1. University
            </button>
            <button
              onClick={() => setActiveRoleTab('student')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                activeRoleTab === 'student'
                  ? 'bg-orange text-white shadow-xs'
                  : 'text-charcoal hover:bg-white/60'
              }`}
            >
              2. Student
            </button>
            <button
              onClick={() => setActiveRoleTab('recruiter')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                activeRoleTab === 'recruiter'
                  ? 'bg-orange text-white shadow-xs'
                  : 'text-charcoal hover:bg-white/60'
              }`}
            >
              3. Recruiter
            </button>
          </GsapReveal>

          {/* Tab Content Display with GSAP Reveal */}
          <GsapReveal
            type="fade-up"
            duration={0.65}
            className="bg-background rounded-3xl border border-powder/50 p-6 sm:p-10 shadow-subtle"
          >
            {activeRoleTab === 'university' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-powder-light text-powder-dark text-xs font-bold font-mono">
                    UNIVERSITY REGISTRAR WORKFLOW
                  </div>
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">
                    Mint degrees in seconds, individually or in bulk via CSV.
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                    Registrars upload student graduation rosters or issue single credentials. VeriDegree X computes the SHA-256 fingerprint, co-signs with Senate keys, and dispatches verifiable credentials directly into graduate wallets.
                  </p>
                  <ul className="space-y-2 text-xs text-charcoal font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange" />
                      <span>Single or bulk batch CSV conferral</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange" />
                      <span>Senate disciplinary revocation management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange" />
                      <span>Live recruiter background inquiry telemetry</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/university/dashboard"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-orange hover:bg-orange-hover rounded-xl shadow-subtle transition-all"
                    >
                      <span>Explore University Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-charcoal-border p-5 shadow-card space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-charcoal border-b border-charcoal-border/70 pb-2">
                    <span>MOCK CSV BATCH PREVIEW</span>
                    <span className="text-orange">5 Records Ready</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-background rounded-lg border border-charcoal-border flex justify-between items-center">
                      <div>
                        <p className="font-bold text-charcoal">Aarav Sharma</p>
                        <p className="text-[10px] text-charcoal-muted">B.Tech CSE • IIT Delhi</p>
                      </div>
                      <Badge status="Active" size="sm" />
                    </div>
                    <div className="p-2.5 bg-background rounded-lg border border-charcoal-border flex justify-between items-center">
                      <div>
                        <p className="font-bold text-charcoal">Priya Nair</p>
                        <p className="text-[10px] text-charcoal-muted">BBA Honours • BITS Pilani</p>
                      </div>
                      <Badge status="Active" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-powder-light text-powder-dark text-xs font-bold font-mono">
                    SELF-SOVEREIGN WALLET
                  </div>
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">
                    Permanent student ownership with dynamic QR code sharing.
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                    Graduates receive cryptographically signed diplomas into their personal vault. Share degrees with prospective employers via resume QR codes, direct links, or download certified parchment prints with zero middleman fees.
                  </p>
                  <ul className="space-y-2 text-xs text-charcoal font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange" />
                      <span>Permanent digital ownership across life</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange" />
                      <span>Student controls which data fields are disclosed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange" />
                      <span>Audit trail of which companies viewed your degree</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/student/dashboard"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-orange hover:bg-orange-hover rounded-xl shadow-subtle transition-all"
                    >
                      <span>Open Student Wallet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-card text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-orange text-white font-serif font-bold flex items-center justify-center text-xl mx-auto shadow-md">
                    AS
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-charcoal">Aarav Sharma</h4>
                    <p className="text-xs text-charcoal-muted font-mono">Roll: 2020CS10492 • IIT Delhi</p>
                  </div>
                  <div className="p-3 bg-powder-light border border-powder rounded-xl text-xs font-medium text-powder-dark">
                    Active Verified Credential: VDX-2024-IITD-0891
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'recruiter' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-powder-light text-powder-dark text-xs font-bold font-mono">
                    ENTERPRISE VERIFIER
                  </div>
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">
                    Sub-second background checks with zero fake candidate risk.
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                    HR teams and talent officers scan candidate resume QR codes or type their Credential ID. Within milliseconds, the platform verifies the mathematical signature against the university's registered key and checks revocation status.
                  </p>
                  <ul className="space-y-2 text-xs text-charcoal font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange" />
                      <span>Instant genuine vs counterfeit detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange" />
                      <span>Direct camera QR scanner or manual ID lookup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange" />
                      <span>Compliance audit history logs with ATS exports</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      to="/recruiter/verify"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-orange hover:bg-orange-hover rounded-xl shadow-subtle transition-all"
                    >
                      <span>Open Instant Verifier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-card space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-charcoal-border pb-2">
                    <span>QUERY: VDX-2024-IITD-0891</span>
                    <span className="text-orange">0.18s RESPONSE</span>
                  </div>
                  <div className="p-3 bg-powder-light border border-powder rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-charcoal font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-orange" />
                      <span>OFFICIALLY VERIFIED & AUTHENTIC</span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted">
                      Conferred by IIT Delhi Senate. Cryptographic signature matched.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </GsapReveal>
        </div>
      </section>

      {/* Cryptographic Architecture Pipeline with Powder Blue numbers */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto space-y-12">
          <GsapReveal type="fade-up" className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-orange font-bold">
              Cryptographic Trust Pipeline
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal">
              How Mathematical Integrity Works
            </h2>
            <p className="text-sm text-charcoal-muted">
              Built on proven W3C Verifiable Credential specifications and SHA-256 Merkle proofs.
            </p>
          </GsapReveal>

          <GsapReveal
            type="stagger"
            stagger={0.15}
            selector=".pipeline-card"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="pipeline-card bg-white rounded-2xl border border-powder/50 p-6 shadow-subtle space-y-3 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 rounded-xl bg-powder-light border border-powder text-orange flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-serif font-bold text-base text-charcoal">Senate Key Signing</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                The university Senate generates a cryptographically signed payload containing student credits, honors, and conferral date.
              </p>
            </div>

            <div className="pipeline-card bg-white rounded-2xl border border-powder/50 p-6 shadow-subtle space-y-3 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 rounded-xl bg-powder-light border border-powder text-orange flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-serif font-bold text-base text-charcoal">SHA-256 Merkle Anchor</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                A unique document hash is embedded into an immutable Merkle tree batch root, locking the transcript from post-issue alteration.
              </p>
            </div>

            <div className="pipeline-card bg-white rounded-2xl border border-powder/50 p-6 shadow-subtle space-y-3 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 rounded-xl bg-powder-light border border-powder text-orange flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-serif font-bold text-base text-charcoal">Sovereign Wallet Vault</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                The credential is delivered to the graduate's private vault. The student generates share links or offline verifiable QR codes.
              </p>
            </div>

            <div className="pipeline-card bg-white rounded-2xl border border-powder/50 p-6 shadow-subtle space-y-3 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 rounded-xl bg-powder-light border border-powder text-orange flex items-center justify-center font-bold">
                4
              </div>
              <h4 className="font-serif font-bold text-base text-charcoal">0.2s Recruiter Check</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Recruiters authenticate the signature against the registered university public key and check real-time revocation status.
              </p>
            </div>
          </GsapReveal>
        </div>
      </section>

      {/* Call to Action Banner - Luxury Obsidian Dark with Racing Orange and Powder Blue */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <GsapReveal
          type="scale-up"
          duration={0.85}
          className="max-w-7xl mx-auto bg-[#111617] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-elevated text-center space-y-6 border border-powder/20"
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-orange font-bold">
              VERIDEGREE X DEMONSTRATION PLATFORM
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Ready to experience the future of academic credentials?
            </h2>
            <p className="text-sm sm:text-base text-powder-muted font-light max-w-xl mx-auto">
              Test the end-to-end cycle: issue a degree as a university, inspect the student wallet, and verify instant authenticity as a recruiter.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              to="/select-role"
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-orange hover:bg-orange-hover rounded-xl shadow-card shadow-orange/20 hover:shadow-orange-glow transition-all"
            >
              Select Your Role to Begin
            </Link>
            <Link
              to="/recruiter/verify"
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-powder/30 rounded-xl transition-all"
            >
              Open Instant Verifier
            </Link>
          </div>
        </GsapReveal>
      </section>

      <Footer />
    </div>
  );
};
