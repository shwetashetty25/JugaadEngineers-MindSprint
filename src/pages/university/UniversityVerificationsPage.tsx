import React, { useState } from 'react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import { Activity, Search, ShieldCheck, QrCode } from 'lucide-react';

export const UniversityVerificationsPage: React.FC = () => {
  const { verifications } = useCredentialStore();
  const [search, setSearch] = useState('');

  const filtered = verifications.filter((v) =>
    v.verifierOrganization.toLowerCase().includes(search.toLowerCase()) ||
    v.studentName.toLowerCase().includes(search.toLowerCase()) ||
    v.credentialId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Recruiter Verification Activity
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Real-time telemetry of background verification requests executed by employers globally.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-light text-xs font-semibold text-forest">
          <Activity className="w-4 h-4" />
          <span>{verifications.length} Verification Inquiries</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border p-4 shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recruiter organisation, student candidate, or Credential ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-light/70 text-charcoal font-semibold border-b border-charcoal-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Verifier Organization</th>
                <th className="py-3 px-4">Candidate / Student</th>
                <th className="py-3 px-4">Credential ID</th>
                <th className="py-3 px-4">Verification Method</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Location / Node</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/50">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-charcoal-light/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-charcoal">
                    <div>{v.verifierOrganization}</div>
                    <div className="text-[10px] text-charcoal-muted font-normal">
                      Officer: {v.verifierName} ({v.verifierEmail})
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-charcoal">
                    {v.studentName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-forest font-semibold">
                    {v.credentialId}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-muted">
                    <span className="inline-flex items-center gap-1">
                      {v.verificationMethod === 'QR_SCAN' ? (
                        <>
                          <QrCode className="w-3.5 h-3.5 text-forest" />
                          <span>QR Scan</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Direct ID</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-muted">
                    {v.timestamp}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-muted text-[11px]">
                    {v.ipLocation || 'Cloudflare Edge'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge status={v.result} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

