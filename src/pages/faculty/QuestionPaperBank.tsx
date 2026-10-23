import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Search, FileText, Download, Upload, ChevronDown, ChevronRight,
  Calendar, Clock, Hash, BookOpen, Filter, ChevronLeft, GraduationCap,
  CheckCircle2, AlertCircle, X, FileCheck, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SubjectPaperGroup, PreviousYearPaper } from '../../data/paperBank';
import { paperBankService } from '../../services/paperBankService';
import { useAuth } from '../../context/AuthContext';

const EXAM_TYPE_LABEL: Record<PreviousYearPaper['examType'], string> = {
  'end-sem': 'End Semester',
  'mid-sem': 'Mid Semester',
  'internal': 'Internal',
};

const EXAM_TYPE_COLOR: Record<PreviousYearPaper['examType'], 'oxblood' | 'brass' | 'gray'> = {
  'end-sem': 'oxblood',
  'mid-sem': 'brass',
  'internal': 'gray',
};

// ─── Single Paper Row ────────────────────────────────────────────────────────
const PaperRow: React.FC<{
  paper: PreviousYearPaper;
  accent: string;
  onDownload: (paper: PreviousYearPaper) => void;
  isDownloading: boolean;
}> = ({ paper, accent, onDownload, isDownloading }) => (
  <div
    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-accent)]/40 hover:shadow-sm transition-all duration-150"
  >
    {/* Left: meta */}
    <div className="flex items-start gap-3 min-w-0">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${accent}15`, color: accent }}
      >
        <FileText className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            {paper.year}
          </span>
          <Badge color={EXAM_TYPE_COLOR[paper.examType]} className="text-[10px] py-0 px-1.5">
            {EXAM_TYPE_LABEL[paper.examType]}
          </Badge>
          {paper.fileName && (
            <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-muted)] px-1.5 py-0.5 rounded font-mono truncate max-w-[200px]">
              {paper.fileName}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" /> {paper.totalMarks} Marks
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {paper.duration}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" /> {paper.questionCount} Questions
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />{' '}
            {new Date(paper.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-[var(--color-text-secondary)] font-medium">
            By: {paper.uploadedBy}
          </span>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {paper.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: `${accent}12`, color: accent }}
            >
              {tag}
            </span>
          ))}
          {paper.tags.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium text-[var(--color-text-muted)] bg-[var(--color-muted)]">
              +{paper.tags.length - 4} more
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Right: actions */}
    <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
      {paper.fileSize && (
        <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">{paper.fileSize}</span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDownload(paper)}
        isLoading={isDownloading}
        leftIcon={<Download className="w-3.5 h-3.5" />}
      >
        Download
      </Button>
    </div>
  </div>
);

// ─── Subject Group Card ───────────────────────────────────────────────────────
const SubjectGroup: React.FC<{
  group: SubjectPaperGroup;
  defaultOpen?: boolean;
  onDownloadPaper: (paper: PreviousYearPaper) => void;
  downloadingPaperId: string | null;
}> = ({ group, defaultOpen = false, onDownloadPaper, downloadingPaperId }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Group header — click to expand */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-muted)]/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${group.accentColor}18`, color: group.accentColor }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-[var(--color-text-primary)]">
                {group.subject}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md"
                style={{ background: `${group.accentColor}15`, color: group.accentColor }}
              >
                {group.subjectCode}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-muted)] px-2 py-0.5 rounded-md">
                {group.semester}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {group.papers.length} paper{group.papers.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--color-muted)] text-[var(--color-text-muted)]">
            {group.papers.filter(p => p.examType === 'end-sem').length} End-Sem ·{' '}
            {group.papers.filter(p => p.examType === 'mid-sem').length} Mid-Sem
          </span>
          {isOpen
            ? <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
            : <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          }
        </div>
      </button>

      {/* Papers list */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-3 border-t border-[var(--color-border)] pt-4">
          {group.papers.map(paper => (
            <PaperRow
              key={paper.id}
              paper={paper}
              accent={group.accentColor}
              onDownload={onDownloadPaper}
              isDownloading={downloadingPaperId === paper.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const QuestionPaperBank: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<SubjectPaperGroup[]>([]);
  const [search, setSearch] = useState('');
  const [filterExamType, setFilterExamType] = useState<'all' | PreviousYearPaper['examType']>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  // Async states
  const [downloadingPaperId, setDownloadingPaperId] = useState<string | null>(null);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upload modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadFormData, setUploadFormData] = useState({
    file: null as File | null,
    subjectSelection: 'Data Structures & Algorithms',
    customSubject: '',
    subjectCode: 'CS3101',
    semester: '5th Sem',
    year: '2024-25',
    examType: 'end-sem' as PreviousYearPaper['examType'],
    totalMarks: 100,
    duration: '3 Hours',
    questionCount: 10,
    tagsInput: 'Unit 1, Unit 2, Unit 3, Model Exam',
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    const loaded = paperBankService.getGroups();
    setGroups(loaded);
  };

  // All unique years
  const allYears = useMemo(() => {
    const years = new Set<string>();
    groups.forEach(g => g.papers.forEach(p => years.add(p.year)));
    return ['all', ...Array.from(years).sort().reverse()];
  }, [groups]);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups
      .map(group => ({
        ...group,
        papers: group.papers.filter(paper => {
          const matchSearch =
            !search ||
            group.subject.toLowerCase().includes(search.toLowerCase()) ||
            group.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
            paper.year.includes(search) ||
            paper.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
          const matchType = filterExamType === 'all' || paper.examType === filterExamType;
          const matchYear = filterYear === 'all' || paper.year === filterYear;
          return matchSearch && matchType && matchYear;
        }),
      }))
      .filter(g => g.papers.length > 0);
  }, [groups, search, filterExamType, filterYear]);

  // Flat list of currently filtered papers
  const allFilteredPapers = useMemo(() => {
    return filteredGroups.flatMap(g => g.papers);
  }, [filteredGroups]);

  const totalPapers = allFilteredPapers.length;

  // ─── Single Download Handler ───────────────────────────────────────────────
  const handleDownloadPaper = async (paper: PreviousYearPaper) => {
    setDownloadingPaperId(paper.id);
    try {
      await paperBankService.downloadPaper(paper);
      setFeedback({
        type: 'success',
        message: `Downloaded question paper: ${paper.subject} (${paper.year} ${EXAM_TYPE_LABEL[paper.examType]}).`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to download question paper.',
      });
    } finally {
      setDownloadingPaperId(null);
    }
  };

  // ─── Bulk Download Handler ─────────────────────────────────────────────────
  const handleBulkDownload = async () => {
    if (allFilteredPapers.length === 0) return;
    setIsBulkDownloading(true);
    try {
      const count = await paperBankService.downloadBulkPapers(allFilteredPapers);
      setFeedback({
        type: 'success',
        message: `Successfully downloaded ${count} question paper${count !== 1 ? 's' : ''}.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error occurred during bulk download.',
      });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  // ─── File Selection ────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setFeedback({ type: 'error', message: 'Only PDF documents (.pdf) can be uploaded.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Selected PDF exceeds the 25 MB size limit.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadFormData(prev => ({ ...prev, file }));
    setFeedback(null);
  };

  // ─── Subject Selection sync ────────────────────────────────────────────────
  const handleSubjectDropdownChange = (val: string) => {
    if (val === 'CUSTOM') {
      setUploadFormData(prev => ({
        ...prev,
        subjectSelection: 'CUSTOM',
        customSubject: '',
        subjectCode: '',
      }));
    } else {
      const found = groups.find(g => g.subject === val);
      setUploadFormData(prev => ({
        ...prev,
        subjectSelection: val,
        customSubject: '',
        subjectCode: found ? found.subjectCode : prev.subjectCode,
        semester: found ? found.semester : prev.semester,
      }));
    }
  };

  // ─── Submit Upload ─────────────────────────────────────────────────────────
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.file) {
      setFeedback({ type: 'error', message: 'Please select a PDF question paper file to upload.' });
      return;
    }

    const finalSubject =
      uploadFormData.subjectSelection === 'CUSTOM'
        ? uploadFormData.customSubject.trim()
        : uploadFormData.subjectSelection;

    if (!finalSubject) {
      setFeedback({ type: 'error', message: 'Subject name cannot be empty.' });
      return;
    }

    if (!uploadFormData.subjectCode.trim()) {
      setFeedback({ type: 'error', message: 'Subject code cannot be empty.' });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const tags = uploadFormData.tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const result = await paperBankService.uploadPaper(
        {
          file: uploadFormData.file,
          subject: finalSubject,
          subjectCode: uploadFormData.subjectCode.trim(),
          semester: uploadFormData.semester,
          year: uploadFormData.year,
          examType: uploadFormData.examType,
          totalMarks: uploadFormData.totalMarks,
          duration: uploadFormData.duration,
          questionCount: uploadFormData.questionCount,
          tags,
        },
        user
      );

      setGroups(result.groups);
      setIsUploadModalOpen(false);

      // Reset form
      setUploadFormData({
        file: null,
        subjectSelection: 'Data Structures & Algorithms',
        customSubject: '',
        subjectCode: 'CS3101',
        semester: '5th Sem',
        year: '2024-25',
        examType: 'end-sem',
        totalMarks: 100,
        duration: '3 Hours',
        questionCount: 10,
        tagsInput: 'Unit 1, Unit 2, Unit 3, Model Exam',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';

      setFeedback({
        type: 'success',
        message: `Successfully uploaded "${result.paper.fileName}" to ${result.paper.subject}!`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to upload question paper. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Top bar */}
      <header className="h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/faculty')}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="h-4 w-px bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--color-accent)] rounded-md flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base text-[var(--color-text-primary)]">Question Paper Bank</span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
          leftIcon={<Upload className="w-4 h-4" />}
        >
          Upload Paper
        </Button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6 animate-fade-in-up">
        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`flex items-center justify-between gap-3 p-4 rounded-xl text-sm font-medium transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Papers', value: groups.reduce((s, g) => s + g.papers.length, 0) },
            { label: 'Subjects', value: groups.length },
            { label: 'End-Sem Papers', value: groups.reduce((s, g) => s + g.papers.filter(p => p.examType === 'end-sem').length, 0) },
            { label: 'Mid-Sem Papers', value: groups.reduce((s, g) => s + g.papers.filter(p => p.examType === 'mid-sem').length, 0) },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs"
            >
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters & Actions Bar */}
        <Card padding="none">
          <div className="p-4 flex flex-wrap items-center gap-3">
            {/* Real functional search bar */}
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[var(--color-muted)] rounded-[10px] px-3 py-2">
              <Search className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by subject, code, topic..."
                className="bg-transparent text-sm outline-none w-full text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-[var(--color-text-muted)] hover:text-black">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Exam type filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <select
                value={filterExamType}
                onChange={e => setFilterExamType(e.target.value as typeof filterExamType)}
                className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-[var(--color-surface)] outline-none text-[var(--color-text-primary)] focus:border-[var(--color-accent)]"
              >
                <option value="all">All Types</option>
                <option value="end-sem">End Semester</option>
                <option value="mid-sem">Mid Semester</option>
                <option value="internal">Internal</option>
              </select>
            </div>

            {/* Year filter */}
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-[var(--color-surface)] outline-none text-[var(--color-text-primary)] focus:border-[var(--color-accent)]"
            >
              {allYears.map(y => (
                <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>
              ))}
            </select>

            {/* Bulk Download matching papers */}
            {totalPapers > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
                isLoading={isBulkDownloading}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download Matching ({totalPapers})
              </Button>
            )}

            <span className="text-xs text-[var(--color-text-muted)] ml-auto font-medium">
              {totalPapers} paper{totalPapers !== 1 ? 's' : ''} found
            </span>
          </div>
        </Card>

        {/* Subject groups */}
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
            <FileText className="w-10 h-10 text-[var(--color-text-muted)] mb-3" />
            <p className="text-base font-semibold text-[var(--color-text-primary)]">No question papers found</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Try adjusting your search criteria or upload a new question paper.
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setIsUploadModalOpen(true)}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload Question Paper
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group, i) => (
              <SubjectGroup
                key={group.subjectCode}
                group={group}
                defaultOpen={i === 0 || search.length > 0}
                onDownloadPaper={handleDownloadPaper}
                downloadingPaperId={downloadingPaperId}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Upload Question Paper Modal ─── */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => !isUploading && setIsUploadModalOpen(false)}
        title="Upload Question Paper (PDF)"
        size="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* File input area */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
              Select Question Paper PDF *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-xl p-5 text-center cursor-pointer transition-colors bg-[var(--color-background)]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadFormData.file ? (
                <div className="flex items-center justify-center gap-3 text-emerald-700">
                  <FileCheck className="w-7 h-7 text-emerald-600" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {uploadFormData.file.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {(uploadFormData.file.size / 1024).toFixed(1)} KB · Ready for upload
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Upload className="w-7 h-7 text-[var(--color-text-muted)] mx-auto" />
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Click to browse and select a PDF file
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Supports authentic PDF documents up to 25 MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subject selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Subject Name *
              </label>
              <select
                value={uploadFormData.subjectSelection}
                onChange={e => handleSubjectDropdownChange(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              >
                {groups.map(g => (
                  <option key={g.subjectCode} value={g.subject}>
                    {g.subject} ({g.subjectCode})
                  </option>
                ))}
                <option value="CUSTOM">+ Add New Subject</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Subject / Course Code *
              </label>
              <Input
                value={uploadFormData.subjectCode}
                onChange={e => setUploadFormData({ ...uploadFormData, subjectCode: e.target.value })}
                placeholder="e.g. CS3101"
                required
              />
            </div>
          </div>

          {uploadFormData.subjectSelection === 'CUSTOM' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Custom Subject Title *
              </label>
              <Input
                value={uploadFormData.customSubject}
                onChange={e => setUploadFormData({ ...uploadFormData, customSubject: e.target.value })}
                placeholder="e.g. Artificial Intelligence & Neural Networks"
                required
              />
            </div>
          )}

          {/* Exam metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Semester
              </label>
              <select
                value={uploadFormData.semester}
                onChange={e => setUploadFormData({ ...uploadFormData, semester: e.target.value })}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              >
                <option value="1st Sem">1st Sem</option>
                <option value="2nd Sem">2nd Sem</option>
                <option value="3rd Sem">3rd Sem</option>
                <option value="4th Sem">4th Sem</option>
                <option value="5th Sem">5th Sem</option>
                <option value="6th Sem">6th Sem</option>
                <option value="7th Sem">7th Sem</option>
                <option value="8th Sem">8th Sem</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Exam Type
              </label>
              <select
                value={uploadFormData.examType}
                onChange={e => setUploadFormData({ ...uploadFormData, examType: e.target.value as any })}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              >
                <option value="end-sem">End Semester</option>
                <option value="mid-sem">Mid Semester</option>
                <option value="internal">Internal / CIE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Academic Year
              </label>
              <Input
                value={uploadFormData.year}
                onChange={e => setUploadFormData({ ...uploadFormData, year: e.target.value })}
                placeholder="e.g. 2024-25"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Total Marks
              </label>
              <Input
                type="number"
                value={uploadFormData.totalMarks}
                onChange={e => setUploadFormData({ ...uploadFormData, totalMarks: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Exam Duration
              </label>
              <Input
                value={uploadFormData.duration}
                onChange={e => setUploadFormData({ ...uploadFormData, duration: e.target.value })}
                placeholder="e.g. 3 Hours"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                Number of Questions
              </label>
              <Input
                type="number"
                value={uploadFormData.questionCount}
                onChange={e => setUploadFormData({ ...uploadFormData, questionCount: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Topics / Tags (comma separated)
            </label>
            <Input
              value={uploadFormData.tagsInput}
              onChange={e => setUploadFormData({ ...uploadFormData, tagsInput: e.target.value })}
              placeholder="e.g. B-Trees, Dynamic Programming, Graphs"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isUploading}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload Paper
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
