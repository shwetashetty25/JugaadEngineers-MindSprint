import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Settings, Shield, Bell, Lock } from 'lucide-react';

export const StudentSettingsPage: React.FC = () => {
  const { success } = useToast();
  const [notifyOnVerification, setNotifyOnVerification] = useState(true);
  const [hideCgpaByDefault, setHideCgpaByDefault] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const handleSave = () => {
    success('Settings Updated', 'Student privacy preferences saved.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-charcoal-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
          Student Wallet Settings
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
          Configure security, telemetry alerts, and self-sovereign sharing permissions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-charcoal flex items-center gap-2">
            <Lock className="w-4 h-4 text-forest" />
            <span>Privacy & Access Control</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-charcoal-border cursor-pointer hover:bg-charcoal-light/30 transition-colors">
              <input
                type="checkbox"
                checked={notifyOnVerification}
                onChange={(e) => setNotifyOnVerification(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-border text-forest focus:ring-forest"
              />
              <div className="text-xs">
                <span className="font-semibold text-charcoal block">
                  Notify Me Whenever an Employer Scans My Degree
                </span>
                <span className="text-charcoal-muted">
                  Receive instant notification with the employer's company name and verification timestamp.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-charcoal-border cursor-pointer hover:bg-charcoal-light/30 transition-colors">
              <input
                type="checkbox"
                checked={hideCgpaByDefault}
                onChange={(e) => setHideCgpaByDefault(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-border text-forest focus:ring-forest"
              />
              <div className="text-xs">
                <span className="font-semibold text-charcoal block">
                  Zero-Knowledge Performance Mode
                </span>
                <span className="text-charcoal-muted">
                  Prove degree conferral authenticity without displaying exact CGPA marks in public previews.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-charcoal-border cursor-pointer hover:bg-charcoal-light/30 transition-colors">
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-border text-forest focus:ring-forest"
              />
              <div className="text-xs">
                <span className="font-semibold text-charcoal block">
                  Hardware Key / Passkey Verification
                </span>
                <span className="text-charcoal-muted">
                  Require cryptographic biometric signature before approving high-value degree transfers.
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
            Save Privacy Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

