import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { courseService } from '../../services/courseService';
import type { Course, Unit, Topic } from '../../types/course';
import {
  BookOpen, CheckCircle, Circle, ChevronDown, ChevronUp,
  Clock, Check, Search, ArrowLeft, Calendar, User, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

import api from '../../lib/apiClient';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  // selectedCourseId is null initially -> only show enrolled subjects list
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [expandedUnitIds, setExpandedUnitIds] = useState<string[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const list = courseService.getCoursesWithProgress();
    try {
      const res = await api.get('/courses');
      const dbCourses: any[] = res.data;
      if (Array.isArray(dbCourses) && dbCourses.length > 0) {
        const merged: Course[] = list.map(localCourse => {
          const match = dbCourses.find(d => d.code === localCourse.code);
          if (match) {
            return {
              ...localCourse,
              enrollmentStatus: match.enrollmentStatus,
              facultyName: match.assignments?.[0]?.facultyName || localCourse.facultyName,
            };
          }
          return {
            ...localCourse,
            enrollmentStatus: 'Enrolled' as const,
          };
        });

        dbCourses.forEach(dbCourse => {
          const already = merged.some(m => m.code === dbCourse.code);
          if (!already) {
            merged.push({
              id: dbCourse.id,
              name: dbCourse.name,
              code: dbCourse.code,
              semester: dbCourse.assignments?.[0]?.semester || 5,
              department: dbCourse.departmentName || 'Computer Science',
              creditHours: 4,
              facultyId: dbCourse.assignments?.[0]?.facultyId || '',
              facultyName: dbCourse.assignments?.[0]?.facultyName || 'Awaiting Faculty',
              color: '#8b5cf6',
              units: [],
              progress: 0,
              enrollmentStatus: dbCourse.enrollmentStatus || 'Available',
            });
          }
        });
        setCourses(merged);
        return;
      }
    } catch {
      // Keep local list on network error
    }
    setCourses(list.map(c => ({ ...c, enrollmentStatus: 'Enrolled' as const })));
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || null;

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    if (course.units?.length > 0) {
      setExpandedUnitIds([course.units[0].id]);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
  };

  const toggleUnitExpand = (unitId: string) => {
    setExpandedUnitIds(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  const handleToggleTopic = (e: React.MouseEvent, unitId: string, topicId: string) => {
    e.stopPropagation();
    if (!selectedCourse) return;
    const updated = courseService.toggleTopicCompletion(selectedCourse.id, unitId, topicId);
    setCourses(updated);
  };

  const handleToggleUnit = (e: React.MouseEvent, unitId: string) => {
    e.stopPropagation();
    if (!selectedCourse) return;
    const updated = courseService.toggleUnitCompletion(selectedCourse.id, unitId);
    setCourses(updated);
  };

  // Filter courses by search if student types
  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.facultyName.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // Breakdown statistics for selected course
  const totalUnits = selectedCourse?.units?.length || 0;
  const completedUnits = selectedCourse?.units?.filter(u => u.isCompleted).length || 0;
  const remainingUnits = totalUnits - completedUnits;

  const totalTopics = selectedCourse?.units?.reduce((sum, u) => sum + (u.topics?.length || 0), 0) || 0;
  const completedTopics = selectedCourse?.units?.reduce((sum, u) => sum + (u.topics?.filter(t => t.isCompleted).length || 0), 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Dynamic Header depending on whether a course is selected */}
      {!selectedCourse ? (
        <PageHeader
          title="My Courses"
          subtitle="5th Semester · Computer Science · Select a subject to view its syllabus and unit progress"
          breadcrumbs={[{ label: 'Dashboard', to: '/student' }, { label: 'My Courses' }]}
        />
      ) : (
        <PageHeader
          title={`${selectedCourse.name} — Syllabus & Units`}
          subtitle={`${selectedCourse.code} · ${selectedCourse.facultyName} · Unit-wise curriculum breakdown`}
          breadcrumbs={[
            { label: 'Dashboard', to: '/student' },
            { label: 'My Courses', href: '#', to: '/student/courses' },
            { label: selectedCourse.name },
          ]}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToCourses}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to All Courses
            </Button>
          }
        />
      )}

      {/* VIEW 1: ENROLLED SUBJECTS GRID (Visible only when NO subject is selected) */}
      {!selectedCourse && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-[var(--color-text-primary)]">Enrolled Subjects</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Click on any course card below to view its unit portions and track completion.
              </p>
            </div>

            {courses.length > 2 && (
              <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs w-full sm:w-72 shadow-2xs">
                <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
                <input
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                  placeholder="Search subjects or faculty..."
                  className="outline-none bg-transparent w-full text-xs text-[var(--color-text-primary)]"
                />
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className="card p-5 transition-all duration-200 cursor-pointer relative overflow-hidden hover:border-[var(--color-accent)] hover:shadow-md group bg-white"
              >
                {/* Accent Top Strip */}
                <div
                  className="h-1.5 w-full rounded-full mb-4"
                  style={{ background: course.color || 'var(--color-accent)' }}
                />

                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: `${course.color || '#6366f1'}18` }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: course.color || '#6366f1' }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      color={
                        course.enrollmentStatus === 'Enrolled'
                          ? 'green'
                          : course.enrollmentStatus === 'Available'
                          ? 'blue'
                          : 'gray'
                      }
                      className="text-[10px] font-semibold"
                    >
                      {course.enrollmentStatus || 'Enrolled'}
                    </Badge>
                    <Badge color="gray">{course.code}</Badge>
                  </div>
                </div>

                <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1 leading-snug group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                  {course.name}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-1">
                  {course.facultyName}
                </p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--color-text-muted)] font-normal">Syllabus Progress</span>
                    <span className="text-[var(--color-text-primary)]">{course.progress}%</span>
                  </div>
                  <ProgressBar value={course.progress} height="xs" />
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>{course.units?.length || 0} Units</span>
                  <span className="text-[var(--color-accent)] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View Syllabus →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: DEDICATED SYLLABUS & UNIT-WISE PORTION (Visible ONLY for the chosen subject) */}
      {selectedCourse && (
        <div className="space-y-5 animate-fade-in">
          {/* Back Action Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToCourses}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)] hover:underline cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to all enrolled subjects</span>
            </button>
            <span className="text-xs text-[var(--color-text-muted)]">
              Showing syllabus for <strong>{selectedCourse.name}</strong> only
            </span>
          </div>

          <Card className="overflow-hidden">
            {/* Header of Selected Syllabus */}
            <div className="p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-slate-50 to-indigo-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs"
                  style={{ background: `${selectedCourse.color}20` }}
                >
                  <BookOpen className="w-6 h-6" style={{ color: selectedCourse.color }} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{selectedCourse.name}</h2>
                    <Badge color="indigo">{selectedCourse.code}</Badge>
                    <span className="text-xs text-[var(--color-text-muted)]">Credits: {selectedCourse.creditHours || 4}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Faculty: <span className="text-[var(--color-text-secondary)] font-medium">{selectedCourse.facultyName}</span> · {selectedCourse.department}
                  </p>
                </div>
              </div>

              {/* Course Progress Snapshot */}
              <div className="flex items-center gap-6 bg-white p-3.5 rounded-xl border border-[var(--color-border)] shadow-xs">
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)] font-medium">Overall Progress</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-[var(--color-accent)]">{selectedCourse.progress}%</span>
                  </div>
                </div>

                <div className="h-9 w-px bg-[var(--color-border)]" />

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[var(--color-text-secondary)]">{completedUnits} Completed Units</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[var(--color-text-muted)]">{remainingUnits} Remaining Units</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="px-6 py-3 bg-[var(--color-muted)]/40 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between text-xs text-[var(--color-text-secondary)] gap-2">
              <div className="flex items-center gap-4">
                <span><strong>{totalUnits}</strong> Units in Curriculum</span>
                <span>•</span>
                <span><strong>{completedTopics} / {totalTopics}</strong> Topics Completed</span>
              </div>
              <div className="text-[var(--color-text-muted)]">
                💡 Check off units or individual topics to track your study progress.
              </div>
            </div>

            {/* Units and Topics Portion */}
            <div className="p-6 space-y-4">
              {(!selectedCourse.units || selectedCourse.units.length === 0) ? (
                <div className="py-12 text-center">
                  <BookOpen className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">No Syllabus Available</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    The syllabus for this course has not been uploaded yet. Please check back later.
                  </p>
                </div>
              ) : (
                selectedCourse.units.map((unit: Unit) => {
                  const isExpanded = expandedUnitIds.includes(unit.id);
                  const unitCompletedTopics = unit.topics?.filter(t => t.isCompleted).length || 0;
                  const unitTotalTopics = unit.topics?.length || 0;
                  const unitPercent = unit.unitProgress ?? (unit.isCompleted ? 100 : 0);

                  return (
                    <div
                      key={unit.id}
                      className={clsx(
                        'border rounded-2xl transition-all duration-150 overflow-hidden',
                        unit.isCompleted
                          ? 'border-emerald-200 bg-emerald-50/15'
                          : 'border-[var(--color-border)] bg-white'
                      )}
                    >
                      {/* Unit Header Bar */}
                      <div
                        onClick={() => toggleUnitExpand(unit.id)}
                        className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox for entire unit */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleUnit(e, unit.id)}
                            className={clsx(
                              'w-6 h-6 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
                              unit.isCompleted
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'border-2 border-[var(--color-border)] hover:border-emerald-400 text-transparent'
                            )}
                            title={unit.isCompleted ? 'Mark Unit as Pending' : 'Mark Entire Unit Complete'}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Unit {unit.unitNumber}
                              </span>
                              <span className="font-bold text-sm text-[var(--color-text-primary)] truncate">
                                {unit.name}
                              </span>
                              <Badge color={unit.isCompleted ? 'green' : 'gray'} className="text-[10px]">
                                {unit.isCompleted ? 'Completed' : 'In Progress'}
                              </Badge>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                              {unitCompletedTopics} of {unitTotalTopics} topics completed · {unitPercent}%
                            </p>
                          </div>
                        </div>

                        {/* Progress bar and toggle arrow */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="hidden sm:block w-28">
                            <ProgressBar value={unitPercent} height="xs" color={unit.isCompleted ? 'green' : 'indigo'} />
                          </div>
                          <div className="text-[var(--color-text-muted)]">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Topics Checklist (Collapsible) */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]/60 bg-slate-50/50">
                          <div className="space-y-2 mt-2">
                            <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                              Unit Topics ({unit.topics?.length || 0})
                            </p>
                            {unit.topics?.map((topic: Topic) => (
                              <div
                                key={topic.id}
                                onClick={(e) => handleToggleTopic(e, unit.id, topic.id)}
                                className={clsx(
                                  'flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors cursor-pointer select-none',
                                  topic.isCompleted
                                    ? 'bg-white border-emerald-200 text-slate-800'
                                    : 'bg-white border-[var(--color-border)] hover:border-[var(--color-accent)] text-slate-700'
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={clsx(
                                      'w-4 h-4 rounded flex items-center justify-center transition-colors flex-shrink-0',
                                      topic.isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : 'border border-[var(--color-border)]'
                                    )}
                                  >
                                    {topic.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={clsx('font-medium truncate', topic.isCompleted && 'line-through text-slate-400')}>
                                    {topic.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge
                                    color={
                                      topic.difficulty === 'easy' ? 'green' :
                                      topic.difficulty === 'medium' ? 'amber' : 'red'
                                    }
                                    className="text-[9px] py-0 px-1.5 capitalize"
                                  >
                                    {topic.difficulty}
                                  </Badge>
                                  <span className={clsx('text-[11px] font-semibold', topic.isCompleted ? 'text-emerald-600' : 'text-slate-400')}>
                                    {topic.isCompleted ? 'Done' : 'To do'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
