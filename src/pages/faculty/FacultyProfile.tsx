import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { facultyService } from '../../services/facultyService';
import type { FacultyProfile as FacultyProfileType } from '../../types/faculty';
import {
  User, Mail, Phone, BookOpen, Building2,
  Calendar, Award, CheckCircle2, AlertCircle, Edit3, Save, X, Sparkles,
  MapPin, Clock, Briefcase, GraduationCap
} from 'lucide-react';

export const FacultyProfile: React.FC = () => {
  const [profile, setProfile] = useState<FacultyProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form edit states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    officeLocation: '',
    cabinNumber: '',
    officeHours: '',
    qualifications: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await facultyService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        bio: data.bio || '',
        officeLocation: data.officeLocation || '',
        cabinNumber: data.cabinNumber || '',
        officeHours: data.officeHours || '',
        qualifications: data.qualifications || '',
        avatarUrl: data.avatarUrl || '',
      });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load faculty profile details.' });
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
      const updated = await facultyService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        officeLocation: formData.officeLocation.trim(),
        cabinNumber: formData.cabinNumber.trim(),
        officeHours: formData.officeHours.trim(),
        qualifications: formData.qualifications.trim(),
        avatarUrl: formData.avatarUrl.trim() || undefined,
      });
      setProfile(updated);
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Faculty profile updated successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving profile. Please try again.' });
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
        officeLocation: profile.officeLocation || '',
        cabinNumber: profile.cabinNumber || '',
        officeHours: profile.officeHours || '',
        qualifications: profile.qualifications || '',
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
        <p className="text-sm text-[var(--color-text-muted)]">Loading faculty profile details...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-[var(--color-text-muted)]">
        Faculty record unavailable. Please refresh or log in again.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Faculty Profile"
        subtitle="Manage your academic credentials, contact info, and department records"
        breadcrumbs={[{ label: 'Dashboard', to: '/faculty' }, { label: 'Profile' }]}
        action={
          !isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
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
              src={formData.avatarUrl || profile.avatarUrl}
              size="lg"
              className="w-24 h-24 ring-4 ring-indigo-50 shadow-md text-2xl"
            />
            {isEditing && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white font-medium">Avatar URL</span>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {profile.name}
              </h2>
              <Badge color="indigo" className="text-xs font-semibold px-2.5 py-0.5">
                {profile.designation}
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
              {profile.bio || 'No faculty biography provided yet.'}
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
                <span>{profile.officeLocation} · {profile.cabinNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Details / Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Editable or Display info (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Faculty Information"
              subtitle={isEditing ? 'Modify personal contact and cabin details below' : 'Your registered academic contact information'}
            />

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Full Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Ramesh Kumar"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Phone Number
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98451 23456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Office / Building Location
                    </label>
                    <Input
                      value={formData.officeLocation}
                      onChange={e => setFormData({ ...formData, officeLocation: e.target.value })}
                      placeholder="e.g. Academic Block 3, 2nd Floor"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Cabin / Room Number
                    </label>
                    <Input
                      value={formData.cabinNumber}
                      onChange={e => setFormData({ ...formData, cabinNumber: e.target.value })}
                      placeholder="e.g. Room 208-B"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Office Hours / Student Consultation
                    </label>
                    <Input
                      value={formData.officeHours}
                      onChange={e => setFormData({ ...formData, officeHours: e.target.value })}
                      placeholder="e.g. Mon, Wed, Fri: 2:00 PM – 4:00 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Avatar Image URL
                    </label>
                    <Input
                      value={formData.avatarUrl}
                      onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                    Academic Qualifications & Degrees
                  </label>
                  <Input
                    value={formData.qualifications}
                    onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                    placeholder="e.g. Ph.D. in Computer Science (IIT Bombay), M.Tech"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                    Academic Biography & Research Focus
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Write a brief description of your academic background and areas of research..."
                    className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors"
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
                    <Phone className="w-3.5 h-3.5" /> Contact Number
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{profile.phone}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Office Location & Cabin
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">
                    {profile.officeLocation} · {profile.cabinNumber}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] md:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                    <Clock className="w-3.5 h-3.5" /> Student Consultation Hours
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{profile.officeHours}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] md:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                    <GraduationCap className="w-3.5 h-3.5" /> Academic Qualifications
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{profile.qualifications}</div>
                </div>
              </div>
            )}
          </Card>

          {/* Subjects Taught Card */}
          <Card>
            <CardHeader
              title="Courses & Subjects Taught"
              subtitle="Current academic semester teaching responsibilities"
            />
            <div className="space-y-3">
              {(profile.subjectsTaught || []).map((subject, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-accent)]/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[var(--color-accent)] flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{subject}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Theory & Laboratory Curriculum</p>
                    </div>
                  </div>
                  <Badge color="indigo" className="text-xs">Active</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Institutional & Status Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Department Credentials" />
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Employee ID
                </span>
                <span className="font-semibold font-mono text-[var(--color-text-primary)]">{profile.employeeId}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Department
                </span>
                <span className="font-semibold text-[var(--color-text-primary)]">{profile.department}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Joining Year
                </span>
                <span className="font-semibold text-[var(--color-text-primary)]">{profile.joiningYear}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Faculty Role
                </span>
                <span className="font-semibold text-emerald-600">Active Faculty</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Assigned Batches & Classes" />
            <div className="space-y-2">
              {(profile.assignedClasses || []).map((cls, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">{cls}</span>
                  <Badge color="gray" className="text-[10px]">Batch 2024–25</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
