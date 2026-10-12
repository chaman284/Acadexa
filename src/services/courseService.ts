import type { Course, CourseProgressRecord } from '../types/course';
import { mockCourses } from '../data/courses';

const COURSE_PROGRESS_STORAGE_KEY = 'acadexa_course_progress_v1';

export const courseService = {
  getProgressMap: (): Record<string, CourseProgressRecord> => {
    try {
      const stored = localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading course progress from localStorage:', e);
    }

    // Initialize progress map from initial mockCourses
    const initialMap: Record<string, CourseProgressRecord> = {};
    mockCourses.forEach(course => {
      const completedUnits: string[] = [];
      const completedTopics: string[] = [];

      course.units.forEach(unit => {
        if (unit.isCompleted) {
          completedUnits.push(unit.id);
          unit.topics.forEach(t => completedTopics.push(t.id));
        }
      });

      initialMap[course.id] = {
        courseId: course.id,
        completedUnitIds: completedUnits,
        completedTopicIds: completedTopics,
      };
    });

    localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(initialMap));
    return initialMap;
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
          return {
            ...t,
            isCompleted: isDone,
          };
        });

        const allTopicsCompleted = topics.length > 0 && updatedTopics.every(t => t.isCompleted);
        const isUnitCompleted = courseRecord.completedUnitIds.includes(unit.id) || allTopicsCompleted;

        const unitCompletedTopics = updatedTopics.filter(t => t.isCompleted).length;
        const unitProgress = topics.length > 0
          ? Math.round((unitCompletedTopics / topics.length) * 100)
          : (isUnitCompleted ? 100 : 0);

        return {
          ...unit,
          topics: updatedTopics,
          isCompleted: isUnitCompleted,
          unitProgress,
        };
      });

      // Calculate overall course progress percentage
      const totalUnits = enhancedUnits.length;
      let calculatedProgress = 0;

      if (totalTopics > 0) {
        calculatedProgress = Math.round((completedTopicsCount / totalTopics) * 100);
      } else if (totalUnits > 0) {
        const completedUnitsCount = enhancedUnits.filter(u => u.isCompleted).length;
        calculatedProgress = Math.round((completedUnitsCount / totalUnits) * 100);
      } else {
        calculatedProgress = 0;
      }

      return {
        ...course,
        units: enhancedUnits,
        progress: calculatedProgress,
      };
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
    let newCompletedTopicIds: string[];

    if (hasTopic) {
      newCompletedTopicIds = courseRecord.completedTopicIds.filter(id => id !== topicId);
    } else {
      newCompletedTopicIds = [...courseRecord.completedTopicIds, topicId];
    }

    // Find the course and unit to check if all topics in unit are done
    const course = mockCourses.find(c => c.id === courseId);
    const unit = course?.units.find(u => u.id === unitId);
    let newCompletedUnitIds = [...courseRecord.completedUnitIds];

    if (unit) {
      const allDone = unit.topics.every(t => newCompletedTopicIds.includes(t.id));
      if (allDone && !newCompletedUnitIds.includes(unitId)) {
        newCompletedUnitIds.push(unitId);
      } else if (!allDone && newCompletedUnitIds.includes(unitId)) {
        newCompletedUnitIds = newCompletedUnitIds.filter(id => id !== unitId);
      }
    }

    progressMap[courseId] = {
      courseId,
      completedUnitIds: newCompletedUnitIds,
      completedTopicIds: newCompletedTopicIds,
    };

    localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
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
      // Mark unit as not completed, and optionally uncheck all topics in this unit
      newCompletedUnitIds = courseRecord.completedUnitIds.filter(id => id !== unitId);
      if (unit) {
        const unitTopicIds = unit.topics.map(t => t.id);
        newCompletedTopicIds = newCompletedTopicIds.filter(id => !unitTopicIds.includes(id));
      }
    } else {
      // Mark unit as completed and all its topics as completed
      newCompletedUnitIds = [...courseRecord.completedUnitIds, unitId];
      if (unit) {
        unit.topics.forEach(t => {
          if (!newCompletedTopicIds.includes(t.id)) {
            newCompletedTopicIds.push(t.id);
          }
        });
      }
    }

    progressMap[courseId] = {
      courseId,
      completedUnitIds: newCompletedUnitIds,
      completedTopicIds: newCompletedTopicIds,
    };

    localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
    return courseService.getCoursesWithProgress();
  },
};
