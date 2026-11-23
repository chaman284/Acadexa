import type { Course, CourseProgressRecord } from '../types/course';
import { mockCourses } from '../data/courses';
import { settingsService } from './settingsService';

const COURSE_PROGRESS_STORAGE_KEY = 'acadexa_course_progress_v1';

// Used when the student turns off "Auto-Save Topic Progress": changes stay for
// the current session only and are discarded on the next reload.
let sessionProgressMap: Record<string, CourseProgressRecord> | null = null;

const initialProgressMap = (): Record<string, CourseProgressRecord> => {
  const map: Record<string, CourseProgressRecord> = {};
  mockCourses.forEach(course => {
    const completedUnits: string[] = [];
    const completedTopics: string[] = [];
    course.units.forEach(unit => {
      if (unit.isCompleted) {
        completedUnits.push(unit.id);
        unit.topics.forEach(t => completedTopics.push(t.id));
      }
    });
    map[course.id] = {
      courseId: course.id,
      completedUnitIds: completedUnits,
      completedTopicIds: completedTopics,
    };
  });
  return map;
};

const readStoredMap = (): Record<string, CourseProgressRecord> => {
  try {
    const stored = localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed reading course progress from localStorage:', e);
  }
  const initial = initialProgressMap();
  localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const autoSaveEnabled = () => settingsService.getLocalSettings('student').autoSaveProgress;

const saveProgressMap = (map: Record<string, CourseProgressRecord>) => {
  if (autoSaveEnabled()) {
    localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(map));
  } else {
    // Keep it in memory only — exactly what the "Auto-Save" toggle promises.
    sessionProgressMap = map;
  }
};

export const courseService = {
  getProgressMap: (): Record<string, CourseProgressRecord> => {
    if (!autoSaveEnabled()) {
      if (!sessionProgressMap) sessionProgressMap = readStoredMap();
      return sessionProgressMap;
    }

    // Auto-save was re-enabled: flush any session-only progress to storage.
    if (sessionProgressMap) {
      localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(sessionProgressMap));
      sessionProgressMap = null;
    }
    return readStoredMap();
  },

  getCoursesWithProgress: (): Course[] => {
    const progressMap = courseService.getProgressMap();

    return mockCourses.map(course => {
      const courseRecord = progressMap[course.id] || {
        courseId: course.id,
        completedUnitIds: [],
        completedTopicIds: [],
      };

      let totalTopics = 0;
      let completedTopicsCount = 0;

      const enhancedUnits = (course.units || []).map(unit => {
        const topics = unit.topics || [];
        totalTopics += topics.length;

        const updatedTopics = topics.map(t => {
          const isDone = courseRecord.completedTopicIds.includes(t.id);
          if (isDone) completedTopicsCount++;
          return { ...t, isCompleted: isDone };
        });

        const allTopicsCompleted = topics.length > 0 && updatedTopics.every(t => t.isCompleted);
        const isUnitCompleted = courseRecord.completedUnitIds.includes(unit.id) || allTopicsCompleted;
        const unitCompletedTopics = updatedTopics.filter(t => t.isCompleted).length;
        const unitProgress = topics.length > 0
          ? Math.round((unitCompletedTopics / topics.length) * 100)
          : (isUnitCompleted ? 100 : 0);

        return { ...unit, topics: updatedTopics, isCompleted: isUnitCompleted, unitProgress };
      });

      const totalUnits = enhancedUnits.length;
      let calculatedProgress = 0;
      if (totalTopics > 0) {
        calculatedProgress = Math.round((completedTopicsCount / totalTopics) * 100);
      } else if (totalUnits > 0) {
        calculatedProgress = Math.round(
          (enhancedUnits.filter(u => u.isCompleted).length / totalUnits) * 100
        );
      }

      return { ...course, units: enhancedUnits, progress: calculatedProgress };
    });
  },

  toggleTopicCompletion: (courseId: string, unitId: string, topicId: string): Course[] => {
    const progressMap = courseService.getProgressMap();
    const courseRecord = progressMap[courseId] || {
      courseId,
      completedUnitIds: [],
      completedTopicIds: [],
    };

    const hasTopic = courseRecord.completedTopicIds.includes(topicId);
    const newCompletedTopicIds = hasTopic
      ? courseRecord.completedTopicIds.filter(id => id !== topicId)
      : [...courseRecord.completedTopicIds, topicId];

    const course = mockCourses.find(c => c.id === courseId);
    const unit = course?.units.find(u => u.id === unitId);
    const newCompletedUnitIds = [...courseRecord.completedUnitIds];

    if (unit) {
      const allDone = unit.topics.every(t => newCompletedTopicIds.includes(t.id));
      if (allDone && !newCompletedUnitIds.includes(unitId)) {
        newCompletedUnitIds.push(unitId);
      } else if (!allDone && newCompletedUnitIds.includes(unitId)) {
        newCompletedUnitIds.splice(newCompletedUnitIds.indexOf(unitId), 1);
      }
    }

    progressMap[courseId] = {
      courseId,
      completedUnitIds: newCompletedUnitIds,
      completedTopicIds: newCompletedTopicIds,
    };
    saveProgressMap(progressMap);
    return courseService.getCoursesWithProgress();
  },

  toggleUnitCompletion: (courseId: string, unitId: string): Course[] => {
    const progressMap = courseService.getProgressMap();
    const courseRecord = progressMap[courseId] || {
      courseId,
      completedUnitIds: [],
      completedTopicIds: [],
    };

    const isCurrentlyCompleted = courseRecord.completedUnitIds.includes(unitId);
    const course = mockCourses.find(c => c.id === courseId);
    const unit = course?.units.find(u => u.id === unitId);

    let newCompletedUnitIds: string[];
    let newCompletedTopicIds = [...courseRecord.completedTopicIds];

    if (isCurrentlyCompleted) {
      newCompletedUnitIds = courseRecord.completedUnitIds.filter(id => id !== unitId);
      if (unit) {
        const unitTopicIds = unit.topics.map(t => t.id);
        newCompletedTopicIds = newCompletedTopicIds.filter(id => !unitTopicIds.includes(id));
      }
    } else {
      newCompletedUnitIds = [...courseRecord.completedUnitIds, unitId];
      if (unit) {
        unit.topics.forEach(t => {
          if (!newCompletedTopicIds.includes(t.id)) newCompletedTopicIds.push(t.id);
        });
      }
    }

    progressMap[courseId] = {
      courseId,
      completedUnitIds: newCompletedUnitIds,
      completedTopicIds: newCompletedTopicIds,
    };
    saveProgressMap(progressMap);
    return courseService.getCoursesWithProgress();
  },
};
