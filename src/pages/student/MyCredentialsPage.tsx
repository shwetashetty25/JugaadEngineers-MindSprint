import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { Badge } from '../../components/common/Badge';
import { GraduationCap, Search, QrCode, ArrowRight, Download } from 'lucide-react';

export const MyCredentialsPage: React.FC = () => {
  const { credentials } = useCredentialStore();
  const studentEmail = 'aarav.sharma@alumni.iitd.ac.in';
  const myCredentials = credentials.filter(
    (c) => c.studentEmail.toLowerCase() === studentEmail.toLowerCase()
  );

  const [search, setSearch] = useState('');

  const filtered = myCredentials.filter((c) =>
    c.degreeName.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.universityName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-charcoal-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            My Conferred Credentials
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Browse all verified degree certificates conferred upon your identity.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-border p-4 shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your credentials by degree title, ID, or university..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-charcoal-border focus:border-forest outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((cred) => (
          <div
            key={cred.id}
            className="bg-white rounded-2xl border border-charcoal-border p-6 shadow-card hover:border-forest/40 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-forest">
                  {cred.id}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge status={cred.status} size="sm" />
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                    DEMO
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal">
                  {cred.degreeName}
                </h3>
                <p className="text-xs text-charcoal-muted font-medium mt-0.5">
                  {cred.universityName}
                </p>
              </div>

              <div className="p-3 bg-background rounded-xl border border-charcoal-border/70 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Conferred Class:</span>
                  <strong className="text-forest">Class of {cred.graduationYear}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Grade / Honors:</span>
                  <span className="text-charcoal font-medium">{cred.cgpaOrGrade}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-charcoal-border/60">
              <Link
                to={`/student/share/${cred.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal bg-charcoal-light hover:bg-charcoal-border/70 rounded-lg transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-forest" />
                <span>Share QR</span>
              </Link>

              <Link
                to={`/student/credentials/${cred.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-forest hover:bg-forest-hover rounded-lg shadow-subtle transition-all"
              >
                <span>View Full Certificate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

