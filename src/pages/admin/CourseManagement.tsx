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

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [courseFormName, setCourseFormName] = useState('');
  const [courseFormCode, setCourseFormCode] = useState('');
  const [courseFormDeptId, setCourseFormDeptId] = useState('');
  const [courseFormSemester, setCourseFormSemester] = useState<number>(1);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetCourse, setTargetCourse] = useState<CourseRecord | null>(null);
  const [assignFacultyId, setAssignFacultyId] = useState('');
  const [assignSectionId, setAssignSectionId] = useState('');

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

  useEffect(() => { loadData(); }, [selectedDept, selectedSemester]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); loadData(); };

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setCourseFormName('');
    setCourseFormCode('');
    setCourseFormDeptId(departments.length > 0 ? departments[0].id : '');
    setCourseFormSemester(1);
    setIsCourseModalOpen(true);
    setActionMessage(null);
  };

  const handleOpenEditModal = (c: CourseRecord) => {
    setEditingCourse(c);
    setCourseFormName(c.name);
    setCourseFormCode(c.code);
    setCourseFormDeptId(c.departmentId);
    setCourseFormSemester(c.semester || 1);
    setIsCourseModalOpen(true);
    setActionMessage(null);
  };

  const handleOpenRemoveModal = (preselectedCourseId?: string) => {
    setActionMessage(null);
    if (preselectedCourseId) {
      const tc = courses.find(c => c.id === preselectedCourseId);
      setRemoveFilterSemester(tc ? String(tc.semester || 1) : '');
      setSelectedRemoveCourseId(preselectedCourseId);
    } else {
      setRemoveFilterSemester('');
      setSelectedRemoveCourseId(courses.length > 0 ? courses[0].id : '');
    }
    setIsRemoveModalOpen(true);
  };

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
      setActionMessage({ type: 'success', text: `Course ${courseLabel} was successfully removed from curriculum.` });
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to remove course.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAssignModal = (course: CourseRecord) => {
    setTargetCourse(course);
    setAssignFacultyId(facultyList.length > 0 ? facultyList[0].id : '');
    setAssignSectionId(sections.length > 0 ? sections[0].id : '');
    setIsAssignModalOpen(true);
  };

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

  const selectedCourseDetails = courses.find(c => c.id === selectedRemoveCourseId);
  const coursesAvailableForRemoval = courses.filter(c =>
    removeFilterSemester ? (c.semester || 1) === Number(removeFilterSemester) : true
  );

  // Shared select className for modals
  const selectCls = "w-full text-sm bg-white border border-[#E1D4CA] rounded-xl px-3 py-2 text-[#302A2B] focus:ring-2 focus:ring-[#542536]/20 focus:border-[#542536] outline-none transition-all";

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
              className="gap-2 text-[#8b2c35] border-[#E1D4CA] hover:bg-[#fbeaec] hover:border-[#C58D98]"
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

      {/* Feedback Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-[12px] border text-sm flex items-center gap-2.5 ${
            actionMessage.type === 'success'
              ? 'bg-[#e8f0ea] border-[#34483A]/20 text-[#34483A]'
              : 'bg-[#fbeaec] border-[#8b2c35]/20 text-[#8b2c35]'
          }`}
        >
          {actionMessage.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="font-medium">{actionMessage.text}</span>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px]">
            <Input
              id="course-search"
              placeholder="Search by course code or title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-[#79666A]" />}
            />
          </div>

          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="text-xs font-medium bg-white border border-[#E1D4CA] rounded-[10px] px-3 py-2.5 text-[#302A2B] focus:ring-2 focus:ring-[#542536]/20 focus:border-[#542536] outline-none transition-all"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
            className="text-xs font-medium bg-white border border-[#E1D4CA] rounded-[10px] px-3 py-2.5 text-[#302A2B] focus:ring-2 focus:ring-[#542536]/20 focus:border-[#542536] outline-none transition-all"
          >
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <Button type="submit" variant="secondary" size="sm">Filter</Button>

          <button
            type="button"
            onClick={() => { setSearch(''); setSelectedDept(''); setSelectedSemester(''); loadData(); }}
            className="p-2 text-[#79666A] bg-white hover:bg-[#F7F1E8] border border-[#E1D4CA] rounded-[10px] transition-all hover:border-[#C58D98]"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </Card>

      {/* Courses Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#79666A]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#542536]" />
            <p className="text-sm font-medium">Loading curriculum courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F7F1E8] border border-[#E1D4CA] flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-7 h-7 text-[#79666A]" />
            </div>
            <p className="font-semibold text-sm text-[#302A2B]">No courses found</p>
            <p className="text-xs text-[#79666A] font-normal mt-1">Get started by creating a new course above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr
                  className="text-xs font-semibold text-[#79666A] uppercase tracking-wider"
                  style={{ background: '#F7F1E8', borderBottom: '1px solid #E1D4CA' }}
                >
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Course Name</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Faculty & Sections</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE3E0]">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-[#FAF6F0] transition-colors">
                    <td className="py-3.5 px-4">
                      <span
                        className="font-mono font-semibold text-xs px-2 py-1 rounded-[6px] text-[#542536]"
                        style={{ background: '#EEE3E0', border: '1px solid #E1D4CA' }}
                      >
                        {course.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#302A2B]">{course.name}</td>
                    <td className="py-3.5 px-4">
                      <Badge color="purple" className="text-[11px]">Sem {course.semester || 1}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#302A2B]">
                      {course.departmentName} ({course.departmentCode})
                    </td>
                    <td className="py-3.5 px-4">
                      {course.status === 'Assigned' ? (
                        <Badge color="green" className="text-[11px]">Assigned</Badge>
                      ) : (
                        <Badge color="yellow" className="text-[11px]">Awaiting Faculty</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {course.assignments.length === 0 ? (
                        <span className="text-xs text-[#79666A]/70 italic">No faculty assigned</span>
                      ) : (
                        <div className="flex flex-col gap-1.5 max-w-sm">
                          {course.assignments.map(a => (
                            <div key={a.id} className="text-xs text-[#302A2B] flex items-center gap-1.5">
                              <span className="font-medium">{a.facultyName}</span>
                              <span className="text-[#79666A]">→</span>
                              <Badge color="gray" className="text-[10px] py-0 px-1.5">{a.sectionName}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAssignModal(course)}
                          className="px-3 py-1.5 text-xs font-medium rounded-[8px] text-[#34483A] bg-[#e8f0ea] hover:bg-[#d5e5d8] border border-[#34483A]/20 transition-all flex items-center gap-1"
                          title="Assign Faculty to Course"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Assign
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="px-3 py-1.5 text-xs font-medium rounded-[8px] text-[#542536] bg-[#EEE3E0] hover:bg-[#E1D4CA] border border-[#E1D4CA] transition-all flex items-center gap-1"
                          title="Edit Course"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenRemoveModal(course.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-[8px] text-[#8b2c35] bg-[#fbeaec] hover:bg-[#f5d5d8] border border-[#8b2c35]/20 transition-all flex items-center gap-1"
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
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Department</label>
            <select value={courseFormDeptId} onChange={e => setCourseFormDeptId(e.target.value)} className={selectCls} required>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Target Academic Semester (1 - 8)</label>
            <select value={courseFormSemester} onChange={e => setCourseFormSemester(Number(e.target.value))} className={selectCls} required>
              {[1,2,3,4,5,6,7,8].map(sem => (
                <option key={sem} value={sem}>Semester {sem} (Only Sem {sem} students can view & register)</option>
              ))}
            </select>
            <p className="text-[11px] text-[#79666A] mt-1">Students will only be able to see courses registered for their respective semester.</p>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsCourseModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{editingCourse ? 'Save Changes' : 'Create Course'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Remove Course Modal ── */}
      <Modal isOpen={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)} title="Remove Registered Course">
        <form onSubmit={handleRemoveCourseSubmit} className="space-y-4">
          <p className="text-xs text-[#79666A] leading-relaxed">
            Choose from the registered courses below to remove it from the curriculum. Only currently registered courses can be removed.
          </p>
          <div>
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Filter by Semester (Optional)</label>
            <select
              value={removeFilterSemester}
              onChange={e => {
                const semVal = e.target.value;
                setRemoveFilterSemester(semVal);
                const matching = semVal ? courses.filter(c => (c.semester || 1) === Number(semVal)) : courses;
                setSelectedRemoveCourseId(matching.length > 0 ? matching[0].id : '');
              }}
              className={selectCls}
            >
              <option value="">All Semesters (Show all registered courses)</option>
              {[1,2,3,4,5,6,7,8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Registered Course to Remove</label>
            {coursesAvailableForRemoval.length === 0 ? (
              <p className="text-xs text-[#B69A69] bg-[#f5ede0] p-3 rounded-xl border border-[#B69A69]/30">
                {removeFilterSemester
                  ? `No courses registered for Semester ${removeFilterSemester} found to remove.`
                  : 'No courses are currently registered to remove.'}
              </p>
            ) : (
              <select
                id="remove-course-select"
                value={selectedRemoveCourseId}
                onChange={e => setSelectedRemoveCourseId(e.target.value)}
                className={selectCls}
                required
              >
                <option value="">-- Select a registered course --</option>
                {coursesAvailableForRemoval.map(c => (
                  <option key={c.id} value={c.id}>[Sem {c.semester || 1}] {c.code} — {c.name} ({c.departmentCode || c.departmentName})</option>
                ))}
              </select>
            )}
          </div>

          {selectedCourseDetails && (
            <div className="bg-[#F7F1E8] border border-[#E1D4CA] rounded-xl p-3.5 space-y-2 text-xs text-[#302A2B]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Selected Course:</span>
                <Badge color="blue" className="text-[11px] font-mono">{selectedCourseDetails.code}</Badge>
              </div>
              <div className="text-sm font-bold">{selectedCourseDetails.name}</div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E1D4CA]/80">
                <div>
                  <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Department</span>
                  <span className="font-medium">{selectedCourseDetails.departmentName}</span>
                </div>
                <div>
                  <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Semester</span>
                  <span className="font-semibold text-[#542536]">Semester {selectedCourseDetails.semester || 1}</span>
                </div>
                <div>
                  <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Status</span>
                  <span className="font-medium">{selectedCourseDetails.status}</span>
                </div>
                <div>
                  <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Faculty Allocations</span>
                  <span className="font-medium">{selectedCourseDetails.assignments.length} assigned</span>
                </div>
              </div>
              <div className="p-2.5 bg-[#fbeaec] border border-[#8b2c35]/20 rounded-lg text-[#8b2c35] flex items-start gap-2 mt-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">
                  Warning: Removing this registered course will clear its faculty assignments and related curriculum records.
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-[#E1D4CA] mt-4">
            <Button type="button" variant="outline" onClick={() => setIsRemoveModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="danger" isLoading={isSubmitting} disabled={!selectedRemoveCourseId || courses.length === 0} className="gap-1.5">
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
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Faculty Member</label>
            <select value={assignFacultyId} onChange={e => setAssignFacultyId(e.target.value)} className={selectCls} required>
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Class Section</label>
            <select value={assignSectionId} onChange={e => setAssignSectionId(e.target.value)} className={selectCls} required>
              {sections.map(s => (
                <option key={s.id} value={s.id}>Semester {s.semester} — Section {s.name} ({s.departmentName})</option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Confirm Allocation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
