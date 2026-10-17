import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { adminService, type OverviewResponse } from '../../services/adminService';
import { authService } from '../../services/authService';
import {
  ShieldCheck, Mail, Phone, Building2, Calendar,
  Award, CheckCircle2, AlertCircle, Edit3, Save, X, Sparkles,
  Users, BookOpen, Layers, Lock, Cpu, Globe
} from 'lucide-react';

const ADMIN_PROFILE_STORAGE_KEY = 'acadexa_admin_profile';

interface AdminProfileData {
  name: string;
  email: string;
  phone: string;
  officeLocation: string;
  department: string;
  employeeId: string;
  bio: string;
}

const defaultAdminData: AdminProfileData = {
  name: 'System Administrator',
  email: 'admin@college.edu',
  phone: '+91 80 2345 6789',
  officeLocation: 'Administrative Tower, Suite 401',
  department: 'Central Academic Governance',
  employeeId: 'ADM-INST-001',
  bio: 'Institutional System Administrator with full oversight across curriculum structuring, department management, faculty teaching assignments, cohort admissions, and academic intelligence.',
};

export const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfileData>(() => {
    const stored = localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultAdminData, ...JSON.parse(stored) };
      } catch {
        return defaultAdminData;
      }
    }
    return {
      ...defaultAdminData,
      name: user?.name || defaultAdminData.name,
      email: user?.email || defaultAdminData.email,
    };
  });

  const [stats, setStats] = useState<OverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<AdminProfileData>(profile);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getOverview();
        setStats(res);
      } catch {
        // Fallback silently if overview fails
      }
    };
    fetchStats();
  }, []);

  const handleEditClick = () => {
    setFormData(profile);
    setIsEditing(true);
    setFeedback(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFeedback(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Administrator name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    try {
      const updated = {
        ...formData,
        email: profile.email, // email is immutable
      };
      setProfile(updated);
      localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify(updated));

      // Also update auth user in localStorage so topbar reflects the name
      if (user) {
        const updatedAuth = { ...user, name: updated.name };
        authService.setCurrentUser(updatedAuth);
      }

      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Administrator profile details updated successfully!' });
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save administrator profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Administrator Profile"
        subtitle="System governance credentials, institutional scope, and administrator identity"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Profile' }]}
        action={
          !isEditing && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleEditClick}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          )
        }
      />

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Hero Banner Card */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/25 border-2 border-indigo-400/30">
              {profile.name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'SA'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-slate-900">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{profile.name}</h1>
              <Badge color="purple" className="bg-indigo-600/80 text-white border border-indigo-400/30 text-xs px-2.5 py-0.5 uppercase tracking-wide">
                System Administrator
              </Badge>
              <Badge color="green" className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5">
                Root Access
              </Badge>
            </div>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {profile.bio}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{profile.department}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>ID: {profile.employeeId}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Details & Governance Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Info or Edit Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <Card className="p-6">
              <CardHeader
                title="Edit Administrator Credentials"
                subtitle="Update your administrator contact details and profile narrative"
              />
              <form onSubmit={handleSave} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Administrator full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">
                      Email (System Root)
                    </label>
                    <Input
                      value={formData.email}
                      disabled
                      className="bg-slate-50 cursor-not-allowed opacity-75"
                    />
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">Institutional root email cannot be altered.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 80 2345 6789"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">
                      Department
                    </label>
                    <Input
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Central Academic Governance"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">
                      Office Location
                    </label>
                    <Input
                      value={formData.officeLocation}
                      onChange={e => setFormData({ ...formData, officeLocation: e.target.value })}
                      placeholder="e.g. Administrative Tower, Suite 401"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">
                    Bio & Responsibilities
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full text-sm border border-[var(--color-border)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-white resize-none"
                    placeholder="Describe administrative responsibilities and institutional governance scope..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                    <Save className="w-4 h-4 mr-1.5" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="p-6">
              <CardHeader
                title="Institutional Credentials"
                subtitle="Primary administrative contact and academic office details"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Full Name</span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profile.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Email Address</span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profile.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Phone / Extension</span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profile.phone}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Department</span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profile.department}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Office Location</span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profile.officeLocation}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Employee / Access ID</span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{profile.employeeId}</p>
                </div>
              </div>
            </Card>
          )}

          {/* System Governance Privileges Card */}
          <Card className="p-6">
            <CardHeader
              title="System Privileges & Governance Matrix"
              subtitle="Scope of administrative controls active on this profile"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">User Lifecycle Management</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Enroll students, provision faculty profiles, and assign academic cohorts.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Curriculum & Course Governance</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Manage subjects, syllabus topics, and assign teaching staff to sections.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Academic Intelligence</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Inspect live student cohort performance, quiz attempts, and pass rates.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Institutional Broadcasts</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Dispatch global announcements and critical academic alerts across departments.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Institutional Scope (1 Col) */}
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader
              title="Active Scope"
              subtitle="Current entities under your administration"
            />
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">Enrolled Students</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">Active profiles</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[var(--color-text-primary)]">
                  {stats?.summary?.totalStudents ?? 1}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">Faculty Staff</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">Teaching members</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[var(--color-text-primary)]">
                  {stats?.summary?.totalFaculty ?? 1}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">Curriculum Courses</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">Subjects created</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[var(--color-text-primary)]">
                  {stats?.summary?.totalCourses ?? 1}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">Active Sections</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">Cohort groups</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[var(--color-text-primary)]">
                  {stats?.summary?.totalSections ?? 1}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-indigo-950 uppercase tracking-wider">Security & Authentication</h4>
                <p className="text-xs text-indigo-800/80 leading-relaxed">
                  Session secured with JSON Web Token (JWT) and role-level guards. Institutional changes are synchronized immediately across all portals.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
