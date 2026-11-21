import { useState, useEffect } from 'react';
import { credentialStore } from '../services/credentialStore';
import { UserRole } from '../types';

export function useCredentialStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = credentialStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    credentials: credentialStore.getCredentials(),
    universities: credentialStore.getUniversities(),
    students: credentialStore.getStudents(),
    verifications: credentialStore.getVerifications(),
    recruiterOrg: credentialStore.getRecruiterOrg(),
    currentRole: credentialStore.getCurrentRole(),
    currentUserEmail: credentialStore.getCurrentUserEmail(),
    uploadBatches: credentialStore.getUploadBatches(),
    duplicateGroups: credentialStore.getDuplicateGroups(),
    auditLogs: credentialStore.getAuditLogs(),
    intelligenceSummary: credentialStore.getIntelligenceSummary(),

    // Actions
    setRole: (role: UserRole) => credentialStore.setRole(role),
    setCurrentUserEmail: (email: string) => credentialStore.setCurrentUserEmail(email),
    getCredentialById: (id: string) => credentialStore.getCredentialById(id),
    getCredentialsByUniversity: (univId: string) => credentialStore.getCredentialsByUniversity(univId),
    getCredentialsByStudentEmail: (email: string) => credentialStore.getCredentialsByStudentEmail(email),
    getDuplicateGroupById: (id: string) => credentialStore.getDuplicateGroupById(id),
    analyzeBatchRecords: (filename: string, records: any[]) =>
      credentialStore.analyzeBatchRecords(filename, records),
    resolveDuplicateGroup: (groupId: string, action: any, notes: string) =>
      credentialStore.resolveDuplicateGroup(groupId, action, notes),
    issueCredential: (cred: Parameters<typeof credentialStore.issueCredential>[0]) =>
      credentialStore.issueCredential(cred),
    bulkIssueCredentials: (records: Parameters<typeof credentialStore.bulkIssueCredentials>[0]) =>
      credentialStore.bulkIssueCredentials(records),
    revokeCredential: (id: string, reason: string, notes?: string) =>
      credentialStore.revokeCredential(id, reason, notes),
    verifyCredential: (
      id: string,
      verifierInfo: Parameters<typeof credentialStore.verifyCredential>[1]
    ) => credentialStore.verifyCredential(id, verifierInfo),
    getVerificationsForCredential: (id: string) =>
      credentialStore.getVerificationsForCredential(id),
    getVerificationsForStudent: (name: string) =>
      credentialStore.getVerificationsForStudent(name),
    getUniversityById: (id: string) => credentialStore.getUniversityById(id),
    updateUniversity: (id: string, updates: Parameters<typeof credentialStore.updateUniversity>[1]) =>
      credentialStore.updateUniversity(id, updates),
    updateStudent: (id: string, updates: Parameters<typeof credentialStore.updateStudent>[1]) =>
      credentialStore.updateStudent(id, updates),
    updateRecruiterOrg: (updates: Parameters<typeof credentialStore.updateRecruiterOrg>[0]) =>
      credentialStore.updateRecruiterOrg(updates),
    resetToDefault: () => credentialStore.resetToDefault()
  };
}

