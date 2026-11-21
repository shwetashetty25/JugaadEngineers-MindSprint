import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, UserCircle, Search, ShieldCheck } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { BrandLogo } from './BrandLogo';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useWallet } from '../../contexts/WalletContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentRole } = useCredentialStore();
  const { account, isSepolia, connectWallet, disconnectWallet, isConnecting, isDemoWallet } = useWallet();
  const location = useLocation();

  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/select-role';

  const roleDashboardUrl =
    currentRole === 'university'
      ? '/university/dashboard'
      : currentRole === 'student'
      ? '/student/dashboard'
      : '/recruiter/dashboard';

  return (
    <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-powder/60 transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* 1. Left: Brand Identity & Logo */}
          <div className="flex items-center shrink-0">
            <BrandLogo to="/" portalSubtitle="Credential Ledger" size="md" />
          </div>

          {/* 2. Center: Clean Editorial Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1 bg-powder-light/40 rounded-full border border-powder/50">
            <Link
              to="/#how-it-works"
              className="px-3 py-1.5 text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-white rounded-full transition-all"
            >
              How It Works
            </Link>
            <Link
              to="/university/dashboard"
              className="px-3 py-1.5 text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-white rounded-full transition-all"
            >
              Universities
            </Link>
            <Link
              to="/student/dashboard"
              className="px-3 py-1.5 text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-white rounded-full transition-all"
            >
              Students
            </Link>
            <Link
              to="/recruiter/verify"
              className="px-3 py-1.5 text-xs font-semibold text-charcoal-muted hover:text-charcoal hover:bg-white rounded-full transition-all"
            >
              Recruiters
            </Link>
            <Link
              to="/recruiter/verify"
              className="px-3 py-1.5 text-xs font-bold text-orange hover:text-orange-hover hover:bg-white rounded-full transition-all flex items-center gap-1"
            >
              <Search className="w-3 h-3 text-orange" />
              <span>Verify Degree</span>
            </Link>
          </div>

          {/* 3. Right: Sleek Action Area */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Web3 MetaMask Wallet Status Pill */}
            {account ? (
              <button
                onClick={disconnectWallet}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-powder-light/80 hover:bg-powder/80 border border-powder text-xs font-mono font-semibold text-charcoal shadow-xs transition-colors cursor-pointer"
                title={`Connected: ${account} (Click to disconnect)`}
              >
                <span className={`w-2 h-2 rounded-full ${isDemoWallet ? 'bg-orange animate-pulse' : isSepolia ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                <span className="text-[10px] text-powder-dark font-sans font-bold uppercase">
                  {isDemoWallet ? 'Demo Wallet' : isSepolia ? 'Sepolia' : 'Wrong Net'}
                </span>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-powder-light border border-powder/70 text-xs font-bold text-charcoal shadow-subtle hover:border-orange transition-all cursor-pointer"
                title="Connect MetaMask or Demo Wallet"
              >
                <span className="text-sm">🦊</span>
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}

            {/* Minimalist Dropdown Role Switcher */}
            <RoleSwitcher variant="dropdown" />

            {/* Auth CTAs */}
            {isPublicPage ? (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-bold text-charcoal hover:text-orange transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/select-role"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange hover:bg-orange-hover rounded-xl shadow-card shadow-orange/20 hover:shadow-orange-glow transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <Link
                to={roleDashboardUrl}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-charcoal bg-white border border-powder rounded-xl hover:bg-powder-light transition-all shadow-subtle shrink-0"
              >
                <UserCircle className="w-3.5 h-3.5 text-orange" />
                <span className="capitalize">{currentRole} Portal</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-powder-light transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-orange" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-powder/60 px-5 pt-3 pb-6 space-y-3 animate-slide-up shadow-card">
          <div className="space-y-1">
            <Link
              to="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-charcoal py-2 border-b border-charcoal-border/30"
            >
              How It Works
            </Link>
            <Link
              to="/university/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-charcoal py-2 border-b border-charcoal-border/30"
            >
              University Portal
            </Link>
            <Link
              to="/student/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-charcoal py-2 border-b border-charcoal-border/30"
            >
              Student Wallet
            </Link>
            <Link
              to="/recruiter/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-charcoal py-2 border-b border-charcoal-border/30"
            >
              Recruiter Verification
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-powder font-semibold text-xs text-charcoal hover:bg-powder-light transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/select-role"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-orange text-white font-bold text-xs shadow-card"
            >
              Get Started Now →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
