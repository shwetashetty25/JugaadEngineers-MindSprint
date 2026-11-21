import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Lock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-charcoal-border py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-3">
          <BrandLogo to="/" portalSubtitle="Decentralized Credential Ledger" size="md" />
          <p className="text-xs text-charcoal-muted leading-relaxed max-w-sm">
            Blockchain-based digital academic credential storage & instant verification platform.
            Empowering universities to issue tamper-proof degrees, students to own their achievements,
            and recruiters to verify authenticity in seconds.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-charcoal-muted">
            <Lock className="w-3.5 h-3.5 text-forest" />
            <span>Cryptographic Merkle Proof Ready (Phase 1 Prototype)</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">
            Platform Roles
          </h4>
          <ul className="space-y-2 text-xs text-charcoal-muted">
            <li>
              <Link to="/university/dashboard" className="hover:text-forest transition-colors">
                University Portal
              </Link>
            </li>
            <li>
              <Link to="/university/issue" className="hover:text-forest transition-colors">
                Issue Degree
              </Link>
            </li>
            <li>
              <Link to="/university/bulk-issue" className="hover:text-forest transition-colors">
                Bulk CSV Issuance
              </Link>
            </li>
            <li>
              <Link to="/student/dashboard" className="hover:text-forest transition-colors">
                Student Wallet
              </Link>
            </li>
            <li>
              <Link to="/recruiter/verify" className="hover:text-forest transition-colors">
                Recruiter Verifier
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">
            Trust & Security
          </h4>
          <ul className="space-y-2 text-xs text-charcoal-muted">
            <li>
              <span className="text-charcoal-muted">Cryptographic Hashes</span>
            </li>
            <li>
              <span className="text-charcoal-muted">Decentralized Revocation</span>
            </li>
            <li>
              <span className="text-charcoal-muted">Student-Controlled Sharing</span>
            </li>
            <li>
              <span className="text-charcoal-muted">EVM Testnet Roadmapped</span>
            </li>
            <li>
              <span className="text-charcoal-muted">Zero-Knowledge Eligibility</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">
            Governance & Specs
          </h4>
          <ul className="space-y-2 text-xs text-charcoal-muted">
            <li>
              <span className="hover:text-forest cursor-pointer transition-colors">Documentation</span>
            </li>
            <li>
              <span className="hover:text-forest cursor-pointer transition-colors">W3C Verifiable Credentials</span>
            </li>
            <li>
              <span className="hover:text-forest cursor-pointer transition-colors">Privacy Policy</span>
            </li>
            <li>
              <span className="hover:text-forest cursor-pointer transition-colors">Terms of Issuance</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-charcoal-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-muted gap-4">
        <p>© 2026 VERIDEGREE X. Built with modern high-fidelity digital credential standards.</p>
        <p className="text-[11px] font-mono">
          Demonstration Environment • Fully functional mock state
        </p>
      </div>
    </footer>
  );
};

