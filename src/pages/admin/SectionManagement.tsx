import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  adminService,
  type SectionRecord,
  type DepartmentRecord,
} from '../../services/adminService';
import {
  Building2, Plus, Users, BookOpen, Trash2,
  CheckCircle2, AlertCircle, RefreshCw, Layers
} from 'lucide-react';

export const SectionManagement: React.FC = () => {
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('');

  // Add Section Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState('A');
  const [sectionSemester, setSectionSemester] = useState(5);
  const [sectionDeptId, setSectionDeptId] = useState('');

  // Remove Section Modal
  const [isRemoveSectionModalOpen, setIsRemoveSectionModalOpen] = useState(false);
  const [selectedRemoveSectionId, setSelectedRemoveSectionId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const [secRes, deptRes] = await Promise.all([
        adminService.getSections(selectedDept || undefined),
        adminService.getDepartments(),
      ]);
      setSections(secRes);
      setDepartments(deptRes);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load sections.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  const handleOpenAddModal = () => {
    setSectionName('A');
    setSectionSemester(5);
    setSectionDeptId(departments.length > 0 ? departments[0].id : '');
    setIsAddModalOpen(true);
    setActionMessage(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim() || !sectionSemester || !sectionDeptId) {
      setActionMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createSection({
        name: sectionName.trim().toUpperCase(),
        semester: Number(sectionSemester),
        departmentId: sectionDeptId,
      });
      setIsAddModalOpen(false);
      setActionMessage({ type: 'success', text: `Section ${sectionName.toUpperCase()} for Semester ${sectionSemester} created successfully!` });
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to create section.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRemoveSectionModal = (sectionId?: string) => {
    setActionMessage(null);
    if (sectionId) {
      setSelectedRemoveSectionId(sectionId);
    } else if (sections.length > 0) {
      setSelectedRemoveSectionId(sections[0].id);
    } else {
      setSelectedRemoveSectionId('');
    }
    setIsRemoveSectionModalOpen(true);
  };

  const handleRemoveSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRemoveSectionId) return;

    const sectionToDelete = sections.find(s => s.id === selectedRemoveSectionId);
    const sectionLabel = sectionToDelete ? `Sem ${sectionToDelete.semester}-${sectionToDelete.name} (${sectionToDelete.departmentCode})` : 'Section';

    setIsSubmitting(true);
    try {
      await adminService.deleteSection(selectedRemoveSectionId);
      setIsRemoveSectionModalOpen(false);
      setSelectedRemoveSectionId('');
      setActionMessage({
        type: 'success',
        text: `Section ${sectionLabel} was successfully removed.`,
      });
      loadData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to remove section.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSectionDetails = sections.find(s => s.id === selectedRemoveSectionId);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Department & Section Organization"
        subtitle="Manage academic class cohorts, semesters, years, and student section allocations"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Sections' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenRemoveSectionModal()}
              variant="outline"
              size="sm"
              className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              disabled={sections.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Remove Section
            </Button>
            <Button onClick={handleOpenAddModal} size="sm" className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Add New Section
            </Button>
          </div>
        }
      />

      {/* Action Feedback */}
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

      {/* Department Filter Bar */}
      <Card className="p-4 border border-[var(--color-border)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Filter by Department:</span>
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
        </div>

        <button
          onClick={loadData}
          className="p-2 text-slate-500 hover:text-slate-800 border border-[var(--color-border)] rounded-xl hover:bg-slate-50 transition-colors"
          title="Refresh Sections"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </Card>

      {/* Sections Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[var(--color-text-muted)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-sm">Loading department sections...</p>
        </div>
      ) : sections.length === 0 ? (
        <Card className="p-12 text-center border border-[var(--color-border)]">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-sm text-[var(--color-text-primary)]">No class sections found</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Create a section to organize classes and students.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map(section => (
            <Card key={section.id} className="p-5 border border-[var(--color-border)] hover:border-indigo-200 transition-colors relative group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[var(--color-text-primary)]">
                      Sem {section.semester} — Section {section.name}
                    </span>
                    <Badge color="indigo" className="text-[10px]">
                      Year {section.year}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {section.departmentName} ({section.departmentCode})
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenRemoveSectionModal(section.id)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    title="Remove Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[var(--color-border)] my-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block leading-tight">
                      {section.studentsCount} Students
                    </span>
                    <span className="text-[10px] text-slate-400">Enrolled cohort</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block leading-tight">
                      {section.assignmentsCount} Courses
                    </span>
                    <span className="text-[10px] text-slate-400">Teaching subjects</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Assigned Faculty
                </span>
                {section.faculty.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No faculty assigned to this section yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {section.faculty.map(f => (
                      <span key={f} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Add Section Modal ── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Academic Section"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Department
            </label>
            <select
              value={sectionDeptId}
              onChange={e => setSectionDeptId(e.target.value)}
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
              Academic Semester
            </label>
            <select
              value={sectionSemester}
              onChange={e => setSectionSemester(Number(e.target.value))}
              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>
                  Semester {sem} (Year {Math.ceil(sem / 2)})
                </option>
              ))}
            </select>
          </div>

          <Input
            id="section-name"
            label="Section Identifier"
            placeholder="e.g. A, B, or C"
            value={sectionName}
            onChange={e => setSectionName(e.target.value.toUpperCase())}
            required
            hint="Single character or code representing the class cohort."
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Section
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Remove Section Modal ── */}
      <Modal
        isOpen={isRemoveSectionModalOpen}
        onClose={() => setIsRemoveSectionModalOpen(false)}
        title="Remove Academic Section"
      >
        <form onSubmit={handleRemoveSectionSubmit} className="space-y-4">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Choose from the registered class sections below to remove the cohort and clear its allocations.
          </p>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Registered Section
            </label>
            {sections.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                No sections are currently registered to remove.
              </p>
            ) : (
              <select
                id="remove-section-select"
                value={selectedRemoveSectionId}
                onChange={e => setSelectedRemoveSectionId(e.target.value)}
                className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-rose-500 font-medium"
                required
              >
                <option value="">-- Select a registered section --</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>
                    Semester {s.semester} — Section {s.name} ({s.departmentName})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Details preview of the selected section */}
          {selectedSectionDetails && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Selected Section:</span>
                <Badge color="indigo" className="text-[11px]">
                  Sem {selectedSectionDetails.semester} — {selectedSectionDetails.name}
                </Badge>
              </div>
              <div className="text-sm font-bold text-slate-800">
                {selectedSectionDetails.departmentName} ({selectedSectionDetails.departmentCode})
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Academic Year</span>
                  <span className="font-medium text-slate-700">Year {selectedSectionDetails.year}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Enrolled Students</span>
                  <span className="font-medium text-slate-700">{selectedSectionDetails.studentsCount} students</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Courses</span>
                  <span className="font-medium text-slate-700">{selectedSectionDetails.assignmentsCount} courses</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Faculty</span>
                  <span className="font-medium text-slate-700">{selectedSectionDetails.faculty.length} instructors</span>
                </div>
              </div>

              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">
                  Warning: Removing this section will permanently remove this class cohort, its student allocations, and faculty assignments.
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-[var(--color-border)] mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRemoveSectionModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isSubmitting}
              disabled={!selectedRemoveSectionId || sections.length === 0}
              className="gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Remove Section
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

