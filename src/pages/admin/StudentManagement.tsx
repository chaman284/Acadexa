import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  adminService,
  type StudentRecord,
  type SectionRecord,
  type DepartmentRecord,
} from '../../services/adminService';
import {
  GraduationCap, Search, UserPlus, Edit3, Trash2,
  CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Register Student Modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRollNo, setRegRollNo] = useState('');
  const [regSectionId, setRegSectionId] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Reassign Section Modal
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignStudent, setReassignStudent] = useState<StudentRecord | null>(null);
  const [newSectionId, setNewSectionId] = useState('');

  // Remove Student Modal
  const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] = useState(false);
  const [selectedRemoveStudentId, setSelectedRemoveStudentId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const [stuRes, secRes, deptRes] = await Promise.all([
        adminService.getStudents({
          search: search || undefined,
          year: selectedYear || undefined,
          semester: selectedSemester || undefined,
          departmentId: selectedDept || undefined,
          sectionId: selectedSectionId || undefined,
        }),
        adminService.getSections(),
        adminService.getDepartments(),
      ]);
      setStudents(stuRes);
      setSections(secRes);
      setDepartments(deptRes);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load students.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedSemester, selectedDept, selectedSectionId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Open Register Modal
  const handleOpenRegisterModal = () => {
    setRegName('');
    setRegEmail('');
    setRegRollNo('');
    setRegSectionId(sections.length > 0 ? sections[0].id : '');
    setRegPassword('student123');
    setIsRegisterModalOpen(true);
    setActionMessage(null);
  };

  // Submit Student Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regRollNo.trim() || !regSectionId) {
      setActionMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createStudent({
        name: regName.trim(),
        email: regEmail.trim(),
        rollNo: regRollNo.trim().toUpperCase(),
        sectionId: regSectionId,
        password: regPassword || 'student123',
      });
      setIsRegisterModalOpen(false);
      setActionMessage({ type: 'success', text: `Student ${regName} registered successfully!` });
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to register student.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Reassign Section Modal
  const handleOpenReassignModal = (student: StudentRecord) => {
    setReassignStudent(student);
    setNewSectionId(student.sectionId);
    setIsReassignModalOpen(true);
    setActionMessage(null);
  };

  // Submit Section Reassignment
  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignStudent || !newSectionId) return;

    setIsSubmitting(true);
    try {
      await adminService.updateStudentSection(reassignStudent.id, newSectionId);
      setIsReassignModalOpen(false);
      setActionMessage({ type: 'success', text: `Student ${reassignStudent.name} section updated. Academic history preserved.` });
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reassign section.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Remove Student Modal
  const handleOpenRemoveStudentModal = (studentId?: string) => {
    setActionMessage(null);
    if (studentId) {
      setSelectedRemoveStudentId(studentId);
    } else if (students.length > 0) {
      setSelectedRemoveStudentId(students[0].id);
    } else {
      setSelectedRemoveStudentId('');
    }
    setIsRemoveStudentModalOpen(true);
  };

  // Submit Student Removal
  const handleRemoveStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRemoveStudentId) return;

    const studentToDelete = students.find(s => s.id === selectedRemoveStudentId);
    const studentLabel = studentToDelete ? `${studentToDelete.name} (${studentToDelete.rollNo})` : 'Student';

    setIsSubmitting(true);
    try {
      await adminService.deleteStudent(selectedRemoveStudentId);
      setIsRemoveStudentModalOpen(false);
      setSelectedRemoveStudentId('');
      setActionMessage({
        type: 'success',
        text: `Student ${studentLabel} was successfully removed.`,
      });
      loadData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to remove student.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Student & Section Management"
        subtitle="Manage student enrollment, class allocations, and monitor academic progress"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Students' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenRemoveStudentModal()}
              variant="outline"
              size="sm"
              className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              disabled={students.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Remove Student
            </Button>
            <Button onClick={handleOpenRegisterModal} size="sm" className="gap-2 shadow-sm">
              <UserPlus className="w-4 h-4" />
              Register Student
            </Button>
          </div>
        }
      />

      {/* Action Messages */}
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

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-[var(--color-border)]">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <Input
              id="student-search"
              placeholder="Search by name, email, or roll no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Academic Year Filter */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="text-xs font-medium bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          {/* Semester Filter */}
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

          {/* Department Filter */}
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

          {/* Section Filter */}
          <select
            value={selectedSectionId}
            onChange={e => setSelectedSectionId(e.target.value)}
            className="text-xs font-medium bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="">All Sections</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>
                Sem {s.semester} - {s.name}
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
              setSelectedYear('');
              setSelectedSemester('');
              setSelectedDept('');
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

      {/* Students Table */}
      <Card className="border border-[var(--color-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--color-text-muted)]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm">Loading student directory...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-[var(--color-text-primary)]">No students found</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Register a student to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Year / Sem</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4 text-center">Quiz Attempts</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600">
                      {student.rollNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--color-text-primary)]">
                      {student.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {student.email}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {student.departmentCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-slate-700">
                        Year {student.year} · Sem {student.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge color="gray" className="text-[11px]">
                        {student.sectionName}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {student.quizAttemptsCount} attempts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReassignModal(student)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                          title="Change Student Section"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Reassign
                        </button>
                        <button
                          onClick={() => handleOpenRemoveStudentModal(student.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors inline-flex items-center gap-1"
                          title="Remove Student"
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

      {/* ── Register Student Modal ── */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Student"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <Input
            id="student-name"
            label="Full Name"
            placeholder="e.g. Alex Johnson"
            value={regName}
            onChange={e => setRegName(e.target.value)}
            required
          />

          <Input
            id="student-email"
            label="College Email"
            type="email"
            placeholder="e.g. alex@cs.college.edu"
            value={regEmail}
            onChange={e => setRegEmail(e.target.value)}
            required
          />

          <Input
            id="student-rollno"
            label="Roll Number (Unique)"
            placeholder="e.g. CS2024099"
            value={regRollNo}
            onChange={e => setRegRollNo(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Assign to Section
            </label>
            <select
              value={regSectionId}
              onChange={e => setRegSectionId(e.target.value)}
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

          <Input
            id="student-password"
            label="Initial Password"
            type="text"
            value={regPassword}
            onChange={e => setRegPassword(e.target.value)}
            hint="Default is student123. The student can change this in Settings."
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Register Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Reassign Section Modal ── */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title={reassignStudent ? `Update Section: ${reassignStudent.name}` : 'Change Section'}
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Changing a student's section moves them into the selected section cohort. Previous quiz attempts, answers, and scores will remain completely intact.
          </p>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Select New Section
            </label>
            <select
              value={newSectionId}
              onChange={e => setNewSectionId(e.target.value)}
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
            <Button type="button" variant="outline" onClick={() => setIsReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Update Section
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Remove Student Modal ── */}
      <Modal
        isOpen={isRemoveStudentModalOpen}
        onClose={() => setIsRemoveStudentModalOpen(false)}
        title="Remove Registered Student"
      >
        <form onSubmit={handleRemoveStudentSubmit} className="space-y-4">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Choose from the registered students below to remove their account and academic enrollment.
          </p>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Registered Student
            </label>
            {students.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                No students are currently registered to remove.
              </p>
            ) : (
              <select
                id="remove-student-select"
                value={selectedRemoveStudentId}
                onChange={e => setSelectedRemoveStudentId(e.target.value)}
                className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-rose-500 font-medium"
                required
              >
                <option value="">-- Select a registered student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.rollNo} — {s.name} ({s.sectionName} · {s.departmentCode})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Details preview of the selected student */}
          {(() => {
            const studentDetails = students.find(s => s.id === selectedRemoveStudentId);
            if (!studentDetails) return null;

            return (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Selected Student:</span>
                  <Badge color="blue" className="text-[11px] font-mono">
                    {studentDetails.rollNo}
                  </Badge>
                </div>
                <div className="text-sm font-bold text-slate-800">{studentDetails.name}</div>
                <div className="text-xs text-slate-500">{studentDetails.email}</div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cohort / Section</span>
                    <span className="font-medium text-slate-700">{studentDetails.sectionName} ({studentDetails.departmentName})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Academic Stage</span>
                    <span className="font-medium text-slate-700">Year {studentDetails.yearNumber || studentDetails.year} · Sem {studentDetails.semester}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Quiz Attempts</span>
                    <span className="font-medium text-slate-700">{studentDetails.quizAttemptsCount} attempts recorded</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Enrollment</span>
                    <span className="font-medium text-slate-700">{new Date(studentDetails.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    Warning: Removing this student will permanently delete their student profile, user account, and all recorded quiz attempts.
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="pt-2 flex justify-end gap-2 border-t border-[var(--color-border)] mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRemoveStudentModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isSubmitting}
              disabled={!selectedRemoveStudentId || students.length === 0}
              className="gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Remove Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
