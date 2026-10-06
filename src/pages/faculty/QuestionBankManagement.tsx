import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { mockQuestions } from '../../data/quizzes';
import type { Question } from '../../types/quiz';
import { Search, Sparkles, Plus, Download, Check, X, Edit2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const QuestionBankManagement: React.FC = () => {
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
  
  const columns = [
    {
      key: 'text', header: 'Question',
      render: (q: Question) => (
        <div className="max-w-md">
          <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2">{q.text}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[var(--color-text-muted)]">{q.courseName} · {q.topicName}</span>
            {q.isAiGenerated && <Badge color="indigo" className="text-[10px] py-0 px-1"><Sparkles className="w-2 h-2 mr-1"/> AI</Badge>}
          </div>
        </div>
      ),
    },
    {
      key: 'difficulty', header: 'Difficulty',
      render: (q: Question) => (
        <Badge color={q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'amber' : 'red'} className="capitalize">{q.difficulty}</Badge>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (q: Question) => (
        <Badge color={q.status === 'approved' ? 'green' : q.status === 'pending' ? 'amber' : 'gray'} className="capitalize">{q.status}</Badge>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: (q: Question) => (
        <div className="flex items-center gap-1">
          {q.status === 'pending' && (
            <>
              <button className="p-1.5 text-[var(--color-success)] hover:bg-[var(--color-success-light)] rounded-md" title="Approve"><Check className="w-4 h-4"/></button>
              <button className="p-1.5 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] rounded-md" title="Reject"><X className="w-4 h-4"/></button>
            </>
          )}
          <button className="p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] rounded-md" title="Edit"><Edit2 className="w-4 h-4"/></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Question Bank Management"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Question Bank' }]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4"/>}>Import</Button>
            <Button variant="secondary" size="sm" onClick={() => setGenerateModalOpen(true)} leftIcon={<Sparkles className="w-4 h-4"/>}>Generate with AI</Button>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4"/>}>Add Question</Button>
          </div>
        }
      />

      <Card padding="none">
        <div className="p-4 border-b border-[var(--color-border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[var(--color-muted)] rounded-[10px] px-3 py-2">
            <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
            <input placeholder="Search questions..." className="bg-transparent text-sm outline-none w-full text-[var(--color-text-primary)]" />
          </div>
          <select className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-white outline-none">
            <option>All Subjects</option>
            <option>Data Structures</option>
          </select>
          <select className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-white outline-none">
            <option>All Status</option>
            <option>Approved</option>
            <option>Pending</option>
          </select>
        </div>
        <DataTable columns={columns} data={mockQuestions} keyField="id" />
      </Card>

      <Modal isOpen={isGenerateModalOpen} onClose={() => setGenerateModalOpen(false)} title="Generate Questions with AI">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Course</label>
              <select className="w-full border border-[var(--color-border)] rounded-[10px] px-3 py-2 text-sm bg-white outline-none focus:border-[var(--color-accent)]">
                <option>Data Structures & Algorithms</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Topic</label>
              <select className="w-full border border-[var(--color-border)] rounded-[10px] px-3 py-2 text-sm bg-white outline-none focus:border-[var(--color-accent)]">
                <option>Graphs - BFS & DFS</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Difficulty</label>
              <select className="w-full border border-[var(--color-border)] rounded-[10px] px-3 py-2 text-sm bg-white outline-none focus:border-[var(--color-accent)]">
                <option>Mixed</option>
                <option>Hard</option>
              </select>
            </div>
            <Input label="Number of Questions" type="number" defaultValue={5} min={1} max={20} />
          </div>
          <Button fullWidth className="mt-2" onClick={() => setGenerateModalOpen(false)} leftIcon={<Sparkles className="w-4 h-4"/>}>
            Generate Questions
          </Button>
        </div>
      </Modal>
    </div>
  );
};
