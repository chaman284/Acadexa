import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { CourseCard } from '../../components/dashboard/CourseCard';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { mockCourses } from '../../data/courses';
import { BookOpen, CheckCircle, Circle } from 'lucide-react';

export const Courses: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="My Courses"
        subtitle="5th Semester · Computer Science"
        breadcrumbs={[{ label: 'Overview' }, { label: 'My Courses' }]}
      />

      {/* Course grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Detailed course breakdown */}
      <div className="space-y-4">
        <h2 className="font-semibold text-[var(--color-text-primary)]">Unit Progress</h2>
        {mockCourses.map(course => (
          <Card key={course.id} className="overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${course.color}15` }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: course.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{course.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{course.code} · {course.facultyName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--color-text-primary)]">{course.progress}%</p>
                <p className="text-xs text-[var(--color-text-muted)]">completed</p>
              </div>
            </div>

            <ProgressBar value={course.progress} height="sm" className="mb-4" />

            {/* Units */}
            <div className="space-y-2">
              {course.units.map(unit => (
                <div key={unit.id} className="flex items-start gap-3 p-3 bg-[var(--color-muted)] rounded-xl">
                  <div className="mt-0.5">
                    {unit.isCompleted
                      ? <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
                      : <Circle className="w-4 h-4 text-[var(--color-text-muted)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      Unit {unit.unitNumber}: {unit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {unit.topics.map(topic => (
                        <Badge key={topic.id} color="gray" className="text-[10px]">
                          {topic.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge color={unit.isCompleted ? 'green' : 'gray'} className="flex-shrink-0 text-xs">
                    {unit.isCompleted ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
