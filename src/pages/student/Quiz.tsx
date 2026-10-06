import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { QuizCard } from '../../components/dashboard/CourseCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockQuizzes } from '../../data/quizzes';
import { ClipboardList, Clock, HelpCircle, BookOpen, Play } from 'lucide-react';

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const activeQuiz = mockQuizzes.find(q => q.status === 'active');
  const upcomingQuiz = mockQuizzes.find(q => q.status === 'upcoming');
  const completedQuizzes = mockQuizzes.filter(q => q.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Weekly Quiz"
        subtitle="Test your knowledge with weekly assessments"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Weekly Quiz' }]}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Active quiz highlight */}
        <div className="lg:col-span-2">
          {(activeQuiz || upcomingQuiz) && (() => {
            const q = activeQuiz || upcomingQuiz!;
            return (
              <div
                className="card p-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1e2a3b 0%, #2d3f56 100%)' }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
                  style={{ background: 'var(--color-accent)', transform: 'translate(30%,-30%)' }} />

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {activeQuiz && <Badge color="green" dot>Active</Badge>}
                      {!activeQuiz && <Badge color="indigo">Upcoming</Badge>}
                      <Badge color="gray">{q.type}</Badge>
                    </div>
                    <h2 className="text-white text-xl font-bold mb-1">{q.title}</h2>
                    <p className="text-white/60 text-sm">{q.courseName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
                  {[
                    { icon: HelpCircle, label: 'Questions', value: q.questionCount },
                    { icon: Clock, label: 'Duration', value: `${q.duration} min` },
                    { icon: BookOpen, label: 'Difficulty', value: q.difficulty },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                      <stat.icon className="w-4 h-4 text-white/60 mx-auto mb-1" />
                      <p className="text-white font-bold text-lg">{stat.value}</p>
                      <p className="text-white/50 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 relative z-10">
                  {activeQuiz && (
                    <Button
                      onClick={() => navigate(`/student/quiz/${q.id}`)}
                      className="!bg-[var(--color-accent)] !text-white hover:!opacity-90"
                      leftIcon={<Play className="w-4 h-4" />}
                    >
                      Start Quiz
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="!text-white/70 hover:!text-white hover:!bg-white/10"
                  >
                    View Topics
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Quiz stats */}
        <Card>
          <CardHeader title="This Week" />
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-[var(--color-accent)]">78%</div>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Last quiz score</p>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Quizzes completed', value: '4 / 6' },
                { label: 'Questions answered', value: '54' },
                { label: 'Correct answers', value: '42' },
                { label: 'Current streak', value: '7 days' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                  <span className="text-sm text-[var(--color-text-secondary)]">{item.label}</span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Remedial quizzes */}
      {mockQuizzes.filter(q => q.type === 'remedial').length > 0 && (
        <div>
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-3">Practice Quizzes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockQuizzes.filter(q => q.type === 'remedial').map(q => (
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
                onStart={() => navigate(`/student/quiz/${q.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Previous quizzes */}
      <div>
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-3">Previous Quizzes</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedQuizzes.map(q => (
            <QuizCard
              key={q.id}
              title={q.title}
              courseName={q.courseName}
              questionCount={q.questionCount}
              duration={q.duration}
              difficulty={q.difficulty}
              status={q.status}
              scheduledDate={q.scheduledDate}
              onStart={() => navigate(`/student/quiz/${q.id}/result`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
