import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  adminService,
  type FacultyRecord,
  type CourseRecord,
  type SectionRecord,
  type DepartmentRecord,
} from '../../services/adminService';
import {
  Users, Search, Plus, Trash2, BookOpen,
  CheckCircle2, AlertCircle, Eye, RefreshCw
} from 'lucide-react';

export const FacultyManagement: React.FC = () => {
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFacultyForProfile, setSelectedFacultyForProfile] = useState<FacultyRecord | null>(null);

  // Remove Faculty Modal state
  const [isRemoveFacultyModalOpen, setIsRemoveFacultyModalOpen] = useState(false);
  const [selectedRemoveFacultyId, setSelectedRemoveFacultyId] = useState('');

  // Assignment form state
  const [assignFacultyId, setAssignFacultyId] = useState('');
  const [assignSubjectId, setAssignSubjectId] = useState('');
  const [assignSectionId, setAssignSectionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const [facRes, courseRes, secRes, deptRes] = await Promise.all([
        adminService.getFaculty({
          search: search || undefined,
          departmentId: selectedDept || undefined,
          subjectId: selectedSubjectId || undefined,
          sectionId: selectedSectionId || undefined,
        }),
        adminService.getCourses(),
        adminService.getSections(),
        adminService.getDepartments(),
      ]);
      setFacultyList(facRes);
      setCourses(courseRes);
      setSections(secRes);
      setDepartments(deptRes);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load faculty records.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedSubjectId, selectedSectionId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAssignModal = (facultyId?: string) => {
    setAssignFacultyId(facultyId || (facultyList.length > 0 ? facultyList[0].id : ''));
    setAssignSubjectId(courses.length > 0 ? courses[0].id : '');
    setAssignSectionId(sections.length > 0 ? sections[0].id : '');
    setIsAssignModalOpen(true);
    setActionMessage(null);
  };

  const handleOpenRemoveFacultyModal = (facultyId?: string) => {
    setActionMessage(null);
    if (facultyId) {
      setSelectedRemoveFacultyId(facultyId);
    } else if (facultyList.length > 0) {
      setSelectedRemoveFacultyId(facultyList[0].id);
    } else {
      setSelectedRemoveFacultyId('');
    }
    setIsRemoveFacultyModalOpen(true);
  };

  const handleRemoveFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRemoveFacultyId) return;

    const facultyToDelete = facultyList.find(f => f.id === selectedRemoveFacultyId);
    const facultyLabel = facultyToDelete ? `${facultyToDelete.name} (${facultyToDelete.email})` : 'Faculty member';

    setIsSubmitting(true);
    try {
      await adminService.deleteFaculty(selectedRemoveFacultyId);
      setIsRemoveFacultyModalOpen(false);
      setSelectedRemoveFacultyId('');
      setActionMessage({
        type: 'success',
        text: `${facultyLabel} was successfully removed.`,
      });
      loadData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to remove faculty member.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignFacultyId || !assignSubjectId || !assignSectionId) {
      setActionMessage({ type: 'error', text: 'All fields are required for assignment.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.assignFaculty({
        facultyId: assignFacultyId,
        subjectId: assignSubjectId,
        sectionId: assignSectionId,
      });
      setIsAssignModalOpen(false);
      setActionMessage({ type: 'success', text: 'Faculty assigned successfully! In-app notification sent.' });
      loadData();
      if (selectedFacultyForProfile) {
        // Refresh details modal
        const refreshed = await adminService.getFacultyDetails(selectedFacultyForProfile.id);
        setSelectedFacultyForProfile(refreshed);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to assign faculty.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!window.confirm('Remove this assignment? Faculty account and student records will remain preserved.')) return;
    try {
      await adminService.removeAssignment(assignmentId);
      setActionMessage({ type: 'success', text: 'Assignment removed without deleting accounts.' });
      loadData();
      if (selectedFacultyForProfile) {
        const refreshed = await adminService.getFacultyDetails(selectedFacultyForProfile.id);
        setSelectedFacultyForProfile(refreshed);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to remove assignment.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Faculty Management"
        subtitle="Manage teaching faculty, review assigned courses and section allocations"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Faculty' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenRemoveFacultyModal()}
              variant="outline"
              size="sm"
              className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              disabled={facultyList.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Remove Faculty
            </Button>
            <Button onClick={() => handleOpenAssignModal()} size="sm" className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Assign Faculty
            </Button>
          </div>
        }
      />

      {/* Notifications / Feedback */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filters Bar */}
      <Card className="p-4 border border-[var(--color-border)]">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <Input
              id="faculty-search"
              placeholder="Search faculty by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="text-xs font-medium bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="text-xs font-medium bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSectionId}
            onChange={e => setSelectedSectionId(e.target.value)}
            className="text-xs font-medium bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="">All Sections</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>
                Sem {s.semester} - Sec {s.name}
              </option>
            ))}
          </select>

          <Button type="submit" variant="secondary" size="sm">
            Filter
          </Button>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedDept('');
              setSelectedSubjectId('');
              setSelectedSectionId('');
              loadData();
            }}
            className="p-2 text-slate-500 hover:text-slate-800 border border-[var(--color-border)] rounded-xl hover:bg-slate-50 transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </Card>

      {/* Faculty List Table / Cards */}
      <Card className="border border-[var(--color-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--color-text-muted)]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm">Loading faculty directory...</p>
          </div>
        ) : facultyList.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-[var(--color-text-primary)]">No faculty members found</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Try broadening your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Assigned Courses</th>
                  <th className="py-3 px-4">Sections Taught</th>
                  <th className="py-3 px-4 text-center">Courses</th>
                  <th className="py-3 px-4 text-center">Sections</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {facultyList.map(faculty => (
                  <tr key={faculty.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-[var(--color-text-primary)] leading-none">{faculty.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">{faculty.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {faculty.assignments.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">None assigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {Array.from(new Set(faculty.assignments.map(a => a.subjectCode))).map(code => (
                            <Badge key={code} color="indigo" className="text-[11px]">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {faculty.assignments.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {Array.from(new Set(faculty.assignments.map(a => `Sem ${a.semester}-${a.sectionName}`))).map(sec => (
                            <Badge key={sec} color="gray" className="text-[11px]">
                              {sec}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {faculty.coursesCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {faculty.sectionsCount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedFacultyForProfile(faculty)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                          title="View Assignments & Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Profile
                        </button>
                        <button
                          onClick={() => handleOpenAssignModal(faculty.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          title="Assign to Section"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Assign
                        </button>
                        <button
                          onClick={() => handleOpenRemoveFacultyModal(faculty.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1"
                          title="Remove Faculty Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Assign Faculty Modal ── */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Faculty to Course & Section"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Select Faculty
            </label>
            <select
              value={assignFacultyId}
              onChange={e => setAssignFacultyId(e.target.value)}
              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
              required
            >
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Course / Subject
            </label>
            <select
              value={assignSubjectId}
              onChange={e => setAssignSubjectId(e.target.value)}
              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
              required
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} ({c.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Target Section / Class
            </label>
            <select
              value={assignSectionId}
              onChange={e => setAssignSectionId(e.target.value)}
              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
              required
            >
              {sections.map(s => (
                <option key={s.id} value={s.id}>
                  Semester {s.semester} — Section {s.name} ({s.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Faculty Assignments Profile Modal ── */}
      <Modal
        isOpen={!!selectedFacultyForProfile}
        onClose={() => setSelectedFacultyForProfile(null)}
        title={selectedFacultyForProfile ? `${selectedFacultyForProfile.name} — Teaching Allocations` : 'Faculty Profile'}
        size="lg"
      >
        {selectedFacultyForProfile && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[var(--color-text-primary)]">{selectedFacultyForProfile.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{selectedFacultyForProfile.email}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenAssignModal(selectedFacultyForProfile.id)}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Assignment
              </Button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Active Assignments ({selectedFacultyForProfile.assignments.length})
              </h4>

              {selectedFacultyForProfile.assignments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No courses or sections currently assigned to this faculty member.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedFacultyForProfile.assignments.map(a => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl border border-[var(--color-border)] bg-white flex items-center justify-between hover:border-indigo-200 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[var(--color-text-primary)]">
                            {a.subjectCode} — {a.subjectName}
                          </span>
                          <Badge color="indigo" className="text-[10px]">
                            Sem {a.semester} · {a.sectionName}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          Department: {a.department}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveAssignment(a.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--color-border)] flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedFacultyForProfile(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Remove Faculty Modal ── */}
      <Modal
        isOpen={isRemoveFacultyModalOpen}
        onClose={() => setIsRemoveFacultyModalOpen(false)}
        title="Remove Registered Faculty Member"
      >
        <form onSubmit={handleRemoveFacultySubmit} className="space-y-4">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Choose from the registered faculty members below to remove their account and revoke all their course allocations.
          </p>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Registered Faculty Member
            </label>
            {facultyList.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                No faculty members are currently registered to remove.
              </p>
            ) : (
              <select
                id="remove-faculty-select"
                value={selectedRemoveFacultyId}
                onChange={e => setSelectedRemoveFacultyId(e.target.value)}
                className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-rose-500 font-medium"
                required
              >
                <option value="">-- Select a registered faculty member --</option>
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Details preview of the selected faculty */}
          {(() => {
            const facultyDetails = facultyList.find(f => f.id === selectedRemoveFacultyId);
            if (!facultyDetails) return null;

            return (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Selected Faculty:</span>
                  <Badge color="purple" className="text-[11px]">
                    Faculty Member
                  </Badge>
                </div>
                <div className="text-sm font-bold text-slate-800">{facultyDetails.name}</div>
                <div className="text-xs text-slate-500">{facultyDetails.email}</div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Courses Assigned</span>
                    <span className="font-medium text-slate-700">{facultyDetails.coursesCount} courses</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sections Assigned</span>
                    <span className="font-medium text-slate-700">{facultyDetails.sectionsCount} sections</span>
                  </div>
                </div>

                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    Warning: Removing this faculty member will delete their user account and detach all their assigned subjects and sections.
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="pt-2 flex justify-end gap-2 border-t border-[var(--color-border)] mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRemoveFacultyModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isSubmitting}
              disabled={!selectedRemoveFacultyId || facultyList.length === 0}
              className="gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Remove Faculty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
