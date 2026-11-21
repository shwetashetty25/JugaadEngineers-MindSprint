import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { CertificateDocument } from '../../components/common/CertificateDocument';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useWallet } from '../../contexts/WalletContext';
import { ethers } from 'ethers';
import { encodeCredentialIdToBytes32 } from '../../utils/credentialEncoder';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Building,
  User,
  GraduationCap,
  Calendar,
  Lock,
  History,
  AlertTriangle
} from 'lucide-react';

export const CredentialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCredentialById, getVerificationsForCredential, revokeCredential } = useCredentialStore();
  const { success, error, info } = useToast();
  const { account, revokeCredentialOnChain } = useWallet();

  const credential = id ? getCredentialById(id) : undefined;
  const verifications = id ? getVerificationsForCredential(id) : [];

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revocationReason, setRevocationReason] = useState('Academic Senate Decree #SR-2024-91');
  const [revocationNotes, setRevocationNotes] = useState('Credential nullified per official registrar review.');
  const [isRevoking, setIsRevoking] = useState(false);

  if (!credential) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          Credential Not Found
        </h2>
        <p className="text-xs text-charcoal-muted">
          The requested credential ID "{id}" does not exist in the registry.
        </p>
        <Link
          to="/university/credentials"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-forest rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Credentials</span>
        </Link>
      </div>
    );
  }

  const handleConfirmRevoke = async () => {
    try {
      setIsRevoking(true);
      if (account) {
        info('MetaMask Prompt', 'Please sign the revokeCredential() transaction in MetaMask...');
        const bytesCredId = encodeCredentialIdToBytes32(credential.id);
        const bytesReason = ethers.keccak256(ethers.toUtf8Bytes(revocationReason));
        await revokeCredentialOnChain(bytesCredId, bytesReason);
      }
      const ok = revokeCredential(credential.id, revocationReason, revocationNotes);
      if (ok) {
        success('Revoked On-Chain', `Decree recorded. Credential ${credential.id} marked as Revoked.`);
        setIsRevokeModalOpen(false);
      } else {
        error('Error', 'Unable to revoke credential.');
      }
    } catch (err: any) {
      error('Revocation Failed', err.message || 'Could not complete blockchain revocation.');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Top back & status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-charcoal">
                Credential Detail
              </h1>
              <Badge status={credential.status} size="sm" />
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                DEMO / SIMULATED
              </span>
            </div>
            <p className="font-mono text-xs text-charcoal-muted mt-0.5">
              ID: {credential.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {credential.status !== 'Revoked' && (
            <button
              onClick={() => setIsRevokeModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-all"
            >
              Revoke Credential
            </button>
          )}
        </div>
      </div>

      {/* Revocation Warning Banner if Revoked */}
      {credential.status === 'Revoked' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-red-900">
              OFFICIALLY REVOKED CREDENTIAL
            </h4>
            <p className="text-red-800 leading-relaxed">
              <strong>Reason:</strong> {credential.revocationDetails?.reason}
            </p>
            <p className="text-red-700/80 font-mono text-[11px]">
              Revoked at: {credential.revocationDetails?.revokedAt} by {credential.revocationDetails?.revokedBy}
            </p>
          </div>
        </div>
      )}

      {/* High-Fidelity Degree Certificate Canvas */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-3">
        <h3 className="font-serif font-bold text-lg text-charcoal">
          Certified Digital Degree Document Preview
        </h3>
        <CertificateDocument credential={credential} showActions={true} />
      </div>

      {/* Structured Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student & Degree Metadata */}
        <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
          <h3 className="font-serif font-bold text-base text-charcoal border-b border-charcoal-border/70 pb-2">
            Student & Academic Meta
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Student Name:</span>
              <strong className="text-charcoal">{credential.studentName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Institutional Email:</span>
              <span className="font-mono text-charcoal">{credential.studentEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Enrollment / Roll Number:</span>
              <span className="font-mono font-semibold text-charcoal">{credential.studentEnrollmentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Department:</span>
              <span className="text-charcoal">{credential.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Graduation Year:</span>
              <strong className="text-forest">{credential.graduationYear}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Performance Metric:</span>
              <strong className="text-charcoal">{credential.cgpaOrGrade}</strong>
            </div>
          </div>
        </div>

        {/* Cryptographic Ledger Details */}
        <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-border/70 pb-2">
            <h3 className="font-serif font-bold text-base text-charcoal">
              Cryptographic Integrity Proofs
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              DEMO RECORD
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-charcoal-muted block mb-1">SHA-256 Document Hash:</span>
              <p className="font-mono text-[11px] bg-background p-2 rounded-lg border border-charcoal-border break-all text-forest font-semibold">
                {credential.documentHash || '0x8f2a91b34c7e5d10a904e2876fc931d87f4c02eb98b631f4a9c680214a1e9411'}
              </p>
            </div>
            <div>
              <span className="text-charcoal-muted block mb-1">Ledger Attestation Status:</span>
              <p className="font-mono text-[11px] bg-amber-50/60 p-2 rounded-lg border border-amber-200 text-amber-900 font-medium">
                Client Simulation • Not attested on live Sepolia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification History Log for this specific degree */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-charcoal">
              Verification Audit Trail ({verifications.length})
            </h3>
            <p className="text-xs text-charcoal-muted">
              Historical background check queries performed by recruiters on this credential
            </p>
          </div>
        </div>

        {verifications.length === 0 ? (
          <p className="text-xs text-charcoal-muted py-4">
            No verification queries logged yet for this credential.
          </p>
        ) : (
          <div className="divide-y divide-charcoal-border/60">
            {verifications.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-charcoal">{v.verifierOrganization}</p>
                  <p className="text-[11px] text-charcoal-muted">
                    Verified by {v.verifierName} ({v.verifierEmail}) via {v.verificationMethod}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge status={v.result} size="sm" />
                  <p className="text-[10px] font-mono text-charcoal-muted">{v.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revocation Modal */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Revoke Credential"
        description="Are you certain you wish to revoke this digital degree?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Reason for Revocation *
            </label>
            <input
              type="text"
              required
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-border outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Senate Decree / Administrative Notes
            </label>
            <textarea
              rows={3}
              value={revocationNotes}
              onChange={(e) => setRevocationNotes(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-charcoal-border outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsRevokeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-charcoal-light rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRevoke}
              className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-subtle"
            >
              Confirm Revocation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

