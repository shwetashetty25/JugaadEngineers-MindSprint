import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { WalletProvider } from './contexts/WalletContext';

// Public & Auth Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage';

// Layouts
import { UniversityLayout } from './components/layout/UniversityLayout';
import { StudentLayout } from './components/layout/StudentLayout';
import { RecruiterLayout } from './components/layout/RecruiterLayout';

// University Pages
import { UniversityDashboard } from './pages/university/UniversityDashboard';
import { AcademicIntelligencePage } from './pages/university/AcademicIntelligencePage';
import { IssueDegreePage } from './pages/university/IssueDegreePage';
import { BulkIssuePage } from './pages/university/BulkIssuePage';
import { IssuedCredentialsPage } from './pages/university/IssuedCredentialsPage';
import { CredentialDetailPage } from './pages/university/CredentialDetailPage';
import { UniversityStudentsPage } from './pages/university/UniversityStudentsPage';
import { RevocationManagementPage } from './pages/university/RevocationManagementPage';
import { UniversityVerificationsPage } from './pages/university/UniversityVerificationsPage';
import { UniversityProfilePage } from './pages/university/UniversityProfilePage';
import { UniversitySettingsPage } from './pages/university/UniversitySettingsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyCredentialsPage } from './pages/student/MyCredentialsPage';
import { StudentCredentialDetailPage } from './pages/student/StudentCredentialDetailPage';
import { ShareCredentialPage } from './pages/student/ShareCredentialPage';
import { StudentVerificationHistoryPage } from './pages/student/StudentVerificationHistoryPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentSettingsPage } from './pages/student/StudentSettingsPage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { VerifyDegreePage } from './pages/recruiter/VerifyDegreePage';
import { VerificationResultPage } from './pages/recruiter/VerificationResultPage';
import { RecruiterHistoryPage } from './pages/recruiter/RecruiterHistoryPage';
import { RecruiterProfilePage } from './pages/recruiter/RecruiterProfilePage';
import { RecruiterSettingsPage } from './pages/recruiter/RecruiterSettingsPage';

export function App() {
  return (
    <ToastProvider>
      <WalletProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/select-role" element={<RoleSelectionPage />} />

          {/* University Portal */}
          <Route path="/university" element={<UniversityLayout />}>
            <Route index element={<Navigate to="/university/dashboard" replace />} />
            <Route path="dashboard" element={<UniversityDashboard />} />
            <Route path="intelligence" element={<AcademicIntelligencePage />} />
            <Route path="issue" element={<IssueDegreePage />} />
            <Route path="bulk-issue" element={<BulkIssuePage />} />
            <Route path="credentials" element={<IssuedCredentialsPage />} />
            <Route path="credentials/:id" element={<CredentialDetailPage />} />
            <Route path="students" element={<UniversityStudentsPage />} />
            <Route path="revocations" element={<RevocationManagementPage />} />
            <Route path="verifications" element={<UniversityVerificationsPage />} />
            <Route path="profile" element={<UniversityProfilePage />} />
            <Route path="settings" element={<UniversitySettingsPage />} />
          </Route>

          {/* Student Portal */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="credentials" element={<MyCredentialsPage />} />
            <Route path="credentials/:id" element={<StudentCredentialDetailPage />} />
            <Route path="share" element={<ShareCredentialPage />} />
            <Route path="share/:id" element={<ShareCredentialPage />} />
            <Route path="history" element={<StudentVerificationHistoryPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="settings" element={<StudentSettingsPage />} />
          </Route>

          {/* Recruiter Portal */}
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="verify" element={<VerifyDegreePage />} />
            <Route path="result/:id" element={<VerificationResultPage />} />
            <Route path="history" element={<RecruiterHistoryPage />} />
            <Route path="profile" element={<RecruiterProfilePage />} />
            <Route path="settings" element={<RecruiterSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  </ToastProvider>
  );
}

export default App;

