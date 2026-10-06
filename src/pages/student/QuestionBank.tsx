import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Card } from '../../components/ui/Card';
import { mockQuestions } from '../../data/quizzes';
import type { Question } from '../../types/quiz';
import { Search, Filter, SlidersHorizontal, Sparkles, BookOpen } from 'lucide-react';

export const QuestionBank: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const filtered = mockQuestions.filter(q => {
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.topicName.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === 'all' || q.courseId === filterSubject;
    const matchDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchSearch && matchSubject && matchDiff;
  });

  const columns = [
    {
      key: 'text', header: 'Question',
      render: (q: Question) => (
        <div className="max-w-md">
          <p className="text-sm text-[var(--color-text-primary)] line-clamp-2">{q.text}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{q.unitName} · {q.topicName}</p>
        </div>
      ),
    },
    {
      key: 'courseName', header: 'Subject',
      render: (q: Question) => (
        <span className="text-sm text-[var(--color-text-secondary)] whitespace-nowrap">{q.courseName}</span>
      ),
    },
    {
      key: 'difficulty', header: 'Difficulty',
      render: (q: Question) => (
        <Badge color={q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'amber' : 'red'} className="capitalize">
          {q.difficulty}
        </Badge>
      ),
    },
    {
      key: 'type', header: 'Type',
      render: (q: Question) => (
        <Badge color="gray" className="capitalize whitespace-nowrap">
          {q.type.replace('-', ' ')}
        </Badge>
      ),
    },
    {
      key: 'isAiGenerated', header: '',
      render: (q: Question) => q.isAiGenerated ? (
        <Badge color="indigo">
          <Sparkles className="w-2.5 h-2.5 mr-1" /> AI
        </Badge>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Question Bank"
        subtitle="Browse and practice questions by subject and topic"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Question Bank' }]}
      />

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[var(--color-muted)] rounded-[10px] px-3 py-2">
            <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="bg-transparent text-sm outline-none w-full text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
            />
          </div>

          {/* Subject filter */}
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-white text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]"
          >
            <option value="all">All Subjects</option>
            <option value="c1">Data Structures</option>
            <option value="c2">DBMS</option>
            <option value="c3">Operating Systems</option>
            <option value="c4">Computer Networks</option>
          </select>

          {/* Difficulty filter */}
          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value)}
            className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-white text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]"
          >
            <option value="all">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <span className="text-sm text-[var(--color-text-muted)]">{filtered.length} questions</span>
        </div>
      </Card>

      {/* Results */}
      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          emptyMessage="No questions match your filters."
        />
      </Card>
    </div>
  );
};
