import { useCallback, useEffect, useRef, useState } from 'react';
import { attemptService } from '../features/quizzes/services/attemptService';
import type { ExamViolation, ExamViolationType } from '../features/quizzes/types/quizTypes';

interface UseExamProctorOptions {
  enabled: boolean;
  attemptId?: string | null;
  storageKey: string;
  maxSwitches?: number;
  onWarning?: (count: number, maxSwitches: number) => void;
  onAutoSubmit?: (count: number) => void;
  onViolation?: (violation: ExamViolation) => void;
  /** Flush pending work (for example answer saves) before the backend is notified. */
  beforeViolation?: () => void | Promise<unknown>;
}

interface StoredProctorState {
  tabSwitchCount: number;
  violations: ExamViolation[];
}

const normalizeViolations = (value: unknown): ExamViolation[] => {
  if (Array.isArray(value)) {
    return value
      .filter((entry: any) => entry && typeof entry.type === 'string')
      .map((entry: any) => ({
        type: entry.type,
        timestamp: String(entry.timestamp || new Date().toISOString()),
      }));
  }
  if (typeof value === 'string') {
    try {
      return normalizeViolations(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
};

/**
 * Formal-exam integrity hook.
 *
 * - Counts tab switches from visibilitychange, window blur, and leaving the
 *   fullscreen exam view with a debounce lock, so one switch that fires
 *   multiple events is counted once.
 * - Keeps the count in state and a ref, mirrors it to sessionStorage and the
 *   backend on every violation, and restores it after a refresh.
 * - Copy/paste-style violations can be logged through `logViolation()` without
 *   ever touching the tab-switch counter.
 */
export const useExamProctor = ({
  enabled,
  attemptId,
  storageKey,
  maxSwitches = 2,
  onWarning,
  onAutoSubmit,
  onViolation,
  beforeViolation,
}: UseExamProctorOptions) => {
  const readStoredState = useCallback((): StoredProctorState => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          tabSwitchCount: Math.max(0, Number(parsed?.tabSwitchCount || 0)),
          violations: normalizeViolations(parsed?.violations),
        };
      }
    } catch {
      // Ignore unavailable or corrupt session storage.
    }
    return { tabSwitchCount: 0, violations: [] };
  }, [storageKey]);

  const initialState = useRef<StoredProctorState | null>(null);
  if (initialState.current === null) initialState.current = readStoredState();

  const [tabSwitchCount, setTabSwitchCount] = useState(initialState.current.tabSwitchCount);
  const [violations, setViolations] = useState<ExamViolation[]>(initialState.current.violations);

  const countRef = useRef(tabSwitchCount);
  const violationsRef = useRef<ExamViolation[]>(violations);
  const lockRef = useRef(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(!enabled);
  const pendingWarningRef = useRef<number | null>(null);
  const wasFullscreenRef = useRef(false);
  const listenersRef = useRef<{
    visibility: () => void;
    blur: () => void;
    focus: () => void;
    fullscreen: () => void;
  } | null>(null);

  const callbacksRef = useRef({ onWarning, onAutoSubmit, onViolation });
  callbacksRef.current = { onWarning, onAutoSubmit, onViolation };
  const beforeViolationRef = useRef(beforeViolation);
  beforeViolationRef.current = beforeViolation;

  const persistLocal = useCallback(
    (count: number, nextViolations: ExamViolation[]) => {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ tabSwitchCount: count, violations: nextViolations })
        );
      } catch {
        // Session storage is best-effort; the backend remains authoritative.
      }
    },
    [storageKey]
  );

  const detachListeners = useCallback(() => {
    const handlers = listenersRef.current;
    if (!handlers) return;
    document.removeEventListener('visibilitychange', handlers.visibility);
    window.removeEventListener('blur', handlers.blur);
    window.removeEventListener('focus', handlers.focus);
    document.removeEventListener('fullscreenchange', handlers.fullscreen);
    document.removeEventListener('webkitfullscreenchange', handlers.fullscreen);
    listenersRef.current = null;
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    pendingWarningRef.current = null;
    detachListeners();
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    lockRef.current = false;
  }, [detachListeners]);

  const recordViolation = useCallback(
    async (type: ExamViolationType, tabCountAlreadyApplied = false) => {
      const violation: ExamViolation = {
        type,
        timestamp: new Date().toISOString(),
      };

      if (type === 'TAB_SWITCH' && !tabCountAlreadyApplied) {
        countRef.current += 1;
        setTabSwitchCount(countRef.current);
      }

      const nextViolations = [...violationsRef.current, violation];
      violationsRef.current = nextViolations;
      setViolations(nextViolations);
      persistLocal(countRef.current, nextViolations);

      try {
        callbacksRef.current.onViolation?.(violation);
      } catch (error) {
        console.warn('Exam violation callback failed:', error);
      }

      if (!attemptId) return;

      try {
        if (beforeViolationRef.current) await beforeViolationRef.current();
      } catch (error) {
        console.warn('Failed to flush state before logging exam violation:', error);
      }

      try {
        const response = await attemptService.recordViolation(attemptId, type);
        const serverCount = Number(response.data?.tabSwitchCount || 0);
        if (type === 'TAB_SWITCH' && serverCount > countRef.current) {
          countRef.current = serverCount;
          setTabSwitchCount(serverCount);
          persistLocal(serverCount, violationsRef.current);
        }
        const serverViolations = normalizeViolations(response.data?.violations);
        if (serverViolations.length > violationsRef.current.length) {
          violationsRef.current = serverViolations;
          setViolations(serverViolations);
          persistLocal(countRef.current, serverViolations);
        }
      } catch (error) {
        console.warn('Failed to persist exam violation:', error);
      }
    },
    [attemptId, persistLocal]
  );

  const logViolation = useCallback(
    (type: ExamViolationType) => {
      if (stoppedRef.current) return;
      void recordViolation(type);
    },
    [recordViolation]
  );

  const releaseLock = useCallback(() => {
    lockRef.current = false;
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  }, []);

  const flushPendingWarning = useCallback(() => {
    const pending = pendingWarningRef.current;
    if (pending === null || stoppedRef.current) return;
    pendingWarningRef.current = null;
    try {
      callbacksRef.current.onWarning?.(pending, maxSwitches);
    } catch (error) {
      console.warn('Exam warning callback failed:', error);
    }
  }, [maxSwitches]);

  const handleTabSwitch = useCallback(() => {
    if (!enabled || stoppedRef.current || lockRef.current) return;

    lockRef.current = true;
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(releaseLock, 1800);

    const nextCount = countRef.current + 1;
    countRef.current = nextCount;
    setTabSwitchCount(nextCount);
    persistLocal(nextCount, violationsRef.current);
    const persistence = recordViolation('TAB_SWITCH', true);

    if (nextCount > maxSwitches) {
      stop();
      // Wait for the answer flush + backend finalization before redirecting,
      // while keeping the UI locked immediately.
      void persistence.then(() => {
        try {
          callbacksRef.current.onAutoSubmit?.(nextCount);
        } catch (error) {
          console.warn('Exam auto-submit callback failed:', error);
        }
      });
      return;
    }

    // Warnings are shown when the student returns to the exam tab.
    pendingWarningRef.current = nextCount;
  }, [enabled, maxSwitches, persistLocal, recordViolation, releaseLock, stop]);

  // Restore the authoritative backend state after a refresh.
  useEffect(() => {
    if (!enabled || !attemptId) return;
    let cancelled = false;

    attemptService
      .getAttempt(attemptId)
      .then(response => {
        if (cancelled || stoppedRef.current) return;

        const serverCount = Math.max(0, Number(response.data?.tabSwitchCount || 0));
        if (serverCount > countRef.current) {
          countRef.current = serverCount;
          setTabSwitchCount(serverCount);
        }

        const serverViolations = normalizeViolations(response.data?.violations);
        if (serverViolations.length > violationsRef.current.length) {
          violationsRef.current = serverViolations;
          setViolations(serverViolations);
        }
        persistLocal(countRef.current, violationsRef.current);

        if (response.data?.autoSubmitted && response.data?.isSubmitted) {
          stop();
          callbacksRef.current.onAutoSubmit?.(countRef.current);
        }
      })
      .catch(error => {
        console.warn('Failed to restore exam proctor state:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [attemptId, enabled, persistLocal, stop]);

  useEffect(() => {
    if (!enabled) {
      stoppedRef.current = true;
      wasFullscreenRef.current = false;
      detachListeners();
      return;
    }

    stoppedRef.current = false;

    const getFullscreenElement = () =>
      (document as Document & { webkitFullscreenElement?: Element | null }).fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ||
      null;

    // Fullscreen may have been requested by the quiz list before this screen
    // mounted, so seed the flag from the current state instead of assuming the
    // entry event will be observed.
    wasFullscreenRef.current = Boolean(getFullscreenElement());

    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        handleTabSwitch();
      } else {
        flushPendingWarning();
        releaseLock();
      }
    };
    const blurHandler = () => handleTabSwitch();
    const focusHandler = () => {
      flushPendingWarning();
      releaseLock();
    };
    const fullscreenHandler = () => {
      if (getFullscreenElement()) {
        wasFullscreenRef.current = true;
        flushPendingWarning();
        releaseLock();
        return;
      }

      // Only a real exit from an active fullscreen session counts. Ignoring the
      // first null state avoids penalizing browsers that never entered
      // fullscreen or exited it before the proctor attached.
      if (!wasFullscreenRef.current) return;
      wasFullscreenRef.current = false;
      handleTabSwitch();
      // The student is still on the page, so surface the warning immediately.
      flushPendingWarning();
    };

    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('blur', blurHandler);
    window.addEventListener('focus', focusHandler);
    document.addEventListener('fullscreenchange', fullscreenHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenHandler);
    listenersRef.current = {
      visibility: visibilityHandler,
      blur: blurHandler,
      focus: focusHandler,
      fullscreen: fullscreenHandler,
    };

    return () => {
      detachListeners();
    };
  }, [detachListeners, enabled, flushPendingWarning, handleTabSwitch, releaseLock]);

  useEffect(
    () => () => {
      detachListeners();
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    },
    [detachListeners]
  );

  return { tabSwitchCount, violations, logViolation, stop };
};
