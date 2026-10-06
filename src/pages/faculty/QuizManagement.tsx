import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ControlledTabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { QuizCard } from '../../components/dashboard/CourseCard';
import { mockQuizzes } from '../../data/quizzes';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

export const QuizManagement: React.FC = () => {
  const [tab, setTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active & Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'drafts', label: 'Drafts' },
  ];

  const filteredQuizzes = mockQuizzes.filter(q => {
    if (tab === 'active') return q.status === 'active' || q.status === 'upcoming' || q.status === 'scheduled';
    if (tab === 'completed') return q.status === 'completed';
    return false; // mock doesn't have drafts
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Quiz Management"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Quiz Management' }]}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" leftIcon={<CalendarIcon className="w-4 h-4"/>}>Schedule</Button>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4"/>}>Create Quiz</Button>
          </div>
        }
      />

      <div className="flex items-center gap-4 mb-4">
        <ControlledTabs tabs={tabs} activeTab={tab} onChange={setTab} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuizzes.length > 0 ? filteredQuizzes.map(q => (
          <QuizCard
            key={q.id}
            title={q.title}
            courseName={q.courseName}
            questionCount={q.questionCount}
            duration={q.duration}
            difficulty={q.difficulty}
            status={q.status}
            scheduledDate={q.scheduledDate}
            type={q.type}
            onStart={() => console.log('Edit quiz', q.id)}
          />
        )) : (
          <div className="col-span-full py-12 text-center bg-white rounded-[16px] border border-[var(--color-border)]">
            <p className="text-[var(--color-text-muted)] text-sm">No quizzes found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
