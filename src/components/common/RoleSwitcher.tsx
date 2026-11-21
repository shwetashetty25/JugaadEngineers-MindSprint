import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { UserRole } from '../../types';
import { School, UserCheck, ShieldCheck, RefreshCw, ChevronDown, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface RoleSwitcherProps {
  variant?: 'segmented' | 'dropdown';
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ variant = 'dropdown' }) => {
  const { currentRole, setRole, resetToDefault } = useCredentialStore();
  const navigate = useNavigate();
  const { info, success } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (role: UserRole) => {
    setRole(role);
    setDropdownOpen(false);
    info('Portal Switched', `Switched to ${role.toUpperCase()} Portal`);
    if (role === 'university') navigate('/university/dashboard');
    else if (role === 'student') navigate('/student/dashboard');
    else if (role === 'recruiter') navigate('/recruiter/dashboard');
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Reset demo credentials and logs back to initial state?')) {
      resetToDefault();
      setDropdownOpen(false);
      success('Data Reset', 'All demo credentials refreshed to baseline.');
    }
  };

  const roleMeta = {
    university: { label: 'University', icon: School, color: 'text-orange' },
    student: { label: 'Student', icon: UserCheck, color: 'text-powder-dark' },
    recruiter: { label: 'Recruiter', icon: ShieldCheck, color: 'text-orange' }
  };

  const CurrentIcon = roleMeta[currentRole].icon;

  // Render 1: Clean Dropdown Mode (Ideal for modern clutter-free navbars)
  if (variant === 'dropdown') {
    return (
      <div className="relative inline-flex items-center shrink-0 select-none" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-powder/70 hover:border-orange shadow-subtle hover:shadow-card text-xs font-semibold text-charcoal transition-all group"
          title="Switch Active User Experience"
        >
          <div className="w-5 h-5 rounded-lg bg-powder-light flex items-center justify-center text-orange group-hover:scale-105 transition-transform">
            <CurrentIcon className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-charcoal">
            {roleMeta[currentRole].label} <span className="text-charcoal-muted font-normal hidden md:inline">Portal</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-charcoal-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-powder/80 rounded-2xl shadow-elevated p-2 z-50 animate-scale-in space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase font-bold text-charcoal-muted flex items-center justify-between border-b border-charcoal-border/50">
              <span>Switch Role View</span>
              <span className="text-orange text-[9px] font-bold">Demo Mode</span>
            </div>

            {(['university', 'student', 'recruiter'] as UserRole[]).map((r) => {
              const Icon = roleMeta[r].icon;
              const isSelected = currentRole === r;
              return (
                <button
                  key={r}
                  onClick={() => handleSwitch(r)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#141A1B] text-white font-bold shadow-xs'
                      : 'text-charcoal hover:bg-powder-light/60 hover:text-charcoal'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-orange' : 'text-powder-dark'}`} />
                    <span>{roleMeta[r].label} Portal</span>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                  )}
                </button>
              );
            })}

            <div className="pt-1.5 border-t border-charcoal-border/60 mt-1">
              <button
                onClick={handleReset}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-mono text-charcoal-muted hover:text-orange hover:bg-powder-light transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Credentials</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render 2: Classic Segmented Pill (for sidebars or dedicated toolbars)
  return (
    <div className="relative inline-flex items-center shrink-0 select-none" ref={dropdownRef}>
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-powder/60 rounded-xl shadow-subtle">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-muted pl-1.5 select-none">
          ROLE:
        </span>

        <button
          onClick={() => handleSwitch('university')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            currentRole === 'university'
              ? 'bg-[#141A1B] text-white shadow-xs font-bold'
              : 'text-charcoal-muted hover:text-charcoal hover:bg-powder-light'
          }`}
        >
          University
        </button>

        <button
          onClick={() => handleSwitch('student')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            currentRole === 'student'
              ? 'bg-[#141A1B] text-white shadow-xs font-bold'
              : 'text-charcoal-muted hover:text-charcoal hover:bg-powder-light'
          }`}
        >
          Student
        </button>

        <button
          onClick={() => handleSwitch('recruiter')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            currentRole === 'recruiter'
              ? 'bg-[#141A1B] text-white shadow-xs font-bold'
              : 'text-charcoal-muted hover:text-charcoal hover:bg-powder-light'
          }`}
        >
          Recruiter
        </button>

        <button
          onClick={handleReset}
          title="Reset Demo Data"
          className="p-1 text-charcoal-muted hover:text-orange rounded-md transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
