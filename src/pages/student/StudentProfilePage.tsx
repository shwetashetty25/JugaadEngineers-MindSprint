import React, { useState } from 'react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { useToast } from '../../context/ToastContext';
import { User, Mail, GraduationCap, Building, Award, Save, CheckCircle2 } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { students, updateStudent } = useCredentialStore();
  const currentStudent = students[0]; // Aarav Sharma
  const { success } = useToast();

  const [name, setName] = useState(currentStudent?.name || 'Aarav Sharma');
  const [enrollmentId, setEnrollmentId] = useState(currentStudent?.enrollmentId || '2020CS10492');
  const [email, setEmail] = useState(currentStudent?.email || 'aarav.sharma@alumni.iitd.ac.in');
  const [university, setUniversity] = useState(currentStudent?.universityName || 'Indian Institute of Technology Delhi');
  const [department, setDepartment] = useState(currentStudent?.department || 'Computer Science and Engineering');
  const [graduationYear, setGraduationYear] = useState(2024);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStudent) {
      updateStudent(currentStudent.id, {
        name,
        enrollmentId,
        email,
        department,
        universityName: university
      });
    }
    success('Profile Saved', 'Your student wallet profile has been updated.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Student Wallet Profile
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Manage your personal identity credentials and academic association metadata.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Verified Student Identity</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-charcoal-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-charcoal-border">
          <div className="w-16 h-16 rounded-full bg-forest text-white font-serif font-bold flex items-center justify-center text-2xl shadow-card shrink-0">
            AS
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-charcoal">{name}</h2>
            <p className="text-xs text-charcoal-muted font-mono mt-0.5">
              Roll Ref: {enrollmentId} • {university}
            </p>
            <p className="text-xs text-forest font-semibold mt-1">
              Class of {graduationYear} • {department}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Student Enrollment / Roll Number
            </label>
            <input
              type="text"
              required
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Institutional / Personal Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              University / Institute Name
            </label>
            <input
              type="text"
              required
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Academic Department
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Graduation Year
            </label>
            <input
              type="number"
              required
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-card transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

