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
          className={`p-4 rounded-[10px] border-2 border-[#171717] flex items-center gap-3 transition-all ${
            feedback.type === 'success'
              ? 'bg-[#E0FAF8] text-[#171717]'
              : 'bg-[#FFE8E8] text-[#171717]'
          }`}
          style={{ boxShadow: '3px 3px 0px #171717' }}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#0e6b64]" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#FF666B]" />
          )}
          <span className="text-sm font-bold">{feedback.message}</span>
        </div>
      )}

      {/* Hero Banner Card */}
      <div
        className="p-6 md:p-8 bg-[#FFFBE0] border-2 border-[#171717] text-[#171717] rounded-[16px] relative overflow-hidden"
        style={{ boxShadow: '6px 6px 0px #171717' }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="relative">
            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-[16px] bg-[#FF666B] flex items-center justify-center text-white text-3xl font-black border-2 border-[#171717]"
              style={{ boxShadow: '4px 4px 0px #171717' }}
            >
              {profile.name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'SA'}
            </div>
            <div
              className="absolute -bottom-2 -right-2 bg-[#42CFC1] text-[#171717] p-2 rounded-full border-2 border-[#171717]"
              style={{ boxShadow: '2px 2px 0px #171717' }}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#171717]">{profile.name}</h1>
              <Badge color="purple" className="text-xs px-2.5 py-0.5 uppercase tracking-wide">
                System Administrator
              </Badge>
              <Badge color="green" className="text-xs px-2.5 py-0.5">
                Root Access
              </Badge>
            </div>

            <p className="text-[#696969] font-medium text-sm max-w-2xl leading-relaxed">
              {profile.bio}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold text-[#171717]">
              <div
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[8px] border-2 border-[#171717]"
                style={{ boxShadow: '2px 2px 0px #171717' }}
              >
                <Mail className="w-4 h-4 text-[#FF666B]" />
                <span>{profile.email}</span>
              </div>
              <div
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[8px] border-2 border-[#171717]"
                style={{ boxShadow: '2px 2px 0px #171717' }}
              >
                <Building2 className="w-4 h-4 text-[#42CFC1]" />
                <span>{profile.department}</span>
              </div>
              <div
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[8px] border-2 border-[#171717]"
                style={{ boxShadow: '2px 2px 0px #171717' }}
              >
                <Lock className="w-4 h-4 text-[#A98BEF]" />
                <span>ID: {profile.employeeId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
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
                    <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
                      Email (System Root)
                    </label>
                    <Input
                      value={formData.email}
                      disabled
                      className="bg-slate-100 cursor-not-allowed opacity-75"
                    />
                    <p className="text-[11px] text-[#696969] font-medium mt-1">Institutional root email cannot be altered.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
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
                    <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
                      Department
                    </label>
                    <Input
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Central Academic Governance"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
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
                  <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
                    Bio & Responsibilities
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full text-sm font-semibold border-2 border-[#171717] rounded-[8px] p-3 text-[#171717] placeholder:text-[#9a9a9a] bg-white resize-none"
                    style={{ boxShadow: '2px 2px 0px #171717' }}
                    placeholder="Describe administrative responsibilities and institutional governance scope..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#e5d8c7]">
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
                <div className="p-3 bg-[#FFF5EA] rounded-[8px] border-2 border-[#171717]" style={{ boxShadow: '2px 2px 0px #171717' }}>
                  <span className="text-[11px] font-bold text-[#696969] uppercase tracking-wider">Full Name</span>
                  <p className="text-base font-black text-[#171717] mt-0.5">{profile.name}</p>
                </div>
                <div className="p-3 bg-[#FFF5EA] rounded-[8px] border-2 border-[#171717]" style={{ boxShadow: '2px 2px 0px #171717' }}>
                  <span className="text-[11px] font-bold text-[#696969] uppercase tracking-wider">Email Address</span>
                  <p className="text-base font-black text-[#171717] mt-0.5">{profile.email}</p>
                </div>
                <div className="p-3 bg-[#FFF5EA] rounded-[8px] border-2 border-[#171717]" style={{ boxShadow: '2px 2px 0px #171717' }}>
                  <span className="text-[11px] font-bold text-[#696969] uppercase tracking-wider">Phone / Extension</span>
                  <p className="text-base font-black text-[#171717] mt-0.5">{profile.phone}</p>
                </div>
                <div className="p-3 bg-[#FFF5EA] rounded-[8px] border-2 border-[#171717]" style={{ boxShadow: '2px 2px 0px #171717' }}>
                  <span className="text-[11px] font-bold text-[#696969] uppercase tracking-wider">Department</span>
                  <p className="text-base font-black text-[#171717] mt-0.5">{profile.department}</p>
                </div>
                <div className="p-3 bg-[#FFF5EA] rounded-[8px] border-2 border-[#171717]" style={{ boxShadow: '2px 2px 0px #171717' }}>
                  <span className="text-[11px] font-bold text-[#696969] uppercase tracking-wider">Office Location</span>
                  <p className="text-base font-black text-[#171717] mt-0.5">{profile.officeLocation}</p>
                </div>
                <div className="p-3 bg-[#FFF5EA] rounded-[8px] border-2 border-[#171717]" style={{ boxShadow: '2px 2px 0px #171717' }}>
                  <span className="text-[11px] font-bold text-[#696969] uppercase tracking-wider">Employee / Access ID</span>
                  <p className="text-base font-black text-[#171717] mt-0.5">{profile.employeeId}</p>
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
              <div
                className="p-4 rounded-[12px] border-2 border-[#171717] bg-[#FFF5EA] flex items-start gap-3"
                style={{ boxShadow: '3px 3px 0px #171717' }}
              >
                <div
                  className="p-2.5 rounded-[8px] bg-[#FFE66D] border-2 border-[#171717] text-[#171717]"
                  style={{ boxShadow: '1.5px 1.5px 0px #171717' }}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#171717] uppercase tracking-wider">User Lifecycle Management</h4>
                  <p className="text-xs text-[#696969] font-medium mt-1">Enroll students, provision faculty profiles, and assign academic cohorts.</p>
                </div>
              </div>

              <div
                className="p-4 rounded-[12px] border-2 border-[#171717] bg-[#FFF5EA] flex items-start gap-3"
                style={{ boxShadow: '3px 3px 0px #171717' }}
              >
                <div
                  className="p-2.5 rounded-[8px] bg-[#F0EAFF] border-2 border-[#171717] text-[#171717]"
                  style={{ boxShadow: '1.5px 1.5px 0px #171717' }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#171717] uppercase tracking-wider">Curriculum & Course Governance</h4>
                  <p className="text-xs text-[#696969] font-medium mt-1">Manage subjects, syllabus topics, and assign teaching staff to sections.</p>
                </div>
              </div>

              <div
                className="p-4 rounded-[12px] border-2 border-[#171717] bg-[#FFF5EA] flex items-start gap-3"
                style={{ boxShadow: '3px 3px 0px #171717' }}
              >
                <div
                  className="p-2.5 rounded-[8px] bg-[#E0FAF8] border-2 border-[#171717] text-[#171717]"
                  style={{ boxShadow: '1.5px 1.5px 0px #171717' }}
                >
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#171717] uppercase tracking-wider">Academic Intelligence</h4>
                  <p className="text-xs text-[#696969] font-medium mt-1">Inspect live student cohort performance, quiz attempts, and pass rates.</p>
                </div>
              </div>

              <div
                className="p-4 rounded-[12px] border-2 border-[#171717] bg-[#FFF5EA] flex items-start gap-3"
                style={{ boxShadow: '3px 3px 0px #171717' }}
              >
                <div
                  className="p-2.5 rounded-[8px] bg-[#FFE8E8] border-2 border-[#171717] text-[#171717]"
                  style={{ boxShadow: '1.5px 1.5px 0px #171717' }}
                >
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#171717] uppercase tracking-wider">Institutional Broadcasts</h4>
                  <p className="text-xs text-[#696969] font-medium mt-1">Dispatch global announcements and critical academic alerts across departments.</p>
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
              <div
                className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#FFF5EA] border-2 border-[#171717]"
                style={{ boxShadow: '2px 2px 0px #171717' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-[8px] bg-[#FFE8E8] border border-[#171717] text-[#FF666B]"
                    style={{ boxShadow: '1.5px 1.5px 0px #171717' }}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#171717]">Enrolled Students</p>
                    <p className="text-[11px] text-[#696969] font-medium">Active profiles</p>
                  </div>
                </div>
                <span className="text-xl font-black text-[#171717]">
                  {stats?.summary?.totalStudents ?? 1}
                </span>
              </div>

              <div
                className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#FFF5EA] border-2 border-[#171717]"
                style={{ boxShadow: '2px 2px 0px #171717' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-[8px] bg-[#E0FAF8] border border-[#171717] text-[#0e6b64]"
                    style={{ boxShadow: '1.5px 1.5px 0px #171717' }}
                  >
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#171717]">Faculty Staff</p>
                    <p className="text-[11px] text-[#696969] font-medium">Teaching members</p>
                  </div>
                </div>
                <span className="text-xl font-black text-[#171717]">
                  {stats?.summary?.totalFaculty ?? 1}
                </span>
              </div>

              <div
                className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#FFF5EA] border-2 border-[#171717]"
                style={{ boxShadow: '2px 2px 0px #171717' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-[8px] bg-[#F0EAFF] border border-[#171717] text-[#A98BEF]"
                    style={{ boxShadow: '1.5px 1.5px 0px #171717' }}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#171717]">Curriculum Courses</p>
                    <p className="text-[11px] text-[#696969] font-medium">Subjects created</p>
                  </div>
                </div>
                <span className="text-xl font-black text-[#171717]">
                  {stats?.summary?.totalCourses ?? 1}
                </span>
              </div>

              <div
                className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#FFF5EA] border-2 border-[#171717]"
                style={{ boxShadow: '2px 2px 0px #171717' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-[8px] bg-[#FFFBE0] border border-[#171717] text-[#171717]"
                    style={{ boxShadow: '1.5px 1.5px 0px #171717' }}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#171717]">Active Sections</p>
                    <p className="text-[11px] text-[#696969] font-medium">Cohort groups</p>
                  </div>
                </div>
                <span className="text-xl font-black text-[#171717]">
                  {stats?.summary?.totalSections ?? 1}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-[#F0EAFF]">
            <div className="flex items-start gap-3">
              <div
                className="p-2.5 bg-[#FFE66D] text-[#171717] rounded-[10px] border-2 border-[#171717]"
                style={{ boxShadow: '2px 2px 0px #171717' }}
              >
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#171717] uppercase tracking-wider">Security & Authentication</h4>
                <p className="text-xs text-[#171717] font-semibold leading-relaxed">
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
