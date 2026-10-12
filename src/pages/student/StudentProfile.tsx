import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { studentService } from '../../services/studentService';
import type { Student } from '../../types/student';
import {
  User, Mail, Phone, BookOpen, GraduationCap, Building2,
  Calendar, Award, CheckCircle2, AlertCircle, Edit3, Save, X, Sparkles
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form edit states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
      });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load profile details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Full name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const updated = await studentService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        avatarUrl: formData.avatarUrl.trim() || undefined,
      });
      setProfile(updated);
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({ type: 'error', message: 'Error saving profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
    setIsEditing(false);
    setFeedback(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading profile details...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto mt-12">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)] mx-auto mb-2" />
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Profile Not Found</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Could not retrieve student details.</p>
        <Button className="mt-4" onClick={loadProfile}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Student Profile"
        subtitle="View and manage your academic identity and personal information"
        breadcrumbs={[{ label: 'Dashboard', to: '/student' }, { label: 'Profile' }]}
        action={
          !isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit3 className="w-4 h-4" />}
              size="sm"
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
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card className="overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar
            name={profile.name}
            src={profile.avatarUrl}
            size="xl"
            className="ring-4 ring-white/20 shadow-md"
          />
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <Badge color="indigo" className="bg-indigo-500/30 text-indigo-200 border-indigo-400/20">
                Roll No: {profile.rollNumber}
              </Badge>
            </div>
            <p className="text-xs text-white/70">
              {profile.department} · {profile.semester}th Semester ({profile.section || 'Sec A'})
            </p>
            <p className="text-xs text-white/60 max-w-xl">
              {profile.bio || 'Undergraduate student at Acadexa.'}
            </p>
          </div>
        </div>

        {/* Academic Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border)] bg-[var(--color-muted)]/30 border-t border-b border-[var(--color-border)]">
          <div className="p-4 text-center">
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Quiz Average</p>
            <p className="text-xl font-bold text-[var(--color-accent)] mt-0.5">{profile.quizAverage}%</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Learning Progress</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">+{profile.learningProgress}%</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Study Streak</p>
            <p className="text-xl font-bold text-amber-500 mt-0.5">{profile.streak} Days</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Courses Enrolled</p>
            <p className="text-xl font-bold text-[var(--color-text-primary)] mt-0.5">{profile.enrolledCourses?.length || 4}</p>
          </div>
        </div>

        {/* Detailed Form or Display */}
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[var(--color-accent)]" /> Edit Personal Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">
                  About Me / Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Share a short academic bio or your learning interests..."
                  className="w-full border border-[var(--color-border)] rounded-[10px] p-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">
                  Contact & Personal Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-muted)]">
                    <Mail className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--color-text-muted)]">Email Address</p>
                      <p className="font-medium text-[var(--color-text-primary)] truncate">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-muted)]">
                    <Phone className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--color-text-muted)]">Phone Number</p>
                      <p className="font-medium text-[var(--color-text-primary)] truncate">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">
                  Academic Affiliation
                </h3>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 rounded-xl border border-[var(--color-border)] bg-white">
                    <Building2 className="w-4 h-4 text-[var(--color-text-muted)] mb-1" />
                    <p className="text-xs text-[var(--color-text-muted)]">Department</p>
                    <p className="font-semibold text-[var(--color-text-primary)]">{profile.department}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--color-border)] bg-white">
                    <GraduationCap className="w-4 h-4 text-[var(--color-text-muted)] mb-1" />
                    <p className="text-xs text-[var(--color-text-muted)]">Semester</p>
                    <p className="font-semibold text-[var(--color-text-primary)]">{profile.semester}th Semester</p>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--color-border)] bg-white">
                    <Calendar className="w-4 h-4 text-[var(--color-text-muted)] mb-1" />
                    <p className="text-xs text-[var(--color-text-muted)]">Academic Year</p>
                    <p className="font-semibold text-[var(--color-text-primary)]">{profile.academicYear || '2024–2025'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
