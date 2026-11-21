import React from 'react';
import { Link } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import { GsapReveal } from '../../components/common/GsapReveal';
import {
  Wallet,
  GraduationCap,
  Share2,
  CheckCircle2,
  ArrowRight,
  Shield,
  QrCode,
  Download,
  Award
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { credentials } = useCredentialStore();
  const studentEmail = 'aarav.sharma@alumni.iitd.ac.in';

  // Credentials for Aarav Sharma
  const myCredentials = credentials.filter(
    (c) => c.studentEmail.toLowerCase() === studentEmail.toLowerCase()
  );

  const activeCount = myCredentials.filter((c) => c.status === 'Active').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner with GSAP Reveal */}
      <GsapReveal
        type="fade-down"
        duration={0.7}
        className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-forest-light text-forest text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-forest" />
            <span>Self-Sovereign Academic Wallet</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Welcome, Aarav Sharma
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed max-w-2xl">
            You hold complete ownership of your verified academic credentials. Share them instantly
            with recruiters via secure QR codes or download official certified certificates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to={`/student/share/${myCredentials[0]?.id || ''}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share My Degree</span>
          </Link>
        </div>
      </GsapReveal>

      {/* KPI Stats with GSAP Stagger */}
      <GsapReveal
        type="stagger"
        stagger={0.08}
        selector=".kpi-stat"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="kpi-stat bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Total Credentials</span>
            <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-charcoal">{myCredentials.length}</p>
          <p className="text-[11px] text-charcoal-muted">Conferred by accredited institutions</p>
        </div>

        <div className="kpi-stat bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Active & Verifiable</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-charcoal">{activeCount}</p>
          <p className="text-[11px] text-charcoal-muted">Instant cryptographic proof enabled</p>
        </div>

        <div className="kpi-stat bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Recruiter Verifications</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-charcoal">3</p>
          <p className="text-[11px] text-charcoal-muted">Verified by Google & McKinsey</p>
        </div>
      </GsapReveal>

      {/* Main Section: My Academic Credentials with GSAP Stagger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
              My Academic Credentials
            </h2>
            <p className="text-xs text-charcoal-muted">
              Official digital diplomas anchored to your identity
            </p>
          </div>
          <Link
            to="/student/credentials"
            className="text-xs font-semibold text-forest hover:underline"
          >
            All Degrees
          </Link>
        </div>

        <GsapReveal
          type="stagger"
          stagger={0.12}
          selector=".cred-card"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {myCredentials.map((cred) => (
            <div
              key={cred.id}
              className="cred-card bg-white rounded-2xl border border-charcoal-border p-6 shadow-card hover:border-forest/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-forest">
                    {cred.id}
                  </span>
                  <Badge status={cred.status} size="sm" />
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <div className="w-12 h-12 rounded-xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center text-xl shrink-0">
                    🏛️
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-charcoal leading-snug">
                      {cred.degreeName}
                    </h3>
                    <p className="text-xs text-charcoal-muted font-medium mt-0.5">
                      {cred.universityName}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-background rounded-xl border border-charcoal-border/70 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Department:</span>
                    <span className="text-charcoal font-medium">{cred.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Graduation:</span>
                    <strong className="text-forest">Class of {cred.graduationYear}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Performance:</span>
                    <strong className="text-charcoal">{cred.cgpaOrGrade}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Issue Date:</span>
                    <span className="text-charcoal-muted font-mono">{cred.issueDate}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-charcoal-border/60">
                <Link
                  to={`/student/share/${cred.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal bg-charcoal-light hover:bg-charcoal-border/70 rounded-lg transition-all"
                >
                  <QrCode className="w-3.5 h-3.5 text-forest" />
                  <span>Share QR</span>
                </Link>

                <Link
                  to={`/student/credentials/${cred.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-lg shadow-subtle transition-all"
                >
                  <span>View Degree</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </GsapReveal>
      </div>
    </div>
  );
};

