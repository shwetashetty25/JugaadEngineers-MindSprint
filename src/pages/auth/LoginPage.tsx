import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('registrar.office@iitd.ac.in');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRoleState] = useState<UserRole>('university');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { setRole, setCurrentUserEmail } = useCredentialStore();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleQuickFill = (targetRole: UserRole) => {
    setRoleState(targetRole);
    if (targetRole === 'university') {
      setEmail('registrar.office@iitd.ac.in');
    } else if (targetRole === 'student') {
      setEmail('aarav.sharma@alumni.iitd.ac.in');
    } else if (targetRole === 'recruiter') {
      setEmail('ksinghania@google.com');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setRole(role);
      setCurrentUserEmail(email);
      setIsLoading(false);
      success('Welcome back!', `Signed in as ${role.toUpperCase()}`);

      if (role === 'university') {
        navigate('/university/dashboard');
      } else if (role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/recruiter/dashboard');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 flex flex-col items-center">
        <BrandLogo to="/" portalSubtitle="Sovereign Academic Ledger" size="lg" />
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          Sign in to your portal
        </h2>
        <p className="text-xs text-charcoal-muted">
          Select your institutional role or credentials to proceed
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-card border border-charcoal-border space-y-6">
          {/* Quick Demo Pre-fills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted font-medium">
              Demo Fast Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('university')}
                className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-all ${
                  role === 'university'
                    ? 'bg-forest-light text-forest border-forest/30 font-semibold shadow-subtle'
                    : 'bg-background text-charcoal-muted border-charcoal-border hover:bg-charcoal-light'
                }`}
              >
                University
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-all ${
                  role === 'student'
                    ? 'bg-forest-light text-forest border-forest/30 font-semibold shadow-subtle'
                    : 'bg-background text-charcoal-muted border-charcoal-border hover:bg-charcoal-light'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('recruiter')}
                className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-all ${
                  role === 'recruiter'
                    ? 'bg-forest-light text-forest border-forest/30 font-semibold shadow-subtle'
                    : 'bg-background text-charcoal-muted border-charcoal-border hover:bg-charcoal-light'
                }`}
              >
                Recruiter
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Institutional / Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                  placeholder="name@university.ac.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-charcoal">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-forest hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-charcoal-border text-forest focus:ring-forest w-3.5 h-3.5"
                />
                <span className="text-xs text-charcoal-muted">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-card transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {role.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-charcoal-muted border-t border-charcoal-border/70">
            <span>Don't have an institution or student wallet? </span>
            <Link to="/register" className="font-semibold text-forest hover:underline">
              Create account
            </Link>
          </div>
        </div>

        {/* Security disclaimer */}
        <p className="text-center text-[11px] text-charcoal-muted mt-6">
          🔒 VeriDegree X Identity Gate • Fictional Demo Instance
        </p>
      </div>
    </div>
  );
};

