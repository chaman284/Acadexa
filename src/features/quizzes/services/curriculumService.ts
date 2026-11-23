// ============================================================================
// ACADEXA DYNAMIC CURRICULUM SERVICE
// Fetches database-backed subjects, units, and topics for quiz & item generation
// ============================================================================
import api from '../../../lib/apiClient';
import { CURRICULUM_DATA } from '../constants/curriculumData';

export interface DynamicTopic {
  id: string;
  name: string;
  subtopicId?: string;
  topicId?: string;
}

export interface DynamicUnit {
  id: string;
  name: string;
  moduleNo?: number;
  topics: DynamicTopic[];
}

export interface DynamicSubject {
  id: string;
  code: string;
  name: string;
  semester: number;
  department: string;
  units: DynamicUnit[];
}

export interface FacultyCurriculumResponse {
  facultyId: string | null;
  facultyName: string;
  semesters: number[];
  assignments: {
    id: string;
    semester: number;
    subject: {
      id: string;
      name: string;
      code: string;
      semester: number;
      department: string;
      topics: {
        id: string;
        name: string;
        moduleNo?: number;
        subtopics?: { id: string; name: string }[];
      }[];
    };
    section: {
      id: string;
      name: string;
      sectionName?: string;
      semester: number;
      studentsCount: number;
      department?: string;
    };
  }[];
}

/**
 * Transforms raw topics from the database into structured units.
 * If raw topics contain subtopics (syllabus taxonomy modules),
 * each topic is treated as a Module and its subtopics as Topics.
 * Otherwise, topics are grouped logically into units.
 */
export function buildUnitsFromTopics(
  subjectId: string,
  subjectName: string,
  rawTopics: any[]
): DynamicUnit[] {
  if (!rawTopics || rawTopics.length === 0) {
    return [
      {
        id: `u_${subjectId}_core`,
        name: 'Module 1: Core Syllabus Topics',
        moduleNo: 1,
        topics: [
          { id: `top_${subjectId}_1`, name: `${subjectName} Fundamentals`, topicId: `top_${subjectId}_1` },
          { id: `top_${subjectId}_2`, name: `${subjectName} Applications`, topicId: `top_${subjectId}_2` },
        ],
      },
    ];
  }

  // 1. If topics have subtopics attached (the syllabus taxonomy structure: Module -> Subtopics)
  const hasSubtopics = rawTopics.some(t => Array.isArray(t.subtopics) && t.subtopics.length > 0);
  if (hasSubtopics) {
    return rawTopics.map((t, idx) => {
      const modNo = t.moduleNo || (idx + 1);
      const cleanName = t.name.replace(/^(module|unit)\s*\d+[:\-–]?\s*/i, '').trim();
      const unitName = `Module ${modNo}: ${cleanName || t.name}`;

      const topicsList: DynamicTopic[] = (Array.isArray(t.subtopics) && t.subtopics.length > 0)
        ? t.subtopics.map((st: any) => ({
            id: st.id,
            name: st.name,
            subtopicId: st.id,
            topicId: t.id,
          }))
        : [{ id: t.id, name: t.name, topicId: t.id }];

      return {
        id: t.id,
        name: unitName,
        moduleNo: modNo,
        topics: topicsList,
      };
    });
  }

  // 2. Check if topics have a Unit/Module prefix like "Unit 1: Linear Data Structures" or "Module 2 - ..."
  const hasUnitPrefix = rawTopics.some(t => /^(unit|module)\s*\d+/i.test(t.name));
  if (hasUnitPrefix) {
    const unitMap = new Map<string, DynamicTopic[]>();
    rawTopics.forEach(t => {
      const match = t.name.match(/^((?:unit|module)\s*\d+[^:\-–]*)[:\-–]?\s*(.*)/i);
      const unitKey = match ? match[1].trim() : 'Module 1: Core Topics';
      const topicName = match && match[2] ? match[2].trim() : t.name;
      if (!unitMap.has(unitKey)) unitMap.set(unitKey, []);
      unitMap.get(unitKey)!.push({ id: t.id, name: topicName || t.name, topicId: t.id });
    });

    const units: DynamicUnit[] = [];
    let idx = 1;
    unitMap.forEach((topics, name) => {
      units.push({
        id: `u_${subjectId}_${idx++}`,
        name,
        topics,
      });
    });
    return units;
  }

  // 3. Fallback: individual topics
  if (rawTopics.length <= 4) {
    return [
      {
        id: `u_${subjectId}_1`,
        name: 'Module 1: Core Curriculum Topics',
        moduleNo: 1,
        topics: rawTopics.map(t => ({ id: t.id, name: t.name, topicId: t.id })),
      },
    ];
  }

  // Split into 2 units for better categorization
  const midpoint = Math.ceil(rawTopics.length / 2);
  return [
    {
      id: `u_${subjectId}_1`,
      name: 'Module 1: Foundational Topics',
      moduleNo: 1,
      topics: rawTopics.slice(0, midpoint).map(t => ({ id: t.id, name: t.name, topicId: t.id })),
    },
    {
      id: `u_${subjectId}_2`,
      name: 'Module 2: Advanced Topics & Applications',
      moduleNo: 2,
      topics: rawTopics.slice(midpoint).map(t => ({ id: t.id, name: t.name, topicId: t.id })),
    },
  ];
}

/**
 * Fetch dynamic subjects, units, and topics from the database.
 */
export async function fetchDynamicCurriculum(): Promise<DynamicSubject[]> {
  try {
    const res = await api.get<FacultyCurriculumResponse>('/courses/faculty-curriculum');
    const assignments = res.data?.assignments || [];

    if (assignments.length > 0) {
      const subjectMap = new Map<string, any>();
      assignments.forEach(a => {
        if (a.subject && !subjectMap.has(a.subject.id)) {
          subjectMap.set(a.subject.id, a.subject);
        }
      });

      const dynamicSubjects: DynamicSubject[] = Array.from(subjectMap.values()).map(sub => ({
        id: sub.id,
        code: sub.code,
        name: sub.name,
        semester: sub.semester || 1,
        department: sub.department || 'Artificial Intelligence and Machine Learning',
        units: buildUnitsFromTopics(sub.id, sub.name, sub.topics || []),
      }));

      if (dynamicSubjects.length > 0) {
        return dynamicSubjects;
      }
    }
  } catch (err) {
    console.warn('Faculty curriculum fetch failed, falling back to courses endpoint:', err);
  }

  // Fallback: fetch from /courses endpoint
  try {
    const res = await api.get<any[]>('/courses');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(sub => ({
        id: sub.id,
        code: sub.code,
        name: sub.name,
        semester: sub.semester || 1,
        department: sub.departmentName || 'Artificial Intelligence and Machine Learning',
        units: buildUnitsFromTopics(sub.id, sub.name, sub.topics || []),
      }));
    }
  } catch (err) {
    console.warn('Courses fetch failed, using fallback curriculum:', err);
  }

  // Final fallback to CURRICULUM_DATA if offline
  return CURRICULUM_DATA.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    semester: c.semester,
    department: c.department,
    units: c.units.map(u => ({
      id: u.id,
      name: u.name,
      topics: u.topics.map(t => ({ id: t.id, name: t.name })),
    })),
  }));
}
