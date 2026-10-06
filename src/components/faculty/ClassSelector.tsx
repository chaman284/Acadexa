import React from 'react';
import { BookOpen, Users, ChevronDown } from 'lucide-react';

export interface AssignedClass {
  id: string;
  semester: string;
  section: string;
  subject: string;
  studentsCount: number;
}
export const AssignedClass = {};


interface ClassSelectorProps {
  classes: AssignedClass[];
  selectedClassId: string;
  onChange: (classId: string) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({ classes, selectedClassId, onChange }) => {
  const selected = classes.find(c => c.id === selectedClassId) || classes[0];

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-4 justify-between shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
            Currently Viewing
          </p>
          <div className="flex items-center gap-2 mt-0.5 relative group cursor-pointer">
            <select
              value={selectedClassId}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.semester} - Section {c.section} ({c.subject})
                </option>
              ))}
            </select>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              {selected.semester} · Section {selected.section} <span className="text-[var(--color-text-muted)] font-normal mx-1">|</span> {selected.subject}
              <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
            </h2>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 sm:border-l border-[var(--color-border)] sm:pl-4">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">{selected.studentsCount} Students</span>
        </div>
      </div>
    </div>
  );
};
