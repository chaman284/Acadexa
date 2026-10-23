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
    if (!selectedRemoveSectionId) {
      setActionMessage({ type: 'error', text: 'Please select a section to remove.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.deleteSection(selectedRemoveSectionId);
      setIsRemoveSectionModalOpen(false);
      setSelectedRemoveSectionId('');
      setActionMessage({ type: 'success', text: 'Section removed successfully!' });
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to remove section.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSectionDetails = sections.find(s => s.id === selectedRemoveSectionId);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Class Sections & Cohorts"
        subtitle="Manage semester sections, academic year divisions, and enrolled cohorts"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Sections' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenRemoveSectionModal()}
              variant="outline"
              size="sm"
              className="gap-2 text-[#8b2c35] border-[#EAD5D9] hover:bg-[#FAF0F2] hover:border-[#8b2c35]"
              disabled={sections.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Remove Section
            </Button>
            <Button onClick={handleOpenAddModal} size="sm" className="gap-2 shadow-xs">
              <Plus className="w-4 h-4" />
              Add New Section
            </Button>
          </div>
        }
      />

      {/* Action Feedback */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-[12px] border text-xs font-medium flex items-center gap-2.5 transition-all shadow-xs ${
            actionMessage.type === 'success'
              ? 'bg-[#F0F4EF] border-[#D5DFD4] text-[#34483A]'
              : 'bg-[#FAF0F2] border-[#EAD5D9] text-[#542536]'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 text-[#34483A]" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-[#542536]" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Department Filter Bar */}
      <Card className="p-4 flex items-center justify-between gap-4 border border-[#E1D4CA] shadow-xs">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-[#542536]" />
          <span className="text-xs font-semibold text-[#302A2B]">Filter by Department:</span>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="text-xs font-medium bg-white border border-[#E1D4CA] rounded-[8px] px-3 py-1.5 text-[#302A2B] focus:border-[#542536] focus:outline-none focus:ring-1 focus:ring-[#542536]/20 transition-all shadow-xs"
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
          className="p-1.5 text-[#79666A] hover:text-[#542536] bg-white hover:bg-[#F7F1E8] border border-[#E1D4CA] rounded-[8px] transition-colors shadow-xs cursor-pointer"
          title="Refresh Sections"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </Card>

      {/* Sections Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#79666A]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#542536]" />
          <p className="text-sm font-medium">Loading department sections...</p>
        </div>
      ) : sections.length === 0 ? (
        <Card className="p-12 text-center border border-[#E1D4CA] shadow-xs">
          <div className="w-12 h-12 rounded-[12px] bg-[#F7F1E8] border border-[#E1D4CA] flex items-center justify-center mx-auto mb-3 text-[#79666A]">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="font-semibold text-sm text-[#302A2B]">No class sections found</p>
          <p className="text-xs text-[#79666A] font-normal mt-1">Create a section to organize classes and students.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map(section => (
            <Card key={section.id} className="p-5 relative group border border-[#E1D4CA] shadow-xs hover:shadow-card transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-[#302A2B]">
                      Sem {section.semester} — Section {section.name}
                    </span>
                    <Badge color="oxblood" className="text-[10px]">
                      Year {section.year}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#79666A] font-normal mt-0.5">
                    {section.departmentName} ({section.departmentCode})
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenRemoveSectionModal(section.id)}
                    className="w-7 h-7 rounded-[7px] bg-[#FAF0F2] text-[#8b2c35] hover:bg-[#8b2c35] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-7 h-7 rounded-[7px] bg-[#F7F1E8] border border-[#E1D4CA] flex items-center justify-center text-[#542536]">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E1D4CA]/70 my-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#542536]" />
                  <div>
                    <span className="text-xs font-semibold text-[#302A2B] block leading-tight">
                      {section.studentsCount} Students
                    </span>
                    <span className="text-[10px] text-[#79666A] font-normal">Enrolled cohort</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#687B62]" />
                  <div>
                    <span className="text-xs font-semibold text-[#302A2B] block leading-tight">
                      {section.assignmentsCount} Courses
                    </span>
                    <span className="text-[10px] text-[#79666A] font-normal">Teaching subjects</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#79666A] uppercase tracking-wider block mb-1.5">
                  Assigned Faculty
                </span>
                {section.faculty.length === 0 ? (
                  <p className="text-xs text-[#79666A]/70 font-normal italic">No faculty assigned to this section yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {section.faculty.map(f => (
                      <span
                        key={f}
                        className="text-xs px-2.5 py-0.5 rounded-[6px] bg-[#F7F1E8] text-[#542536] font-medium border border-[#E1D4CA]"
                      >
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
            <label className="block text-xs font-semibold text-[#302A2B] mb-1">
              Department
            </label>
            <select
              value={sectionDeptId}
              onChange={e => setSectionDeptId(e.target.value)}
              className="w-full text-sm bg-white border border-[#E1D4CA] rounded-[10px] px-3 py-2 text-[#302A2B] shadow-xs focus:ring-2 focus:ring-[#542536]/10 focus:border-[#542536] outline-none"
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
            <label className="block text-xs font-semibold text-[#302A2B] mb-1">
              Academic Semester
            </label>
            <select
              value={sectionSemester}
              onChange={e => setSectionSemester(Number(e.target.value))}
              className="w-full text-sm bg-white border border-[#E1D4CA] rounded-[10px] px-3 py-2 text-[#302A2B] shadow-xs focus:ring-2 focus:ring-[#542536]/10 focus:border-[#542536] outline-none"
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

          <div className="pt-2 flex justify-end gap-2 border-t border-[#E1D4CA] mt-4">
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
          <p className="text-xs text-[#79666A] leading-relaxed font-normal">
            Choose from the registered class sections below to remove the cohort and clear its allocations.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#302A2B] mb-1">
              Registered Section
            </label>
            {sections.length === 0 ? (
              <p className="text-xs text-[#8b2c35] bg-[#FAF0F2] p-3 rounded-[10px] border border-[#EAD5D9]">
                No sections are currently registered to remove.
              </p>
            ) : (
              <select
                id="remove-section-select"
                value={selectedRemoveSectionId}
                onChange={e => setSelectedRemoveSectionId(e.target.value)}
                className="w-full text-sm bg-white border border-[#E1D4CA] rounded-[10px] px-3 py-2.5 text-[#302A2B] shadow-xs focus:ring-2 focus:ring-[#8b2c35]/15 focus:border-[#8b2c35] outline-none font-medium"
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
            <div className="bg-[#F7F1E8]/60 border border-[#E1D4CA] rounded-[12px] p-3.5 space-y-2 text-xs text-[#302A2B]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#302A2B]">Selected Section:</span>
                <Badge color="oxblood" className="text-[11px]">
                  Sem {selectedSectionDetails.semester} — {selectedSectionDetails.name}
                </Badge>
              </div>
              <div className="text-sm font-semibold text-[#302A2B]">
                {selectedSectionDetails.departmentName} ({selectedSectionDetails.departmentCode})
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E1D4CA]/80">
                <div>
                  <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Academic Year</span>
                  <span className="font-medium text-[#302A2B]">Year {selectedSectionDetails.year}</span>
                </div>
                <div>
                  <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Enrolled Students</span>
                  <span className="font-medium text-[#302A2B]">{selectedSectionDetails.studentsCount} students</span>
                </div>
                <div>
                  <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Active Courses</span>
                  <span className="font-medium text-[#302A2B]">{selectedSectionDetails.assignmentsCount} courses</span>
                </div>
                <div>
                  <span className="text-[#79666A] block text-[10px] uppercase font-semibold">Assigned Faculty</span>
                  <span className="font-medium text-[#302A2B]">{selectedSectionDetails.faculty.length} instructors</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#FAF0F2] border border-[#EAD5D9] rounded-[8px] text-[#8b2c35] flex items-start gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-[#8b2c35] flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight font-normal">
                  Warning: Removing this section will permanently remove this class cohort, its student allocations, and faculty assignments.
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-[#E1D4CA] mt-4">
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
