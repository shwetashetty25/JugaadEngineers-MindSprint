import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Settings, Shield, Key, Bell, Database } from 'lucide-react';

export const UniversitySettingsPage: React.FC = () => {
  const { success } = useToast();
  const [autoNotifyStudents, setAutoNotifyStudents] = useState(true);
  const [allowInstantVerification, setAllowInstantVerification] = useState(true);
  const [requireSenateApproval, setRequireSenateApproval] = useState(true);

  const handleSave = () => {
    success('Settings Updated', 'University registry preferences saved successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-charcoal-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
          University Portal Settings
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
          Configure issuance policies, cryptographic signing preferences, and notification defaults.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-charcoal flex items-center gap-2">
            <Shield className="w-4 h-4 text-forest" />
            <span>Cryptographic Issuance Governance</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-charcoal-border cursor-pointer hover:bg-charcoal-light/30 transition-colors">
              <input
                type="checkbox"
                checked={requireSenateApproval}
                onChange={(e) => setRequireSenateApproval(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-border text-forest focus:ring-forest"
              />
              <div className="text-xs">
                <span className="font-semibold text-charcoal block">
                  Require Senate Committee Co-Signature for Degree Batches
                </span>
                <span className="text-charcoal-muted">
                  Batch issuance requires dual-signing by Director & Controller of Examinations before publishing.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-charcoal-border cursor-pointer hover:bg-charcoal-light/30 transition-colors">
              <input
                type="checkbox"
                checked={allowInstantVerification}
                onChange={(e) => setAllowInstantVerification(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-border text-forest focus:ring-forest"
              />
              <div className="text-xs">
                <span className="font-semibold text-charcoal block">
                  Public Verification Gateway Enabled
                </span>
                <span className="text-charcoal-muted">
                  Permit certified recruiters to verify degree hashes directly without institutional queuing.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-charcoal-border cursor-pointer hover:bg-charcoal-light/30 transition-colors">
              <input
                type="checkbox"
                checked={autoNotifyStudents}
                onChange={(e) => setAutoNotifyStudents(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-border text-forest focus:ring-forest"
              />
              <div className="text-xs">
                <span className="font-semibold text-charcoal block">
                  Automatic Student Wallet Dispatch
                </span>
                <span className="text-charcoal-muted">
                  Immediately dispatch verifiable claim notification to the graduate's personal email.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-charcoal-border flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-card transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

