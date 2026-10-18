import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  adminService,
  type CourseRecord,
  type FacultyRecord,
  type SectionRecord,
  type DepartmentRecord,
} from '../../services/adminService';
import {
  BookOpen, Search, Plus, Edit, Trash2,
  CheckCircle2, AlertCircle, RefreshCw, UserPlus
} from 'lucide-react';

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>([]);
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Course Add/Edit Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [courseFormName, setCourseFormName] = useState('');
  const [courseFormCode, setCourseFormCode] = useState('');
  const [courseFormDeptId, setCourseFormDeptId] = useState('');
  const [courseFormSemester, setCourseFormSemester] = useState<number>(1);

  // Quick Assign Faculty Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetCourse, setTargetCourse] = useState<CourseRecord | null>(null);
  const [assignFacultyId, setAssignFacultyId] = useState('');
  const [assignSectionId, setAssignSectionId] = useState('');

  // Remove Course Modal
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedRemoveCourseId, setSelectedRemoveCourseId] = useState('');
  const [removeFilterSemester, setRemoveFilterSemester] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const [coursesRes, facRes, secRes, deptRes] = await Promise.all([
        adminService.getCourses({
          search: search || undefined,
          departmentId: selectedDept || undefined,
          semester: selectedSemester || undefined,
        }),
        adminService.getFaculty(),
        adminService.getSections(),
        adminService.getDepartments(),
      ]);
      setCourses(coursesRes);
      setFacultyList(facRes);
      setSections(secRes);
      setDepartments(deptRes);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load courses.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedSemester]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setCourseFormName('');
    setCourseFormCode('');
    setCourseFormDeptId(departments.length > 0 ? departments[0].id : '');
    setCourseFormSemester(1);
    setIsCourseModalOpen(true);
    setActionMessage(null);
  };

  // Open Edit Modal
  const handleOpenEditModal = (c: CourseRecord) => {
    setEditingCourse(c);
    setCourseFormName(c.name);
    setCourseFormCode(c.code);
    setCourseFormDeptId(c.departmentId);
    setCourseFormSemester(c.semester || 1);
    setIsCourseModalOpen(true);
    setActionMessage(null);
  };

  // Open Remove Course Modal
  const handleOpenRemoveModal = (preselectedCourseId?: string) => {
    setActionMessage(null);
    if (preselectedCourseId) {
      const targetCourse = courses.find(c => c.id === preselectedCourseId);
      setRemoveFilterSemester(targetCourse ? String(targetCourse.semester || 1) : '');
      setSelectedRemoveCourseId(preselectedCourseId);
    } else {
      setRemoveFilterSemester('');
      if (courses.length > 0) {
        setSelectedRemoveCourseId(courses[0].id);
      } else {
        setSelectedRemoveCourseId('');
      }
    }
    setIsRemoveModalOpen(true);
  };

  // Save Course (Create or Update)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormName.trim() || !courseFormCode.trim() || !courseFormDeptId) {
      setActionMessage({ type: 'error', text: 'Course name, unique code, department, and semester are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse.id, {
          name: courseFormName.trim(),
          code: courseFormCode.trim(),
          departmentId: courseFormDeptId,
          semester: Number(courseFormSemester),
        });
        setActionMessage({ type: 'success', text: 'Course updated successfully.' });
      } else {
        await adminService.createCourse({
          name: courseFormName.trim(),
          code: courseFormCode.trim(),
          departmentId: courseFormDeptId,
          semester: Number(courseFormSemester),
        });
        setActionMessage({ type: 'success', text: `New course created for Semester ${courseFormSemester}.` });
      }
      setIsCourseModalOpen(false);
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Operation failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Remove Course Submit
  const handleRemoveCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRemoveCourseId) return;

    const courseToDelete = courses.find(c => c.id === selectedRemoveCourseId);
    const courseLabel = courseToDelete ? `${courseToDelete.code} (${courseToDelete.name})` : 'Selected course';

    setIsSubmitting(true);
    try {
      await adminService.deleteCourse(selectedRemoveCourseId);
      setIsRemoveModalOpen(false);
      setSelectedRemoveCourseId('');
      setActionMessage({
        type: 'success',
        text: `Course ${courseLabel} was successfully removed from curriculum.`,
      });
      loadData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to remove course.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Quick Assign Modal for a course
  const handleOpenAssignModal = (course: CourseRecord) => {
    setTargetCourse(course);
    setAssignFacultyId(facultyList.length > 0 ? facultyList[0].id : '');
    setAssignSectionId(sections.length > 0 ? sections[0].id : '');
    setIsAssignModalOpen(true);
  };

  // Submit Quick Assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCourse || !assignFacultyId || !assignSectionId) return;

    setIsSubmitting(true);
    try {
      await adminService.assignFaculty({
        facultyId: assignFacultyId,
        subjectId: targetCourse.id,
        sectionId: assignSectionId,
      });
      setIsAssignModalOpen(false);
      setActionMessage({ type: 'success', text: `Assigned faculty to ${targetCourse.code}. In-app notification sent.` });
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Assignment failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for currently selected course in remove modal
  const selectedCourseDetails = courses.find(c => c.id === selectedRemoveCourseId);

  // Filter registered courses for remove modal by semester
  const coursesAvailableForRemoval = courses.filter(c => {
    if (removeFilterSemester) {
      return (c.semester || 1) === Number(removeFilterSemester);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Course / Subject Management"
        subtitle="Create, configure curriculum courses, and assign faculty to active classes"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Courses' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenRemoveModal()}
              variant="outline"
              size="sm"
              className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              disabled={courses.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Remove Course
            </Button>
            <Button onClick={handleOpenCreateModal} size="sm" className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Add New Course
            </Button>
          </div>
        }
      />

      {/* Notifications / Alerts */}
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

      {/* Search and Filters */}
      <Card className="p-4 border border-[var(--color-border)]">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px]">
            <Input
              id="course-search"
              placeholder="Search by course code or title..."
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
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
            className="text-xs font-medium bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>
                Semester {s}
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
              setSelectedSemester('');
              loadData();
            }}
            className="p-2 text-slate-500 hover:text-slate-800 border border-[var(--color-border)] rounded-xl hover:bg-slate-50 transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </Card>

      {/* Courses Table */}
      <Card className="border border-[var(--color-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--color-text-muted)]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm">Loading curriculum courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-[var(--color-text-primary)]">No courses found</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Get started by creating a new course above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Course Name</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Faculty & Sections</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600">
                      {course.code}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--color-text-primary)]">
                      {course.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge color="indigo" className="text-[11px] font-semibold">
                        Sem {course.semester || 1}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {course.departmentName} ({course.departmentCode})
                    </td>
                    <td className="py-3.5 px-4">
                      {course.status === 'Assigned' ? (
                        <Badge color="green" className="text-[11px]">
                          Assigned
                        </Badge>
                      ) : (
                        <Badge color="amber" className="text-[11px]">
                          Awaiting Faculty
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {course.assignments.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No faculty assigned</span>
                      ) : (
                        <div className="flex flex-col gap-1 max-w-sm">
                          {course.assignments.map(a => (
                            <div key={a.id} className="text-xs text-slate-700 flex items-center gap-1.5">
                              <span className="font-medium text-slate-900">{a.facultyName}</span>
                              <span className="text-slate-400">→</span>
                              <Badge color="gray" className="text-[10px] py-0 px-1.5">
                                {a.sectionName}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAssignModal(course)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          title="Assign Faculty to Course"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Assign
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
                          title="Edit Course"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenRemoveModal(course.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1"
                          title="Remove Course"
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

      {/* ── Add / Edit Course Modal ── */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={editingCourse ? 'Edit Course Details' : 'Add New Curriculum Course'}
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <Input
            id="course-code"
            label="Course Code (Unique)"
            placeholder="e.g. CS501"
            value={courseFormCode}
            onChange={e => setCourseFormCode(e.target.value.toUpperCase())}
            required
          />

          <Input
            id="course-name"
            label="Course / Subject Name"
            placeholder="e.g. Database Management Systems"
            value={courseFormName}
            onChange={e => setCourseFormName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Department
            </label>
            <select
              value={courseFormDeptId}
              onChange={e => setCourseFormDeptId(e.target.value)}
              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
              required
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Target Academic Semester (1 - 8)
            </label>
            <select
              value={courseFormSemester}
              onChange={e => setCourseFormSemester(Number(e.target.value))}
              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>
                  Semester {sem} (Only Sem {sem} students can view & register)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              Students will only be able to see courses registered for their respective semester.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Remove Course Modal ── */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        title="Remove Registered Course"
      >
        <form onSubmit={handleRemoveCourseSubmit} className="space-y-4">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Choose from the registered courses below to remove it from the curriculum. Only currently registered courses can be removed.
          </p>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Filter by Semester (Optional)
            </label>
            <select
              value={removeFilterSemester}
              onChange={e => {
                const semVal = e.target.value;
                setRemoveFilterSemester(semVal);
                const matching = semVal
                  ? courses.filter(c => (c.semester || 1) === Number(semVal))
                  : courses;
                setSelectedRemoveCourseId(matching.length > 0 ? matching[0].id : '');
              }}
              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-rose-500 font-medium"
            >
              <option value="">All Semesters (Show all registered courses)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Registered Course to Remove
            </label>
            {coursesAvailableForRemoval.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                {removeFilterSemester
                  ? `No courses registered for Semester ${removeFilterSemester} found to remove.`
                  : 'No courses are currently registered to remove.'}
              </p>
            ) : (
              <select
                id="remove-course-select"
                value={selectedRemoveCourseId}
                onChange={e => setSelectedRemoveCourseId(e.target.value)}
                className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-rose-500 font-medium"
                required
              >
                <option value="">-- Select a registered course --</option>
                {coursesAvailableForRemoval.map(c => (
                  <option key={c.id} value={c.id}>
                    [Sem {c.semester || 1}] {c.code} — {c.name} ({c.departmentCode || c.departmentName})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Details preview of the selected course */}
          {selectedCourseDetails && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Selected Course:</span>
                <Badge color="blue" className="text-[11px] font-mono">
                  {selectedCourseDetails.code}
                </Badge>
              </div>
              <div className="text-sm font-bold text-slate-800">{selectedCourseDetails.name}</div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                  <span className="font-medium text-slate-700">{selectedCourseDetails.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Semester</span>
                  <span className="font-semibold text-indigo-700">Semester {selectedCourseDetails.semester || 1}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
                  <span className="font-medium text-slate-700">{selectedCourseDetails.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Faculty Allocations</span>
                  <span className="font-medium text-slate-700">{selectedCourseDetails.assignments.length} assigned</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Quizzes</span>
                  <span className="font-medium text-slate-700">{selectedCourseDetails.quizzesCount || 0} quizzes</span>
                </div>
              </div>

              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">
                  Warning: Removing this registered course will clear its faculty assignments and related curriculum records.
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-[var(--color-border)] mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRemoveModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isSubmitting}
              disabled={!selectedRemoveCourseId || courses.length === 0}
              className="gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Remove Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Quick Assign Modal ── */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={targetCourse ? `Assign Faculty: ${targetCourse.code} — ${targetCourse.name}` : 'Assign Faculty'}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Faculty Member
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
              Class Section
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
              Confirm Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

