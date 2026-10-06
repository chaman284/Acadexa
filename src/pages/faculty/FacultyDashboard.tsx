import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { PerformanceChart } from '../../components/dashboard/PerformanceChart';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ClassSelector, type AssignedClass } from '../../components/faculty/ClassSelector';
import { classWeeklyPerformance, classTopicPerformance, recentActivities, difficultQuestions } from '../../data/analytics';
import type { ClassTopicPerformance, DifficultQuestion } from '../../types/analytics';

const facultyClasses: AssignedClass[] = [
  { id: 'sec_5a_ds', semester: '5th Sem', section: '5A', subject: 'Data Structures', studentsCount: 72 },
  { id: 'sec_5b_ds', semester: '5th Sem', section: '5B', subject: 'Data Structures', studentsCount: 68 },
  { id: 'sec_7c_cc', semester: '7th Sem', section: '7C', subject: 'Cloud Computing', studentsCount: 70 },
  { id: 'sec_3a_db', semester: '3rd Sem', section: '3A', subject: 'Database Systems', studentsCount: 75 },
];

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClassId, setSelectedClassId] = useState(facultyClasses[0].id);

  const selectedClass = facultyClasses.find(c => c.id === selectedClassId) || facultyClasses[0];

  // Dummy dynamic data variation based on selected class
  const classModifier = selectedClass.studentsCount % 5;
  const avgPerformance = 74 + classModifier;
  const pendingReviews = 12 - classModifier;

  const difficultColumns = [
    {
      key: 'questionText', header: 'Question',
      render: (q: DifficultQuestion) => (
        <div className="max-w-md">
          <p className="text-sm text-[var(--color-text-primary)] truncate" title={q.questionText}>{q.questionText}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{selectedClass.subject} · {q.topicName}</p>
        </div>
      ),
    },
    {
      key: 'correctRate', header: 'Correct %',
      render: (q: DifficultQuestion) => (
        <Badge color={q.correctRate < 50 ? 'red' : 'amber'}>{q.correctRate + classModifier}%</Badge>
      ),
    },
    { key: 'attempts', header: 'Attempts' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
          Good morning, Professor 👋
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Here is your class overview for today.
        </p>
      </div>

      <ClassSelector 
        classes={facultyClasses} 
        selectedClassId={selectedClassId} 
        onChange={setSelectedClassId} 
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={selectedClass.studentsCount} icon={<Users className="w-5 h-5" />} accent="navy" />
        <StatCard title="Average Performance" value={`${avgPerformance}%`} trend={classModifier > 2 ? -2 : 5} trendLabel="vs last month" icon={<TrendingUp className="w-5 h-5" />} accent="success" />
        <StatCard title="Active Quizzes" value={classModifier > 3 ? 0 : 1} icon={<FileText className="w-5 h-5" />} accent="indigo" />
        <StatCard title="Pending Reviews" value={pendingReviews} subtitle="Questions to approve" icon={<AlertTriangle className="w-5 h-5" />} accent="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart
            title={`Performance Overview — Section ${selectedClass.section}`}
            weekData={classWeeklyPerformance.map(d => ({ ...d, score: Math.min(100, d.score + classModifier * 2) }))}
            monthData={[]}
            semesterData={[]}
            showClassAverage={false}
          />
          
          <Card>
            <CardHeader title="Most Difficult Questions" subtitle={`Questions where Section ${selectedClass.section} struggles the most`} />
            <DataTable columns={difficultColumns} data={difficultQuestions} keyField="questionId" />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Learning Gap Overview" action={
              <button onClick={() => navigate('/faculty/learning-gaps')} className="text-xs text-[var(--color-accent)] hover:underline">Full Report</button>
            } />
            <div className="space-y-3">
              {classTopicPerformance.slice(0, 5).map(topic => {
                const score = Math.min(100, topic.averageScore + classModifier);
                return (
                  <div key={topic.topicId} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{topic.topicName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{selectedClass.subject}</p>
                    </div>
                    <Badge color={score < 60 ? 'red' : score < 75 ? 'amber' : 'green'}>
                      {score}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" />
            <div className="space-y-4">
              {recentActivities.slice(0, 4).map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activity.type === 'quiz_submitted' ? 'bg-[var(--color-success)]' :
                    activity.type === 'quiz_created' ? 'bg-[var(--color-accent)]' :
                    'bg-[var(--color-warning)]'
                  }`} />
                  <div>
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {activity.type === 'quiz_submitted' 
                        ? `A student from ${selectedClass.section} submitted a quiz.` 
                        : activity.description}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" fullWidth className="mt-4">View All Activity</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
