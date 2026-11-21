import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  FileSpreadsheet,
  Award,
  Users,
  AlertTriangle,
  Activity,
  Building2,
  Settings,
  Shield,
  Menu,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { RoleSwitcher } from '../common/RoleSwitcher';
import { BrandLogo } from '../common/BrandLogo';
import { useCredentialStore } from '../../hooks/useCredentialStore';

export const UniversityLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { universities, credentials, duplicateGroups } = useCredentialStore();
  const currentUniv = universities[0]; // IIT Delhi by default
  const activeCredsCount = credentials.filter((c) => c.status === 'Active').length;
  const revokedCredsCount = credentials.filter((c) => c.status === 'Revoked').length;
  const pendingReviewsCount = duplicateGroups.filter((g) => g.reviewStatus === 'PENDING').length;

  const navItems = [
    { label: 'Overview', to: '/university/dashboard', icon: LayoutDashboard },
    { label: 'Database Intelligence', to: '/university/intelligence', icon: Sparkles, count: pendingReviewsCount, countVariant: pendingReviewsCount > 0 ? 'alert' : undefined },
    { label: 'Issue Degree', to: '/university/issue', icon: FilePlus2 },
    { label: 'Bulk Issuance', to: '/university/bulk-issue', icon: FileSpreadsheet },
    { label: 'Issued Credentials', to: '/university/credentials', icon: Award, count: credentials.length },
    { label: 'Students', to: '/university/students', icon: Users },
    { label: 'Revocation', to: '/university/revocations', icon: AlertTriangle, count: revokedCredsCount, countVariant: 'alert' },
    { label: 'Verification Activity', to: '/university/verifications', icon: Activity },
    { label: 'Institution Profile', to: '/university/profile', icon: Building2 },
    { label: 'Settings', to: '/university/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 w-64 bg-white border-r border-charcoal-border flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-charcoal-border flex items-center justify-between">
          <BrandLogo to="/" portalSubtitle="University Portal" size="sm" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 md:hidden text-charcoal-muted hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Institution Badge */}
        <div className="p-3.5 m-3 rounded-xl bg-charcoal-light/70 border border-charcoal-border/70 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white border border-charcoal-border flex items-center justify-center text-lg shadow-subtle shrink-0">
            {currentUniv.logo || '🏛️'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-charcoal truncate" title={currentUniv.name}>
              {currentUniv.name}
            </h4>
            <p className="text-[10px] text-charcoal-muted font-mono truncate">
              ID: {currentUniv.code} • {currentUniv.accreditationStatus.split('/')[0]}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-forest text-white shadow-subtle font-semibold'
                      : 'text-charcoal hover:bg-charcoal-light hover:text-charcoal'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      item.countVariant === 'alert' && item.count > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-charcoal-light text-charcoal-muted'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-charcoal-border text-[11px] text-charcoal-muted space-y-1">
          <div className="flex items-center justify-between">
            <span>Network:</span>
            <span className="text-forest font-semibold">Decentralized Anchor</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span>Status:</span>
            <span className="text-emerald-700 font-medium">● Senate Sync Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-charcoal-border/70 h-16 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-charcoal md:hidden hover:bg-charcoal-light"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-charcoal-muted font-medium">Logged in as Registrar:</span>{' '}
              <span className="text-xs font-semibold text-charcoal">office@iitd.ac.in</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RoleSwitcher />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

