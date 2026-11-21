import React from 'react';
import { Link } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import { GsapReveal } from '../../components/common/GsapReveal';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FilePlus2,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Search,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const UniversityDashboard: React.FC = () => {
  const { universities, credentials, verifications } = useCredentialStore();
  const currentUniv = universities[0]; // IIT Delhi

  const univCredentials = credentials.filter((c) => c.universityId === currentUniv.id);
  const activeCount = univCredentials.filter((c) => c.status === 'Active').length;
  const revokedCount = univCredentials.filter((c) => c.status === 'Revoked').length;
  const recentCredentials = univCredentials.slice(0, 5);
  const recentVerifications = verifications.slice(0, 4);

  // Realistic mock monthly issuance trend
  const chartData = [
    { month: 'Jun 2023', issued: 48, verifications: 82 },
    { month: 'Jul 2023', issued: 120, verifications: 140 },
    { month: 'Aug 2023', issued: 35, verifications: 110 },
    { month: 'Sep 2023', issued: 20, verifications: 95 },
    { month: 'Oct 2023', issued: 18, verifications: 104 },
    { month: 'Nov 2023', issued: 24, verifications: 130 },
    { month: 'Dec 2023', issued: 15, verifications: 88 },
    { month: 'Jan 2024', issued: 30, verifications: 142 },
    { month: 'Feb 2024', issued: 22, verifications: 160 },
    { month: 'Mar 2024', issued: 28, verifications: 190 },
    { month: 'Apr 2024', issued: 45, verifications: 210 },
    { month: 'May 2024', issued: 180, verifications: 340 },
    { month: 'Jun 2024', issued: 240, verifications: 490 }
  ];

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
            <span>Verified Institution Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            {currentUniv.name}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed max-w-2xl">
            Welcome, Registrar Office. Issue tamper-proof digital degrees, manage student batch distributions,
            and monitor cryptographic verification activity across recruiters.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/university/issue"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Issue New Degree</span>
          </Link>
          <Link
            to="/university/bulk-issue"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-charcoal bg-charcoal-light hover:bg-charcoal-border/70 rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-forest" />
            <span>Bulk CSV</span>
          </Link>
          <Link
            to="/university/intelligence"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-charcoal bg-white border border-charcoal-border hover:bg-charcoal-light rounded-xl shadow-subtle transition-all"
          >
            <Sparkles className="w-4 h-4 text-forest" />
            <span>AI Deduplication</span>
          </Link>
        </div>
      </GsapReveal>

      {/* KPI Statistic Cards with GSAP Stagger */}
      <GsapReveal
        type="stagger"
        stagger={0.08}
        selector=".kpi-card"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Issued */}
        <div className="kpi-card bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Total Degrees Issued</span>
            <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-3xl font-bold text-charcoal">{univCredentials.length}</p>
            <span className="text-xs text-forest font-semibold">+12% this cycle</span>
          </div>
          <p className="text-[11px] text-charcoal-muted">Digitally anchored credentials</p>
        </div>

        {/* Active Credentials */}
        <div className="kpi-card bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Active Credentials</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-3xl font-bold text-charcoal">{activeCount}</p>
            <span className="text-xs text-emerald-700 font-semibold font-mono">
              {((activeCount / Math.max(univCredentials.length, 1)) * 100).toFixed(0)}% valid
            </span>
          </div>
          <p className="text-[11px] text-charcoal-muted">Authentic & verifiable globally</p>
        </div>

        {/* Revoked Credentials */}
        <div className="kpi-card bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Revoked Credentials</span>
            <div className="w-8 h-8 rounded-lg bg-red-100/80 text-red-800 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-3xl font-bold text-charcoal">{revokedCount}</p>
            <span className="text-xs text-red-600 font-semibold">Senate decrees</span>
          </div>
          <p className="text-[11px] text-charcoal-muted">Nullified on verification network</p>
        </div>

        {/* Total Verification Requests */}
        <div className="kpi-card bg-white rounded-2xl border border-charcoal-border p-5 shadow-subtle space-y-2 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Total Verifications</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-3xl font-bold text-charcoal">{verifications.length * 142 + 28}</p>
            <span className="text-xs text-forest font-semibold">Instant response</span>
          </div>
          <p className="text-[11px] text-charcoal-muted">Zero registrar manual workload</p>
        </div>
      </GsapReveal>

      {/* Credential Issuance & Verification Trend Chart */}
      <GsapReveal
        type="fade-up"
        duration={0.75}
        className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal">
              Credential Issuance & Verification Activity
            </h3>
            <p className="text-xs text-charcoal-muted">
              Monthly degree issuance compared against recruiter background check queries
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange" />
              <span className="text-charcoal-muted">Verifications</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-powder" />
              <span className="text-charcoal-muted">Degrees Issued</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVerif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F45B0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F45B0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A8C9C8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#A8C9C8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E9E9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667779' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#667779' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #DFE8E8',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(20,26,27,0.06)'
                }}
              />
              <Area type="monotone" dataKey="verifications" stroke="#F45B0B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVerif)" />
              <Area type="monotone" dataKey="issued" stroke="#3A6867" strokeWidth={2} fillOpacity={1} fill="url(#colorIssued)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GsapReveal>

      {/* Two Column Layout: Recent Issued Degrees & Recent Verification Logs */}
      <GsapReveal type="fade-up" delay={0.1} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recently Issued Degrees (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal">
                Recently Issued Credentials
              </h3>
              <p className="text-xs text-charcoal-muted">
                Latest student degrees conferred and anchored
              </p>
            </div>
            <Link
              to="/university/credentials"
              className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-charcoal-border/60">
            {recentCredentials.map((cred) => (
              <div key={cred.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-charcoal">
                      {cred.id}
                    </span>
                    <Badge status={cred.status} size="sm" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-charcoal truncate">
                    {cred.studentName}
                  </h4>
                  <p className="text-xs text-charcoal-muted truncate">
                    {cred.degreeName} • {cred.graduationYear}
                  </p>
                </div>

                <Link
                  to={`/university/credentials/${cred.id}`}
                  className="px-3 py-1.5 rounded-lg border border-charcoal-border text-xs font-medium text-charcoal hover:bg-charcoal-light transition-colors shrink-0"
                >
                  Details
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Verification Activity (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal">
                Recruiter Verification Feed
              </h3>
              <p className="text-xs text-charcoal-muted">
                Live employer background check telemetry
              </p>
            </div>
            <Link
              to="/university/verifications"
              className="text-xs font-semibold text-forest hover:underline"
            >
              Log
            </Link>
          </div>

          <div className="space-y-3">
            {recentVerifications.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-background border border-charcoal-border/70 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-charcoal truncate max-w-[180px]">
                    {v.verifierOrganization}
                  </span>
                  <Badge status={v.result} size="sm" />
                </div>
                <p className="text-xs text-charcoal-muted">
                  Checked degree of <strong className="text-charcoal">{v.studentName}</strong>
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-charcoal-muted">
                  <span>ID: {v.credentialId}</span>
                  <span>{v.timestamp.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GsapReveal>
    </div>
  );
};

