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

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFacultyForProfile, setSelectedFacultyForProfile] = useState<FacultyRecord | null>(null);
  const [isRemoveFacultyModalOpen, setIsRemoveFacultyModalOpen] = useState(false);
  const [selectedRemoveFacultyId, setSelectedRemoveFacultyId] = useState('');

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
      setActionMessage({ type: 'success', text: `${facultyLabel} was successfully removed.` });
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to remove faculty member.' });
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
      await adminService.assignFaculty({ facultyId: assignFacultyId, subjectId: assignSubjectId, sectionId: assignSectionId });
      setIsAssignModalOpen(false);
      setActionMessage({ type: 'success', text: 'Faculty assigned successfully! In-app notification sent.' });
      loadData();
      if (selectedFacultyForProfile) {
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

  // Shared select className
  const selectCls = "w-full text-sm bg-white border border-[#E1D4CA] rounded-xl px-3 py-2 text-[#302A2B] focus:ring-2 focus:ring-[#542536]/20 focus:border-[#542536] outline-none transition-all";

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
              className="gap-2 text-[#8b2c35] border-[#E1D4CA] hover:bg-[#fbeaec] hover:border-[#C58D98]"
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

      {/* Filters Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <Input
              id="faculty-search"
              placeholder="Search faculty by name or email..."
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
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="text-xs font-medium bg-white border border-[#E1D4CA] rounded-[10px] px-3 py-2.5 text-[#302A2B] focus:ring-2 focus:ring-[#542536]/20 focus:border-[#542536] outline-none transition-all"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>

          <select
            value={selectedSectionId}
            onChange={e => setSelectedSectionId(e.target.value)}
            className="text-xs font-medium bg-white border border-[#E1D4CA] rounded-[10px] px-3 py-2.5 text-[#302A2B] focus:ring-2 focus:ring-[#542536]/20 focus:border-[#542536] outline-none transition-all"
          >
            <option value="">All Sections</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>Sem {s.semester} - Sec {s.name}</option>
            ))}
          </select>

          <Button type="submit" variant="secondary" size="sm">Filter</Button>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedDept('');
              setSelectedSubjectId('');
              setSelectedSectionId('');
              loadData();
            }}
            className="p-2 text-[#79666A] bg-white hover:bg-[#F7F1E8] border border-[#E1D4CA] rounded-[10px] transition-all hover:border-[#C58D98]"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </Card>

      {/* Faculty Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#79666A]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#542536]" />
            <p className="text-sm font-medium">Loading faculty directory...</p>
          </div>
        ) : facultyList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F7F1E8] border border-[#E1D4CA] flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-[#79666A]" />
            </div>
            <p className="font-semibold text-sm text-[#302A2B]">No faculty members found</p>
            <p className="text-xs text-[#79666A] font-normal mt-1">Try broadening your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr
                  className="text-xs font-semibold text-[#79666A] uppercase tracking-wider"
                  style={{ background: '#F7F1E8', borderBottom: '1px solid #E1D4CA' }}
                >
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Assigned Courses</th>
                  <th className="py-3 px-4">Sections Taught</th>
                  <th className="py-3 px-4 text-center">Courses</th>
                  <th className="py-3 px-4 text-center">Sections</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE3E0]">
                {facultyList.map(faculty => (
                  <tr key={faculty.id} className="hover:bg-[#FAF6F0] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #542536, #321923)' }}
                        >
                          {faculty.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#302A2B] leading-none text-[13px]">{faculty.name}</p>
                          <p className="text-xs text-[#79666A] font-normal mt-0.5">{faculty.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {faculty.assignments.length === 0 ? (
                        <span className="text-xs text-[#79666A]/70 italic">None assigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {Array.from(new Set(faculty.assignments.map(a => a.subjectCode))).map(code => (
                            <Badge key={code} color="indigo" className="text-[11px]">{code}</Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {faculty.assignments.length === 0 ? (
                        <span className="text-xs text-[#79666A]/70 italic">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {Array.from(new Set(faculty.assignments.map(a => `Sem ${a.semester}-${a.sectionName}`))).map(sec => (
                            <Badge key={sec} color="yellow" className="text-[11px]">{sec}</Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-[#302A2B]">{faculty.coursesCount}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-[#302A2B]">{faculty.sectionsCount}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedFacultyForProfile(faculty)}
                          className="px-3 py-1.5 text-xs font-medium rounded-[8px] text-[#542536] bg-[#EEE3E0] hover:bg-[#E1D4CA] border border-[#E1D4CA] transition-all flex items-center gap-1"
                          title="View Assignments & Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Profile
                        </button>
                        <button
                          onClick={() => handleOpenAssignModal(faculty.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-[8px] text-[#34483A] bg-[#e8f0ea] hover:bg-[#d5e5d8] border border-[#34483A]/20 transition-all flex items-center gap-1"
                          title="Assign to Section"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Assign
                        </button>
                        <button
                          onClick={() => handleOpenRemoveFacultyModal(faculty.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-[8px] text-[#8b2c35] bg-[#fbeaec] hover:bg-[#f5d5d8] border border-[#8b2c35]/20 transition-all flex items-center gap-1"
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
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Faculty to Course & Section">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Select Faculty</label>
            <select value={assignFacultyId} onChange={e => setAssignFacultyId(e.target.value)} className={selectCls} required>
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Course / Subject</label>
            <select value={assignSubjectId} onChange={e => setAssignSubjectId(e.target.value)} className={selectCls} required>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.name} ({c.departmentName})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Target Section / Class</label>
            <select value={assignSectionId} onChange={e => setAssignSectionId(e.target.value)} className={selectCls} required>
              {sections.map(s => (
                <option key={s.id} value={s.id}>Semester {s.semester} — Section {s.name} ({s.departmentName})</option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Confirm Assignment</Button>
          </div>
        </form>
      </Modal>

      {/* ── Faculty Profile Modal ── */}
      <Modal
        isOpen={!!selectedFacultyForProfile}
        onClose={() => setSelectedFacultyForProfile(null)}
        title={selectedFacultyForProfile ? `${selectedFacultyForProfile.name} — Teaching Allocations` : 'Faculty Profile'}
        size="lg"
      >
        {selectedFacultyForProfile && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#F7F1E8] rounded-xl border border-[#E1D4CA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #542536, #321923)' }}
                >
                  {selectedFacultyForProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#302A2B]">{selectedFacultyForProfile.name}</p>
                  <p className="text-xs text-[#79666A]">{selectedFacultyForProfile.email}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleOpenAssignModal(selectedFacultyForProfile.id)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Assignment
              </Button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#79666A] uppercase tracking-wider mb-2">
                Active Assignments ({selectedFacultyForProfile.assignments.length})
              </h4>
              {selectedFacultyForProfile.assignments.length === 0 ? (
                <p className="text-xs text-[#79666A]/70 italic py-4 text-center">
                  No courses or sections currently assigned to this faculty member.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedFacultyForProfile.assignments.map(a => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl border border-[#E1D4CA] bg-white flex items-center justify-between hover:border-[#C58D98] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#302A2B]">{a.subjectCode} — {a.subjectName}</span>
                          <Badge color="indigo" className="text-[10px]">Sem {a.semester} · {a.sectionName}</Badge>
                        </div>
                        <p className="text-[11px] text-[#79666A] mt-0.5">Department: {a.department}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(a.id)}
                        className="p-1.5 text-[#8b2c35] hover:bg-[#fbeaec] rounded-lg transition-colors"
                        title="Remove Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E1D4CA] flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedFacultyForProfile(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Remove Faculty Modal ── */}
      <Modal isOpen={isRemoveFacultyModalOpen} onClose={() => setIsRemoveFacultyModalOpen(false)} title="Remove Registered Faculty Member">
        <form onSubmit={handleRemoveFacultySubmit} className="space-y-4">
          <p className="text-xs text-[#79666A] leading-relaxed">
            Choose from the registered faculty members below to remove their account and revoke all their course allocations.
          </p>
          <div>
            <label className="block text-xs font-medium text-[#79666A] mb-1.5">Registered Faculty Member</label>
            {facultyList.length === 0 ? (
              <p className="text-xs text-[#B69A69] bg-[#f5ede0] p-3 rounded-xl border border-[#B69A69]/30">
                No faculty members are currently registered to remove.
              </p>
            ) : (
              <select
                id="remove-faculty-select"
                value={selectedRemoveFacultyId}
                onChange={e => setSelectedRemoveFacultyId(e.target.value)}
                className={selectCls}
                required
              >
                <option value="">-- Select a registered faculty member --</option>
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>{f.name} — {f.email}</option>
                ))}
              </select>
            )}
          </div>

          {(() => {
            const fd = facultyList.find(f => f.id === selectedRemoveFacultyId);
            if (!fd) return null;
            return (
              <div className="bg-[#F7F1E8] border border-[#E1D4CA] rounded-xl p-3.5 space-y-2 text-xs text-[#302A2B]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Selected Faculty:</span>
                  <Badge color="purple" className="text-[11px]">Faculty Member</Badge>
                </div>
                <div className="text-sm font-bold text-[#302A2B]">{fd.name}</div>
                <div className="text-xs text-[#79666A]">{fd.email}</div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E1D4CA]/80">
                  <div>
                    <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Courses Assigned</span>
                    <span className="font-medium text-[#302A2B]">{fd.coursesCount} courses</span>
                  </div>
                  <div>
                    <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Sections Assigned</span>
                    <span className="font-medium text-[#302A2B]">{fd.sectionsCount} sections</span>
                  </div>
                </div>
                <div className="p-2.5 bg-[#fbeaec] border border-[#8b2c35]/20 rounded-lg text-[#8b2c35] flex items-start gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    Warning: Removing this faculty member will delete their user account and detach all their assigned subjects and sections.
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="pt-2 flex justify-end gap-2 border-t border-[#E1D4CA] mt-4">
            <Button type="button" variant="outline" onClick={() => setIsRemoveFacultyModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="danger" isLoading={isSubmitting} disabled={!selectedRemoveFacultyId || facultyList.length === 0} className="gap-1.5">
              <Trash2 className="w-4 h-4" />
              Remove Faculty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
