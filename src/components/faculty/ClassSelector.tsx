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

  if (!selected) {
    return (
      <div
        className="bg-white border-2 border-[#171717] rounded-[12px] p-4 text-center text-sm font-bold text-[#696969] mb-6"
        style={{ boxShadow: '4px 4px 0px #171717' }}
      >
        No assigned classes found.
      </div>
    );
  }

  return (
    <div
      className="bg-white border-2 border-[#171717] rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6"
      style={{ boxShadow: '4px 4px 0px #171717' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 bg-[#FFE66D] border-2 border-[#171717] rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: '2px 2px 0px #171717' }}
        >
          <BookOpen className="w-5 h-5 text-[#171717]" />
        </div>
        <div>
          <p className="text-[11px] font-black text-[#696969] uppercase tracking-wider">
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
            <h2 className="text-base font-black text-[#171717] flex items-center gap-1.5">
              {selected.semester} · Section {selected.section} <span className="text-[#696969] font-normal mx-1">|</span> {selected.subject}
              <ChevronDown className="w-4 h-4 text-[#171717] group-hover:translate-y-0.5 transition-transform" />
            </h2>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 sm:border-l-2 border-[#171717] sm:pl-4">
        <div
          className="flex items-center gap-2 bg-[#E0FAF8] border-2 border-[#171717] rounded-[8px] px-3 py-1.5"
          style={{ boxShadow: '2px 2px 0px #171717' }}
        >
          <Users className="w-4 h-4 text-[#171717]" />
          <span className="text-sm font-black text-[#171717]">{selected.studentsCount} Students</span>
        </div>
      </div>
    </div>
  );
};
