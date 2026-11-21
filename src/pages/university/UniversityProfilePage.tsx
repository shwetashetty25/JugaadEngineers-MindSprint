import React, { useState } from 'react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useToast } from '../../context/ToastContext';
import { Building2, CheckCircle2, Globe, Mail, MapPin, Award, Save } from 'lucide-react';

export const UniversityProfilePage: React.FC = () => {
  const { universities, updateUniversity } = useCredentialStore();
  const currentUniv = universities[0]; // IIT Delhi
  const { success } = useToast();

  const [name, setName] = useState(currentUniv.name);
  const [code, setCode] = useState(currentUniv.code);
  const [officialEmail, setOfficialEmail] = useState(currentUniv.officialEmail);
  const [website, setWebsite] = useState(currentUniv.website);
  const [country, setCountry] = useState(currentUniv.country);
  const [state, setState] = useState(currentUniv.state);
  const [signatory, setSignatory] = useState(currentUniv.authorizedSignatory);
  const [designation, setDesignation] = useState(currentUniv.signatoryDesignation);
  const [accreditation, setAccreditation] = useState(currentUniv.accreditationStatus);
  const [establishedYear, setEstablishedYear] = useState(currentUniv.establishedYear);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUniversity(currentUniv.id, {
      name,
      code,
      officialEmail,
      website,
      country,
      state,
      authorizedSignatory: signatory,
      signatoryDesignation: designation,
      accreditationStatus: accreditation,
      establishedYear: Number(establishedYear)
    });
    success('Profile Updated', 'Institution profile metadata has been refreshed.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Institution Profile & Identity
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Registered educational authority and accredited digital signing authority details.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Accredited Academic Authority</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card space-y-6">
        {/* Crest & Identity Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-charcoal-border">
          <div className="w-16 h-16 rounded-2xl bg-forest/10 border border-forest/20 flex items-center justify-center text-3xl shadow-subtle shrink-0">
            {currentUniv.logo || '🏛️'}
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-charcoal">
              {name}
            </h2>
            <p className="text-xs text-charcoal-muted font-mono mt-0.5">
              Institution Code: {code} • Est. {establishedYear}
            </p>
            <p className="text-xs text-forest font-semibold mt-1">
              {accreditation}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Institution Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Institutional Code
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Official Registrar Email
            </label>
            <input
              type="email"
              required
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Official Website
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
              State / Province
            </label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Country
            </label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Authorized Signatory Name
            </label>
            <input
              type="text"
              required
              value={signatory}
              onChange={(e) => setSignatory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Signatory Designation
            </label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
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
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

