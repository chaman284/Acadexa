import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { FacultySkillGapWorkspace } from '../../components/faculty/FacultySkillGapWorkspace';

export const SkillGapAnalysis: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Skill Gap Analysis"
        subtitle="Class and student mastery for your assigned subject + section pairs"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Skill Gap Analysis' }]}
      />
      <FacultySkillGapWorkspace />
    </div>
  );
};
