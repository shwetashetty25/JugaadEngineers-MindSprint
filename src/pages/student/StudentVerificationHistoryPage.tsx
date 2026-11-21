import React, { useState } from 'react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import { Clock, Search, ShieldCheck, Building } from 'lucide-react';

export const StudentVerificationHistoryPage: React.FC = () => {
  const { verifications } = useCredentialStore();
  const [search, setSearch] = useState('');

  // Verifications for Aarav Sharma or general student queries
  const myVerifications = verifications.filter(
    (v) => v.studentName.toLowerCase().includes('aarav') || v.credentialId.includes('0891')
  );

  const displayList = myVerifications.length > 0 ? myVerifications : verifications.slice(0, 4);

  const filtered = displayList.filter(
    (v) =>
      v.verifierOrganization.toLowerCase().includes(search.toLowerCase()) ||
      v.credentialId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Credential Verification History
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Audit log of all recruiters and verification agencies who queried your credentials.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-light text-xs font-semibold text-forest">
          <Clock className="w-4 h-4" />
          <span>{displayList.length} Inquiries Logged</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border p-4 shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recruiter organization or credential ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-light/70 text-charcoal font-semibold border-b border-charcoal-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Verification Date</th>
                <th className="py-3 px-4">Employer / Organization</th>
                <th className="py-3 px-4">Verifier Officer</th>
                <th className="py-3 px-4">Credential Verified</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/50">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-charcoal-light/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-muted">
                    {v.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-charcoal">
                    {v.verifierOrganization}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-muted">
                    {v.verifierName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-forest font-semibold">
                    {v.credentialId}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-muted">
                    {v.verificationMethod === 'QR_SCAN' ? 'QR Scan' : 'Direct ID'}
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

