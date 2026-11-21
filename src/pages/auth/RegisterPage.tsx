import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Building, Award, UserCheck } from 'lucide-react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRoleState] = useState<UserRole>('university');
  const [isLoading, setIsLoading] = useState(false);

  const { setRole, setCurrentUserEmail } = useCredentialStore();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      error('Password Mismatch', 'Please verify your password entries match.');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      setRole(role);
      setCurrentUserEmail(email);
      setIsLoading(false);
      success('Account Registered', `Welcome to VeriDegree X as ${role.toUpperCase()}`);

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
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 flex flex-col items-center">
        <BrandLogo to="/" portalSubtitle="Decentralized Trust Network" size="lg" />
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          Register new credentials
        </h2>
        <p className="text-xs text-charcoal-muted">
          Join the decentralized academic verification network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-card border border-charcoal-border space-y-6">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-2">
              Select Your Account Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRoleState('university')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  role === 'university'
                    ? 'bg-forest text-white border-forest shadow-sm'
                    : 'bg-background text-charcoal-muted border-charcoal-border hover:bg-charcoal-light'
                }`}
              >
                <Building className="w-4 h-4" />
                <span className="text-xs font-semibold">University</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleState('student')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  role === 'student'
                    ? 'bg-forest text-white border-forest shadow-sm'
                    : 'bg-background text-charcoal-muted border-charcoal-border hover:bg-charcoal-light'
                }`}
              >
                <Award className="w-4 h-4" />
                <span className="text-xs font-semibold">Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleState('recruiter')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  role === 'recruiter'
                    ? 'bg-forest text-white border-forest shadow-sm'
                    : 'bg-background text-charcoal-muted border-charcoal-border hover:bg-charcoal-light'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-xs font-semibold">Recruiter</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Full Legal Name / Institution Officer
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                placeholder={role === 'university' ? 'Prof. Rangan Banerjee' : 'Aarav Sharma'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                placeholder={
                  role === 'university'
                    ? 'registrar@institution.ac.in'
                    : role === 'student'
                    ? 'student@alumni.ac.in'
                    : 'talent@organization.com'
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-card transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create {role.toUpperCase()} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-charcoal-muted border-t border-charcoal-border/70">
            <span>Already have an account? </span>
            <Link to="/login" className="font-semibold text-forest hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

