// ============================================================================
// ACADEXA QUIZ DETAILS FORM (STEP 1)
// Core metadata, course alignment, target classes, and assessment category
// ============================================================================
import React from 'react';
import { BookOpen, Users, Clock, Calendar, AlertCircle } from 'lucide-react';
import type { QuizCategory, QuizMode, AssignedClass } from '../types/quizTypes';
import { CURRICULUM_DATA, MOCK_CLASSES } from '../constants/curriculumData';

interface QuizDetailsFormProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  category: QuizCategory;
  setCategory: (val: QuizCategory) => void;
  mode: QuizMode;
  setMode: (val: QuizMode) => void;
  semester: number;
  setSemester: (sem: number) => void;
  subjectId: string;
  setSubjectId: (id: string) => void;
  unitIds: string[];
  setUnitIds: (ids: string[]) => void;
  topicIds: string[];
  setTopicIds: (ids: string[]) => void;
  assignedClasses: AssignedClass[];
  setAssignedClasses: (classes: AssignedClass[]) => void;
  scheduledStart: string;
  setScheduledStart: (val: string) => void;
  scheduledEnd: string;
  setScheduledEnd: (val: string) => void;
}

export const QuizDetailsForm: React.FC<QuizDetailsFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  mode,
  setMode,
  semester,
  setSemester,
  subjectId,
  setSubjectId,
  unitIds,
  setUnitIds,
  topicIds,
  setTopicIds,
  assignedClasses,
  setAssignedClasses,
  scheduledStart,
  setScheduledStart,
  scheduledEnd,
  setScheduledEnd,
}) => {
  // Available subjects filtered by semester
  const semesterSubjects = CURRICULUM_DATA.filter(s => s.semester === semester);
  const currentSubject =
    CURRICULUM_DATA.find(s => s.id === subjectId) || semesterSubjects[0] || CURRICULUM_DATA[0];

  // Available classes for semester
  const semesterClasses = MOCK_CLASSES.filter(c => c.semester === semester);

  const toggleClass = (cls: AssignedClass) => {
    const exists = assignedClasses.some(c => c.id === cls.id);
    if (exists) {
      setAssignedClasses(assignedClasses.filter(c => c.id !== cls.id));
    } else {
      setAssignedClasses([...assignedClasses, cls]);
    }
  };

  const toggleUnit = (uId: string) => {
    if (unitIds.includes(uId)) {
      setUnitIds(unitIds.filter(id => id !== uId));
    } else {
      setUnitIds([...unitIds, uId]);
    }
  };

  const toggleTopic = (tId: string) => {
    if (topicIds.includes(tId)) {
      setTopicIds(topicIds.filter(id => id !== tId));
    } else {
      setTopicIds([...topicIds, tId]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Core Identification */}
      <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="font-bold text-slate-900 text-sm">Assessment Scope &amp; Identification</h3>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Quiz Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Unit 2 Continuous Assessment — Non-Linear Tree Structures"
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium text-slate-900"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Instructions / Context for Students
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Specify academic guidelines, allowed resources, or focus areas..."
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* Assessment Category & Mode */}
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Assessment Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as QuizCategory)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="Weekly Assessment">Weekly Assessment</option>
              <option value="Practice Quiz">Practice Quiz</option>
              <option value="Revision Quiz">Revision Quiz</option>
              <option value="Remedial Practice">Remedial Practice</option>
              <option value="Custom">Custom Assessment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Assessment Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('exam')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  mode === 'exam'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Formal Exam Mode
              </button>
              <button
                type="button"
                onClick={() => setMode('practice')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  mode === 'practice'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Gamified Practice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Academic Curriculum Mapping */}
      <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Curriculum &amp; Syllabus Coverage</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Academic Semester
            </label>
            <select
              value={semester}
              onChange={e => {
                const s = Number(e.target.value);
                setSemester(s);
                const firstSubj = CURRICULUM_DATA.find(x => x.semester === s);
                if (firstSubj) {
                  setSubjectId(firstSubj.id);
                  setUnitIds([firstSubj.units[0]?.id || '']);
                  setTopicIds([firstSubj.units[0]?.topics[0]?.id || '']);
                }
              }}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-white text-slate-800 font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Course / Subject
            </label>
            <select
              value={subjectId}
              onChange={e => {
                const sId = e.target.value;
                setSubjectId(sId);
                const found = CURRICULUM_DATA.find(x => x.id === sId);
                if (found) {
                  setUnitIds([found.units[0]?.id || '']);
                  setTopicIds([found.units[0]?.topics[0]?.id || '']);
                }
              }}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-white text-slate-800 font-medium"
            >
              {semesterSubjects.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.code}] {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Units multi-select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Covered Units
          </label>
          <div className="flex flex-wrap gap-2">
            {currentSubject.units.map(u => {
              const isSelected = unitIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleUnit(u.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {u.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics multi-select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Target Topics for Learning-Gap Tracking
          </label>
          <div className="flex flex-wrap gap-2">
            {currentSubject.units
              .filter(u => unitIds.length === 0 || unitIds.includes(u.id))
              .flatMap(u => u.topics)
              .map(t => {
                const isSelected = topicIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopic(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* 3. Class Assignment */}
      <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Assign Target Sections</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Semester {semester} Sections ({assignedClasses.length} selected)
          </span>
        </div>

        {semesterClasses.length === 0 ? (
          <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
            No sections registered for Semester {semester}. You can still create the quiz draft and assign classes later.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {semesterClasses.map(cls => {
              const isSelected = assignedClasses.some(c => c.id === cls.id);
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => toggleClass(cls)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{cls.name}</p>
                    <p className="text-[11px] text-slate-500">{cls.studentsCount} students enrolled</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && '✓'}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Scheduling Window (Optional) */}
      <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm">Assessment Schedule (Optional)</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Opens at (Start Time)</label>
            <input
              type="datetime-local"
              value={scheduledStart}
              onChange={e => setScheduledStart(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Leave blank if quiz should be accessible immediately upon publication.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Closes at (Deadline)</label>
            <input
              type="datetime-local"
              value={scheduledEnd}
              onChange={e => setScheduledEnd(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Assessment submissions lock after this timestamp.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
