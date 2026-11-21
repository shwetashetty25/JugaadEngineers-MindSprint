import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Award,
  Search,
  Filter,
  FilePlus2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Copy,
  Check
} from 'lucide-react';

export const IssuedCredentialsPage: React.FC = () => {
  const { credentials, revokeCredential } = useCredentialStore();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Revocation Modal state
  const [revokingCredId, setRevokingCredId] = useState<string | null>(null);
  const [revocationReason, setRevocationReason] = useState('Senate Disciplinary Action - Academic Discrepancy');
  const [revocationNotes, setRevocationNotes] = useState('Senate review committee decree: Credential nullified.');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCredentials = credentials.filter((c) => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.studentEnrollmentId.toLowerCase().includes(search.toLowerCase()) ||
      c.degreeName.toLowerCase().includes(search.toLowerCase());

    const matchesDegree =
      degreeFilter === 'ALL' ||
      (degreeFilter === 'BTECH' && c.degreeName.toLowerCase().includes('bachelor of technology')) ||
      (degreeFilter === 'MANAGEMENT' && (c.degreeName.toLowerCase().includes('mba') || c.degreeName.toLowerCase().includes('bba'))) ||
      (degreeFilter === 'COMMERCE' && c.degreeName.toLowerCase().includes('commerce'));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesDegree && matchesStatus;
  });

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    success('Copied', `Credential ID ${id} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenRevoke = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevokingCredId(id);
  };

  const handleConfirmRevoke = () => {
    if (!revokingCredId) return;
    const ok = revokeCredential(revokingCredId, revocationReason, revocationNotes);
    if (ok) {
      success('Credential Revoked', `Credential ${revokingCredId} status updated to Revoked.`);
    } else {
      error('Revocation Error', 'Failed to update credential status.');
    }
    setRevokingCredId(null);
  };

  const targetCred = credentials.find((c) => c.id === revokingCredId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Issued Academic Credentials
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Comprehensive registry of all degrees conferred and digitally signed on VeriDegree X.
          </p>
        </div>

        <Link
          to="/university/issue"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all shrink-0"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Issue New Degree</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-4 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, enrollment ID, or Credential ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={degreeFilter}
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-charcoal-border bg-white text-charcoal focus:border-forest outline-none"
          >
            <option value="ALL">All Degrees</option>
            <option value="BTECH">B.Tech Degrees</option>
            <option value="MANAGEMENT">Management (MBA/BBA)</option>
            <option value="COMMERCE">Commerce & Economics</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-charcoal-border bg-white text-charcoal focus:border-forest outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Credentials</option>
            <option value="Revoked">Revoked Credentials</option>
          </select>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="bg-white rounded-2xl border border-charcoal-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-light/70 text-charcoal font-semibold border-b border-charcoal-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Credential ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Degree Title</th>
                <th className="py-3 px-4">Graduation</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/50">
              {filteredCredentials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-muted">
                    No academic credentials found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredCredentials.map((cred) => (
                  <tr key={cred.id} className="hover:bg-charcoal-light/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-charcoal">
                      <div className="flex items-center gap-1.5">
                        <span className="text-forest">{cred.id}</span>
                        <button
                          onClick={(e) => handleCopy(cred.id, e)}
                          title="Copy ID"
                          className="p-1 hover:bg-charcoal-light rounded text-charcoal-muted hover:text-charcoal"
                        >
                          {copiedId === cred.id ? (
                            <Check className="w-3 h-3 text-forest" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-charcoal">
                      <div>{cred.studentName}</div>
                      <div className="text-[10px] text-charcoal-muted font-mono">{cred.studentEnrollmentId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal max-w-xs truncate" title={cred.degreeName}>
                      {cred.degreeName}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal font-medium">
                      {cred.graduationYear}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-muted">
                      {cred.issueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge status={cred.status} size="sm" />
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          DEMO
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/university/credentials/${cred.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-charcoal hover:text-forest bg-background hover:bg-charcoal-light rounded-lg border border-charcoal-border transition-all"
                      >
                        Details
                      </Link>
                      {cred.status !== 'Revoked' && (
                        <button
                          onClick={(e) => handleOpenRevoke(cred.id, e)}
                          className="px-2.5 py-1 text-xs font-semibold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Confirmation Modal */}
      <Modal
        isOpen={!!revokingCredId}
        onClose={() => setRevokingCredId(null)}
        title="Revoke Academic Credential"
        description="Revoking an academic credential nullifies its authenticity globally on the VeriDegree X network."
        maxWidth="md"
      >
        {targetCred && (
          <div className="space-y-4">
            <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-200 text-xs space-y-1.5">
              <div className="flex justify-between font-mono font-semibold text-red-900">
                <span>Credential ID:</span>
                <span>{targetCred.id}</span>
              </div>
              <div className="flex justify-between text-charcoal">
                <span>Student:</span>
                <strong>{targetCred.studentName}</strong>
              </div>
              <div className="flex justify-between text-charcoal">
                <span>Degree:</span>
                <span className="truncate max-w-[220px]">{targetCred.degreeName}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Official Revocation Reason *
              </label>
              <select
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-border bg-white text-charcoal outline-none focus:border-red-500"
              >
                <option value="Senate Disciplinary Action - Academic Discrepancy">
                  Senate Disciplinary Action - Academic Discrepancy
                </option>
                <option value="Administrative Supercession - Reissued with Corrected CGPA">
                  Administrative Supercession - Reissued with Corrected CGPA
                </option>
                <option value="Transcript Forgery on Prerequisite Credits">
                  Transcript Forgery on Prerequisite Credits
                </option>
                <option value="Clerical Error in Degree Award Notification">
                  Clerical Error in Degree Award Notification
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Senate Resolution / Registrar Notes
              </label>
              <textarea
                rows={3}
                value={revocationNotes}
                onChange={(e) => setRevocationNotes(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-charcoal-border focus:border-red-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokingCredId(null)}
                className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-charcoal-light rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-subtle transition-all"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

