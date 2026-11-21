import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Wallet,
  GraduationCap,
  Share2,
  Clock,
  User,
  Settings,
  Shield,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { RoleSwitcher } from '../common/RoleSwitcher';
import { BrandLogo } from '../common/BrandLogo';
import { useCredentialStore } from '../../hooks/useCredentialStore';

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { credentials } = useCredentialStore();

  // Find active student (Aarav Sharma) credentials
  const studentEmail = 'aarav.sharma@alumni.iitd.ac.in';
  const studentCreds = credentials.filter(
    (c) => c.studentEmail.toLowerCase() === studentEmail.toLowerCase()
  );

  const navItems = [
    { label: 'Overview', to: '/student/dashboard', icon: Wallet },
    { label: 'My Credentials', to: '/student/credentials', icon: GraduationCap, count: studentCreds.length },
    { label: 'Share Degree', to: '/student/share', icon: Share2 },
    { label: 'Verification History', to: '/student/history', icon: Clock },
    { label: 'Profile', to: '/student/profile', icon: User },
    { label: 'Settings', to: '/student/settings', icon: Settings },
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
          <BrandLogo to="/" portalSubtitle="Student Wallet" size="sm" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 md:hidden text-charcoal-muted hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Profile Pill */}
        <div className="p-3.5 m-3 rounded-xl bg-forest-light/60 border border-forest/15 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-forest text-white font-serif font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
            AS
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-charcoal truncate">Aarav Sharma</h4>
            <p className="text-[10px] text-charcoal-muted font-mono truncate">
              ID: 2020CS10492 • IIT Delhi
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
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-charcoal-light text-charcoal-muted">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Security badge */}
        <div className="p-4 border-t border-charcoal-border text-[11px] text-charcoal-muted space-y-1.5">
          <div className="flex items-center gap-1.5 text-forest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Self-Sovereign Storage</span>
          </div>
          <p className="text-[10px] leading-relaxed text-charcoal-muted">
            You hold and control access to your digital degree credentials.
          </p>
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
              <span className="text-xs text-charcoal-muted">Student Wallet: </span>
              <span className="text-xs font-semibold text-charcoal">aarav.sharma@alumni.iitd.ac.in</span>
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

