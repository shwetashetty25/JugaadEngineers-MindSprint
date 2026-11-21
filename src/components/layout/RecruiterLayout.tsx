import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  QrCode,
  FileCheck2,
  Building,
  Settings,
  Shield,
  Menu,
  X,
  Search
} from 'lucide-react';
import { RoleSwitcher } from '../common/RoleSwitcher';
import { BrandLogo } from '../common/BrandLogo';
import { useCredentialStore } from '../../hooks/useCredentialStore';

export const RecruiterLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { verifications, recruiterOrg } = useCredentialStore();

  const navItems = [
    { label: 'Overview', to: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Verify Degree', to: '/recruiter/verify', icon: QrCode, highlight: true },
    { label: 'Verification History', to: '/recruiter/history', icon: FileCheck2, count: verifications.length },
    { label: 'Organisation Profile', to: '/recruiter/profile', icon: Building },
    { label: 'Settings', to: '/recruiter/settings', icon: Settings },
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
          <BrandLogo to="/" portalSubtitle="Recruiter Verifier" size="sm" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 md:hidden text-charcoal-muted hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Organisation Card */}
        <div className="p-3.5 m-3 rounded-xl bg-charcoal-light/70 border border-charcoal-border/70 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white border border-charcoal-border flex items-center justify-center text-base shadow-subtle shrink-0">
            🏢
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-charcoal truncate">
              {recruiterOrg.name}
            </h4>
            <p className="text-[10px] text-charcoal-muted truncate">
              {recruiterOrg.recruiterName} • Talent Lead
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
                      : item.highlight
                      ? 'text-forest font-semibold hover:bg-forest-light/60'
                      : 'text-charcoal hover:bg-charcoal-light hover:text-charcoal'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-charcoal-light text-charcoal-muted">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick verify button */}
        <div className="p-4 border-t border-charcoal-border">
          <NavLink
            to="/recruiter/verify"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-lg transition-all shadow-subtle"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Instant Verify Degree</span>
          </NavLink>
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
              <span className="text-xs text-charcoal-muted">Enterprise Verifier: </span>
              <span className="text-xs font-semibold text-charcoal">{recruiterOrg.name}</span>
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

