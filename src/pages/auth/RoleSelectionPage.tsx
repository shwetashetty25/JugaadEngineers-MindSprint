import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Building, Award, UserCheck, ArrowRight } from 'lucide-react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { UserRole } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';

export const RoleSelectionPage: React.FC = () => {
  const { setRole } = useCredentialStore();
  const navigate = useNavigate();

  const handleSelect = (role: UserRole, targetRoute: string) => {
    setRole(role);
    navigate(targetRoute);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo to="/" portalSubtitle="Decentralized Trust Network" size="lg" />
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal">
            Choose Your Experience
          </h1>
          <p className="text-sm text-charcoal-muted max-w-lg mx-auto">
            VeriDegree X provides tailored workflows for accredited universities, graduating students, and corporate recruiters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: University */}
          <div className="bg-white rounded-2xl border border-charcoal-border p-7 shadow-card hover:border-forest/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-colors">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-charcoal">
                  1. University
                </h3>
                <p className="text-xs text-forest font-mono font-medium mt-0.5">
                  Academic Issuer & Registrar
                </p>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Issue and manage digital academic credentials. Upload batch records via CSV, govern revocations, and monitor verification telemetry.
              </p>
            </div>

            <button
              onClick={() => handleSelect('university', '/university/dashboard')}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all"
            >
              <span>Enter as University</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Student */}
          <div className="bg-white rounded-2xl border border-charcoal-border p-7 shadow-card hover:border-forest/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-charcoal">
                  2. Student
                </h3>
                <p className="text-xs text-forest font-mono font-medium mt-0.5">
                  Degree Holder & Wallet
                </p>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Store and share your verified academic degrees. Generate dynamic QR codes, control recruiter access, and download official credentials.
              </p>
            </div>

            <button
              onClick={() => handleSelect('student', '/student/dashboard')}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all"
            >
              <span>Enter as Student</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Recruiter */}
          <div className="bg-white rounded-2xl border border-charcoal-border p-7 shadow-card hover:border-forest/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-colors">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-charcoal">
                  3. Recruiter
                </h3>
                <p className="text-xs text-forest font-mono font-medium mt-0.5">
                  Enterprise Verifier & HR
                </p>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Verify academic credentials instantly. Scan candidate QR codes or enter credential IDs for cryptographic authenticity confirmation.
              </p>
            </div>

            <button
              onClick={() => handleSelect('recruiter', '/recruiter/verify')}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-subtle transition-all"
            >
              <span>Enter as Recruiter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-charcoal-muted">
          Need to return home?{' '}
          <Link to="/" className="text-forest font-semibold hover:underline">
            Back to Public Overview
          </Link>
        </p>
      </div>
    </div>
  );
};

