import React, { useState } from 'react';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import { Search, Users, GraduationCap, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UniversityStudentsPage: React.FC = () => {
  const { students } = useCredentialStore();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollmentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || s.department.toLowerCase().includes(deptFilter.toLowerCase());

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Enrolled & Graduated Students
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Registered student population with active or pending degree records.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-charcoal-border p-4 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, email, or enrollment ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-charcoal-border bg-white text-charcoal focus:border-forest outline-none"
        >
          <option value="ALL">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Management">Management</option>
          <option value="Electrical">Electrical</option>
          <option value="Mechanical">Mechanical</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-charcoal-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-light/70 text-charcoal font-semibold border-b border-charcoal-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Enrollment ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Degrees Conferred</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Credentials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-muted">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-charcoal-light/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-charcoal">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-charcoal-muted font-mono">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-charcoal font-semibold">
                      {s.enrollmentId}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal">
                      {s.department}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-muted truncate max-w-[180px]">
                      {s.universityName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-forest">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {s.degreesCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={s.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {s.credentials[0] ? (
                        <Link
                          to={`/university/credentials/${s.credentials[0]}`}
                          className="inline-flex items-center gap-1 text-xs text-forest hover:underline font-mono"
                        >
                          <span>{s.credentials[0]}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-charcoal-muted text-[10px]">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

