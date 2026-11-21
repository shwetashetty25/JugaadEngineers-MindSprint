import React from 'react';
import { Link } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  FileCheck2,
  Search,
  ArrowRight,
  Building,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { verifications, recruiterOrg } = useCredentialStore();

  const totalCount = verifications.length;
  const verifiedCount = verifications.filter((v) => v.result === 'VERIFIED').length;
  const revokedCount = verifications.filter((v) => v.result === 'REVOKED').length;
  const notFoundCount = verifications.filter((v) => v.result === 'NOT_FOUND').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Fast Verify Hero */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-forest-light text-forest text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-forest" />
            <span>Enterprise Verification Gateway</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            {recruiterOrg.name}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed max-w-2xl">
            Welcome, {recruiterOrg.recruiterName}. Verify candidate academic diplomas, check disciplinary revocation
            decrees, and eliminate counterfeit certificates across hiring pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/recruiter/verify"
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-card transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch Verifier</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Total Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-charcoal">{totalCount}</p>
          <p className="text-[11px] text-charcoal-muted">Credentials audited</p>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Authentic & Verified</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-charcoal">{verifiedCount}</p>
          <p className="text-[11px] text-emerald-700 font-semibold font-mono">
            {((verifiedCount / Math.max(totalCount, 1)) * 100).toFixed(0)}% genuine
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Revoked / Disciplinary</span>
            <div className="w-8 h-8 rounded-lg bg-red-100/80 text-red-800 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-charcoal">{revokedCount}</p>
          <p className="text-[11px] text-red-600 font-semibold">Flagged discrepancies</p>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Unknown / Not Found</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-charcoal">{notFoundCount}</p>
          <p className="text-[11px] text-charcoal-muted">Unregistered claims</p>
        </div>
      </div>

      {/* Quick Verify Bar */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-serif font-bold text-lg text-charcoal">
            Instant Credential Check
          </h3>
          <p className="text-xs text-charcoal-muted">
            Enter any candidate Credential ID or scan their resume QR code
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/recruiter/verify?id=VDX-2024-IITD-0891"
            className="px-3 py-1.5 rounded-lg border border-charcoal-border text-xs font-mono font-medium text-forest hover:bg-forest-light transition-colors"
          >
            Check Aarav (Valid)
          </Link>
          <Link
            to="/recruiter/verify?id=VDX-2023-IITD-0104"
            className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-mono font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            Check Aditya (Revoked)
          </Link>
        </div>
      </div>

      {/* Recent Verification Activity */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal">
              Recent Verifications Log
            </h3>
            <p className="text-xs text-charcoal-muted">
              Audit trail of credentials queried by your recruiting team
            </p>
          </div>
          <Link
            to="/recruiter/history"
            className="text-xs font-semibold text-forest hover:underline"
          >
            Full History
          </Link>
        </div>

        <div className="divide-y divide-charcoal-border/60">
          {verifications.slice(0, 5).map((v) => (
            <div key={v.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-forest">{v.credentialId}</span>
                  <Badge status={v.result} size="sm" />
                </div>
                <p className="font-serif font-bold text-sm text-charcoal truncate">
                  {v.studentName}
                </p>
                <p className="text-charcoal-muted text-[11px] truncate">
                  {v.degreeName} • {v.universityName}
                </p>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <Link
                  to={`/recruiter/result/${v.credentialId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline"
                >
                  <span>View Proof</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <p className="text-[10px] font-mono text-charcoal-muted">{v.timestamp.split(' ')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

