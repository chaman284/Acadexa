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
  BookOpen, Search, Plus, Edit,
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

  // Course Add/Edit Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [courseFormName, setCourseFormName] = useState('');
  const [courseFormCode, setCourseFormCode] = useState('');
  const [courseFormDeptId, setCourseFormDeptId] = useState('');

  // Quick Assign Faculty Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetCourse, setTargetCourse] = useState<CourseRecord | null>(null);
  const [assignFacultyId, setAssignFacultyId] = useState('');
  const [assignSectionId, setAssignSectionId] = useState('');

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
  }, [selectedDept]);

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
    setIsCourseModalOpen(true);
    setActionMessage(null);
  };

  // Open Edit Modal
  const handleOpenEditModal = (c: CourseRecord) => {
    setEditingCourse(c);
    setCourseFormName(c.name);
    setCourseFormCode(c.code);
    setCourseFormDeptId(c.departmentId);
    setIsCourseModalOpen(true);
    setActionMessage(null);
  };

  // Save Course (Create or Update)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormName.trim() || !courseFormCode.trim() || !courseFormDeptId) {
      setActionMessage({ type: 'error', text: 'Course name, unique code, and department are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse.id, {
          name: courseFormName.trim(),
          code: courseFormCode.trim(),
          departmentId: courseFormDeptId,
        });
        setActionMessage({ type: 'success', text: 'Course updated successfully.' });
      } else {
        await adminService.createCourse({
          name: courseFormName.trim(),
          code: courseFormCode.trim(),
          departmentId: courseFormDeptId,
        });
        setActionMessage({ type: 'success', text: 'New course created and added to curriculum.' });
      }
      setIsCourseModalOpen(false);
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Operation failed.' });
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Course / Subject Management"
        subtitle="Create, configure curriculum courses, and assign faculty to active classes"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Courses' }]}
        action={
          <Button onClick={handleOpenCreateModal} size="sm" className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Add New Course
          </Button>
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

          <Button type="submit" variant="secondary" size="sm">
            Filter
          </Button>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedDept('');
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
