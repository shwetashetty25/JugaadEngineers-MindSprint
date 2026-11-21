import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import { FileCheck2, Search, ArrowRight, ShieldCheck } from 'lucide-react';

export const RecruiterHistoryPage: React.FC = () => {
  const { verifications } = useCredentialStore();
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');

  const filtered = verifications.filter((v) => {
    const matchesSearch =
      v.studentName.toLowerCase().includes(search.toLowerCase()) ||
      v.credentialId.toLowerCase().includes(search.toLowerCase()) ||
      v.universityName.toLowerCase().includes(search.toLowerCase()) ||
      v.verifierOrganization.toLowerCase().includes(search.toLowerCase());

    const matchesResult = resultFilter === 'ALL' || v.result === resultFilter;

    return matchesSearch && matchesResult;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Recruiter Verification History
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Complete compliance audit record of all credential verifications conducted by your organization.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-light text-xs font-semibold text-forest">
          <FileCheck2 className="w-4 h-4" />
          <span>{verifications.length} Verifications Audited</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border p-4 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, university, or credential ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
          />
        </div>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-charcoal-border bg-white text-charcoal focus:border-forest outline-none"
        >
          <option value="ALL">All Outcomes</option>
          <option value="VERIFIED">VERIFIED Credentials</option>
          <option value="REVOKED">REVOKED Credentials</option>
          <option value="NOT_FOUND">NOT FOUND</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-light/70 text-charcoal font-semibold border-b border-charcoal-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Credential ID</th>
                <th className="py-3 px-4">Student Candidate</th>
                <th className="py-3 px-4">Conferring University</th>
                <th className="py-3 px-4">Verification Date</th>
                <th className="py-3 px-4">Verifier Officer</th>
                <th className="py-3 px-4">Status Result</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/50">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-charcoal-light/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-forest">
                    {v.credentialId}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-charcoal">
                    <div>{v.studentName}</div>
                    <div className="text-[10px] text-charcoal-muted">{v.degreeName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-charcoal truncate max-w-[200px]">
                    {v.universityName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-muted">
                    {v.timestamp}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-muted">
                    {v.verifierName}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={v.result} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/recruiter/result/${v.credentialId}`}
                      className="px-2.5 py-1 text-xs font-semibold text-charcoal hover:text-forest bg-background hover:bg-charcoal-light rounded-lg border border-charcoal-border transition-all inline-flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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

