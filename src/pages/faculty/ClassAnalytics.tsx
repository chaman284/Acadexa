import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { FacultySkillGapWorkspace } from '../../components/faculty/FacultySkillGapWorkspace';
import api from '../../lib/apiClient';

/**
 * Faculty analytics has a single view: Skill Gaps.
 * The optional ?view=skill-gaps link is kept for existing/bookmarked URLs,
 * while ?view=overview is retired and redirected here.
 */
export const ClassAnalytics: React.FC = () => {
  const { classId: urlClassId } = useParams<{ classId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sectionLabel, setSectionLabel] = useState('');

  useEffect(() => {
    if (searchParams.get('view') !== 'overview') return;
    const next = new URLSearchParams(searchParams);
    next.delete('view');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let active = true;
    const loadSectionLabel = async () => {
      if (!urlClassId) return;
      try {
        const res = await api.get('/sections/faculty-classes');
        const rows = Array.isArray(res.data) ? res.data : [];
        const match = rows.find((c: any) => c.id === urlClassId || c.sectionId === urlClassId);
        if (active && match) {
          setSectionLabel(
            String(match.section || match.sectionName || '').replace(/^Section\s+/i, ''),
          );
        }
      } catch {
        // Breadcrumb falls back to the class id; the skill-gap view still works.
      }
    };
    void loadSectionLabel();
    return () => { active = false; };
  }, [urlClassId]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Skill Gap Analysis"
        subtitle="Topic mastery, at-risk students and grouped alerts for your assigned subject + section pairs"
        breadcrumbs={[
          { label: 'Overview' },
          ...(urlClassId ? [{ label: sectionLabel || urlClassId }] : []),
          { label: 'Skill Gaps' },
        ]}
      />
      <ErrorBoundary label="Skill Gap Analysis">
        <FacultySkillGapWorkspace compact />
      </ErrorBoundary>
    </div>
  );
};
