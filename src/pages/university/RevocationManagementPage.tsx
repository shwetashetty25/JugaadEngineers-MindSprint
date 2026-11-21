import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import { ShieldAlert, Search, Calendar, FileText, ArrowRight } from 'lucide-react';

export const RevocationManagementPage: React.FC = () => {
  const { credentials } = useCredentialStore();
  const [search, setSearch] = useState('');

  const revokedCredentials = credentials.filter((c) => c.status === 'Revoked');

  const filtered = revokedCredentials.filter((c) =>
    c.studentName.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    (c.revocationDetails?.reason || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Revocation Registry & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Permanently or administratively nullified credentials published to the verification network.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>{revokedCredentials.length} Nullified Records</span>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-white rounded-2xl border border-charcoal-border shadow-subtle flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-forest shrink-0 mt-0.5" />
        <div className="text-xs text-charcoal-muted leading-relaxed">
          <strong className="text-charcoal">Decentralized Revocation Guarantee:</strong> Whenever a degree is revoked
          by the Academic Senate, any recruiter scanning the graduate's physical or digital QR code immediately receives
          a verified <strong>REVOKED</strong> notice along with the official Senate decree reason and timestamp.
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-4 shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search revoked credentials by student name, ID, or revocation decree..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
          />
        </div>
      </div>

      {/* Revoked Credentials List */}
      <div className="bg-white rounded-2xl border border-charcoal-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-red-50/60 text-charcoal font-semibold border-b border-red-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Credential ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Degree</th>
                <th className="py-3 px-4">Revocation Date</th>
                <th className="py-3 px-4">Official Decree Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-muted">
                    No revoked credentials found.
                  </td>
                </tr>
              ) : (
                filtered.map((cred) => (
                  <tr key={cred.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-red-700">
                      {cred.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-charcoal">
                      <div>{cred.studentName}</div>
                      <div className="text-[10px] text-charcoal-muted font-mono">{cred.studentEnrollmentId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal max-w-xs truncate">
                      {cred.degreeName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-muted">
                      {cred.revocationDetails?.revokedAt || '2024-03-12'}
                    </td>
                    <td className="py-3.5 px-4 text-red-900 font-medium max-w-xs">
                      <div>{cred.revocationDetails?.reason || 'Disciplinary Action'}</div>
                      {cred.revocationDetails?.notes && (
                        <p className="text-[10px] text-charcoal-muted truncate">
                          {cred.revocationDetails.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status="REVOKED" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/university/credentials/${cred.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-charcoal hover:text-forest bg-background hover:bg-charcoal-light rounded-lg border border-charcoal-border transition-all inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

