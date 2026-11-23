// ============================================================================
// ACADEXA DYNAMIC CURRICULUM SERVICE
// Fetches database-backed subjects, units, and topics for quiz & item generation
// ============================================================================
import api from '../../../lib/apiClient';
import { CURRICULUM_DATA } from '../constants/curriculumData';

export interface DynamicTopic {
  id: string;
  name: string;
}

export interface DynamicUnit {
  id: string;
  name: string;
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
      topics: { id: string; name: string }[];
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
 * If topics have a "Unit X: ..." prefix, they are grouped by that unit.
 * Otherwise, topics are grouped into clean, logical units.
 */
export function buildUnitsFromTopics(
  subjectId: string,
  subjectName: string,
  rawTopics: { id: string; name: string }[]
): DynamicUnit[] {
  if (!rawTopics || rawTopics.length === 0) {
    return [
      {
        id: `u_${subjectId}_core`,
        name: 'Unit 1: Core Syllabus Topics',
        topics: [
          { id: `top_${subjectId}_1`, name: `${subjectName} Fundamentals` },
          { id: `top_${subjectId}_2`, name: `${subjectName} Applications` },
        ],
      },
    ];
  }

  // Check if topics have a Unit prefix like "Unit 1: Linear Data Structures" or "Unit 2 - Non-Linear Trees"
  const hasUnitPrefix = rawTopics.some(t => /^unit\s*\d+/i.test(t.name));
  if (hasUnitPrefix) {
    const unitMap = new Map<string, DynamicTopic[]>();
    rawTopics.forEach(t => {
      const match = t.name.match(/^(unit\s*\d+[^:\-–]*)[:\-–]?\s*(.*)/i);
      const unitKey = match ? match[1].trim() : 'Unit 1: Core Topics';
      const topicName = match && match[2] ? match[2].trim() : t.name;
      if (!unitMap.has(unitKey)) unitMap.set(unitKey, []);
      unitMap.get(unitKey)!.push({ id: t.id, name: topicName || t.name });
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

  // If topics are individual topics like "Arrays", "Trees", "Stacks & Queues":
  if (rawTopics.length <= 4) {
    return [
      {
        id: `u_${subjectId}_1`,
        name: 'Unit 1: Core Curriculum Topics',
        topics: rawTopics,
      },
    ];
  }

  // Split into 2 units for better categorization
  const midpoint = Math.ceil(rawTopics.length / 2);
  return [
    {
      id: `u_${subjectId}_1`,
      name: 'Unit 1: Foundational Topics',
      topics: rawTopics.slice(0, midpoint),
    },
    {
      id: `u_${subjectId}_2`,
      name: 'Unit 2: Advanced Topics & Applications',
      topics: rawTopics.slice(midpoint),
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
