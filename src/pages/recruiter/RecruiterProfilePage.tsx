import React, { useState } from 'react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useToast } from '../../context/ToastContext';
import { Building, Save, CheckCircle2 } from 'lucide-react';

export const RecruiterProfilePage: React.FC = () => {
  const { recruiterOrg, updateRecruiterOrg } = useCredentialStore();
  const { success } = useToast();

  const [orgName, setOrgName] = useState(recruiterOrg.name);
  const [recruiterName, setRecruiterName] = useState(recruiterOrg.recruiterName);
  const [email, setEmail] = useState(recruiterOrg.email);
  const [website, setWebsite] = useState(recruiterOrg.website);
  const [orgId, setOrgId] = useState(recruiterOrg.id);
  const [industry, setIndustry] = useState(recruiterOrg.industry);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRecruiterOrg({
      name: orgName,
      recruiterName,
      email,
      website,
      id: orgId,
      industry
    });
    success('Organization Profile Saved', 'Recruiting verification profile updated.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Organisation Profile
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Registered corporate entity and HR verification credentials.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Accredited Verifier Entity</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-charcoal-border">
          <div className="w-16 h-16 rounded-2xl bg-forest/10 border border-forest/20 flex items-center justify-center text-3xl shadow-subtle shrink-0">
            🏢
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-charcoal">{orgName}</h2>
            <p className="text-xs text-charcoal-muted font-mono mt-0.5">
              Organization Ref: {orgId} • {industry}
            </p>
            <p className="text-xs text-forest font-semibold mt-1">
              Authorized Lead: {recruiterName} ({email})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Organisation Full Name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Organisation ID
            </label>
            <input
              type="text"
              required
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Authorized Recruiter / Talent Lead
            </label>
            <input
              type="text"
              required
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Official Corporate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Corporate Careers Website
            </label>
            <input
              type="url"
              required
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Industry Sector
            </label>
            <input
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-card transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Organisation Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

