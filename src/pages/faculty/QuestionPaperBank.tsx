import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Search, FileText, Download, Upload, ChevronDown, ChevronRight,
  Calendar, Clock, Hash, BookOpen, Filter, ChevronLeft, GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paperBankGroups } from '../../data/paperBank';
import type { SubjectPaperGroup, PreviousYearPaper } from '../../data/paperBank';

const EXAM_TYPE_LABEL: Record<PreviousYearPaper['examType'], string> = {
  'end-sem': 'End Semester',
  'mid-sem': 'Mid Semester',
  'internal': 'Internal',
};

const EXAM_TYPE_COLOR: Record<PreviousYearPaper['examType'], 'indigo' | 'amber' | 'gray'> = {
  'end-sem': 'indigo',
  'mid-sem': 'amber',
  'internal': 'gray',
};

// ─── Single Paper Row ────────────────────────────────────────────────────────
const PaperRow: React.FC<{ paper: PreviousYearPaper; accent: string }> = ({ paper, accent }) => (
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
      <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
        Download
      </Button>
    </div>
  </div>
);

// ─── Subject Group Card ───────────────────────────────────────────────────────
const SubjectGroup: React.FC<{ group: SubjectPaperGroup; defaultOpen?: boolean }> = ({
  group,
  defaultOpen = false,
}) => {
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
            <PaperRow key={paper.id} paper={paper} accent={group.accentColor} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const QuestionPaperBank: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterExamType, setFilterExamType] = useState<'all' | PreviousYearPaper['examType']>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  // All unique years
  const allYears = useMemo(() => {
    const years = new Set<string>();
    paperBankGroups.forEach(g => g.papers.forEach(p => years.add(p.year)));
    return ['all', ...Array.from(years).sort().reverse()];
  }, []);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return paperBankGroups
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
  }, [search, filterExamType, filterYear]);

  const totalPapers = filteredGroups.reduce((sum, g) => sum + g.papers.length, 0);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Minimal top bar */}
      <header className="h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/faculty')}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors group"
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

        <Button size="sm" leftIcon={<Upload className="w-4 h-4" />}>
          Upload Paper
        </Button>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6 animate-fade-in-up">

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Papers', value: paperBankGroups.reduce((s, g) => s + g.papers.length, 0) },
          { label: 'Subjects', value: paperBankGroups.length },
          { label: 'End-Sem Papers', value: paperBankGroups.reduce((s, g) => s + g.papers.filter(p => p.examType === 'end-sem').length, 0) },
          { label: 'Mid-Sem Papers', value: paperBankGroups.reduce((s, g) => s + g.papers.filter(p => p.examType === 'mid-sem').length, 0) },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card padding="none">
        <div className="p-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[var(--color-muted)] rounded-[10px] px-3 py-2">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by subject, code, topic..."
              className="bg-transparent text-sm outline-none w-full text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
            />
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

          <span className="text-xs text-[var(--color-text-muted)] ml-auto">
            {totalPapers} paper{totalPapers !== 1 ? 's' : ''} found
          </span>
        </div>
      </Card>

      {/* Subject groups */}
      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-10 h-10 text-[var(--color-text-muted)] mb-3" />
          <p className="text-base font-semibold text-[var(--color-text-primary)]">No papers found</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group, i) => (
            <SubjectGroup key={group.subjectCode} group={group} defaultOpen={i === 0} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
