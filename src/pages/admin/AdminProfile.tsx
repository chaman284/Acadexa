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
  Users, BookOpen, Layers, Lock, Cpu, Globe, User, MapPin
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
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Administrator Profile"
        subtitle="System governance credentials, institutional scope, and administrator identity"
        breadcrumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Profile' }]}
        action={
          !isEditing ? (
            <Button
              onClick={handleEditClick}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                leftIcon={<X className="w-4 h-4" />}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          )
        }
      />

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Profile Summary Card */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <Avatar
              name={profile.name}
              size="lg"
              className="w-24 h-24 ring-4 ring-brass/30 shadow-card text-2xl"
            />
            <div className="absolute -bottom-1 -right-1 bg-oxblood text-white p-1.5 rounded-full ring-2 ring-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">
                {profile.name}
              </h2>
              <Badge color="oxblood" className="text-xs font-semibold px-2.5 py-0.5">
                System Administrator
              </Badge>
              <Badge color="forest" className="text-xs font-semibold px-2.5 py-0.5">
                Root Access
              </Badge>
              <Badge color="gray" className="text-xs font-semibold px-2.5 py-0.5">
                {profile.employeeId}
              </Badge>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] font-medium flex items-center justify-center md:justify-start gap-2">
              <Building2 className="w-4 h-4 text-[var(--color-text-muted)]" />
              {profile.department}
            </p>

            <p className="text-xs text-[var(--color-text-muted)] max-w-2xl leading-relaxed mt-2">
              {profile.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>{profile.officeLocation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
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
          <Card>
            <CardHeader
              title="Administrator Credentials"
              subtitle={
                isEditing
                  ? 'Update administrator credentials and profile narrative'
                  : 'Primary administrative contact and academic office details'
              }
            />

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                    Full Name *
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
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Email (System Root)
                    </label>
                    <Input
                      value={formData.email}
                      disabled
                      className="opacity-75 cursor-not-allowed bg-[var(--color-background)]"
                    />
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      Institutional root email cannot be altered.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
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
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Department
                    </label>
                    <Input
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Central Academic Governance"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
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
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                    Bio &amp; Responsibilities
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
                    placeholder="Describe administrative responsibilities and institutional governance scope..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{profile.name}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                    <Mail className="w-3.5 h-3.5" /> Institutional Email
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{profile.email}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                    <Phone className="w-3.5 h-3.5" /> Phone / Extension
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{profile.phone}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                    <Building2 className="w-3.5 h-3.5" /> Department
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{profile.department}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Office Location
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{profile.officeLocation}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                    <Lock className="w-3.5 h-3.5" /> Employee / Access ID
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{profile.employeeId}</div>
                </div>
              </div>
            )}
          </Card>

          {/* System Governance Privileges Card */}
          <Card>
            <CardHeader
              title="System Privileges & Governance Matrix"
              subtitle="Scope of administrative controls active on this profile"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-start gap-3 hover:border-[var(--color-accent)]/30 transition-all">
                <div className="w-9 h-9 rounded-lg bg-oxblood/10 text-oxblood flex items-center justify-center font-bold flex-shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-primary)]">User Lifecycle Management</h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Enroll students, provision faculty profiles, and assign academic cohorts.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-start gap-3 hover:border-[var(--color-accent)]/30 transition-all">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-[var(--color-accent)] flex items-center justify-center font-bold flex-shrink-0">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Curriculum & Course Governance</h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Manage subjects, syllabus topics, and assign teaching staff to sections.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-start gap-3 hover:border-[var(--color-accent)]/30 transition-all">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Cpu className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Academic Intelligence</h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Inspect live student cohort performance, quiz attempts, and pass rates.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-start gap-3 hover:border-[var(--color-accent)]/30 transition-all">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Globe className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Institutional Broadcasts</h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Dispatch global announcements and critical academic alerts across departments.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Institutional Scope (1 Col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Active Institutional Scope"
              subtitle="Current entities under your administration"
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-oxblood flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">Enrolled Students</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">Active profiles</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-serif text-[var(--color-text-primary)]">
                  {stats?.summary?.totalStudents ?? 1}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-forest flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">Faculty Staff</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">Teaching members</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-serif text-[var(--color-text-primary)]">
                  {stats?.summary?.totalFaculty ?? 1}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[var(--color-accent)] flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">Curriculum Courses</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">Subjects created</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-serif text-[var(--color-text-primary)]">
                  {stats?.summary?.totalCourses ?? 1}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">Active Sections</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">Cohort groups</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-serif text-[var(--color-text-primary)]">
                  {stats?.summary?.totalSections ?? 1}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Security & Authentication" />
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Access Role
                </span>
                <Badge color="oxblood" className="text-[11px]">Root Administrator</Badge>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Token Security
                </span>
                <span className="font-semibold text-emerald-600">JWT Verified</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Engine Status
                </span>
                <span className="font-semibold text-[var(--color-text-primary)]">Live Active</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
