import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Settings, Shield, Bell, Key } from 'lucide-react';

export const RecruiterSettingsPage: React.FC = () => {
  const { success } = useToast();
  const [autoExportPdf, setAutoExportPdf] = useState(true);
  const [logComplianceAuditTrail, setLogComplianceAuditTrail] = useState(true);
  const [alertOnRevocation, setAlertOnRevocation] = useState(true);

  const handleSave = () => {
    success('Settings Saved', 'Recruiter audit preferences updated.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-charcoal-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
          Recruiter Verifier Settings
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
          Configure hiring compliance automation, webhook logs, and verification alerts.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-charcoal flex items-center gap-2">
            <Shield className="w-4 h-4 text-forest" />
            <span>Compliance & Telemetry Policies</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-charcoal-border cursor-pointer hover:bg-charcoal-light/30 transition-colors">
              <input
                type="checkbox"
                checked={alertOnRevocation}
                onChange={(e) => setAlertOnRevocation(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-border text-forest focus:ring-forest"
              />
              <div className="text-xs">
                <span className="font-semibold text-charcoal block">
                  High-Priority Disciplinary Alerts
                </span>
                <span className="text-charcoal-muted">
                  Immediately flag any candidate credential carrying an Academic Senate disciplinary revocation decree.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-charcoal-border cursor-pointer hover:bg-charcoal-light/30 transition-colors">
              <input
                type="checkbox"
                checked={logComplianceAuditTrail}
                onChange={(e) => setLogComplianceAuditTrail(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-border text-forest focus:ring-forest"
              />
              <div className="text-xs">
                <span className="font-semibold text-charcoal block">
                  Immutable Hiring Compliance Logging
                </span>
                <span className="text-charcoal-muted">
                  Log time-stamped proof of every credential check for internal HR risk & SOC2 compliance reviews.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-charcoal-border cursor-pointer hover:bg-charcoal-light/30 transition-colors">
              <input
                type="checkbox"
                checked={autoExportPdf}
                onChange={(e) => setAutoExportPdf(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-border text-forest focus:ring-forest"
              />
              <div className="text-xs">
                <span className="font-semibold text-charcoal block">
                  Auto-Attach Verification Proof to Candidate ATS
                </span>
                <span className="text-charcoal-muted">
                  Generate signed PDF verification summary for candidate dossiers automatically.
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
            Save Verification Settings
          </button>
        </div>
      </div>
    </div>
  );
};

