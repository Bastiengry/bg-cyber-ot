import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { COURSE_MODULES } from '@/data/courses';
import { LABS } from '@/data/labs-registry';
import { QUIZ_QUESTIONS } from '@/data/quizzes';
import { TRIAGE_LOGS, ZONAGE_ITEMS } from '@/data/labs-data';

const STORAGE_KEY = 'bg-cyber-ot-progress-v1';

export type QuizScore = { correct: number; total: number };

export type ProgressState = {
  lessonsDone: string[];
  quizScores: Record<string, QuizScore>;
  labsDone: string[];
};

const EMPTY: ProgressState = { lessonsDone: [], quizScores: {}, labsDone: [] };

export type ProgressApi = {
  state: ProgressState;
  ready: boolean;
  markLessonDone: (lessonId: string) => void;
  isLessonDone: (lessonId: string) => boolean;
  saveQuizScore: (moduleId: string, score: QuizScore) => void;
  isQuizDone: (moduleId: string) => boolean;
  markLabDone: (labId: string) => void;
  isLabDone: (labId: string) => boolean;
  totals: {
    lessonsTotal: number;
    lessonsDone: number;
    quizTotal: number;
    quizDone: number;
    quizBestPct: number;
    labsTotal: number;
    labsDone: number;
    overallPct: number;
  };
};

const ProgressContext = createContext<ProgressApi | null>(null);

export const LABS_TOTAL = LABS.length;

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<ProgressState>;
          setState({
            lessonsDone: parsed.lessonsDone ?? [],
            quizScores: parsed.quizScores ?? {},
            labsDone: parsed.labsDone ?? [],
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const markLessonDone = useCallback(
    (lessonId: string) => {
      setState((prev) => {
        if (prev.lessonsDone.includes(lessonId)) return prev;
        const next = { ...prev, lessonsDone: [...prev.lessonsDone, lessonId] };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    },
    [],
  );

  const saveQuizScore = useCallback(
    (moduleId: string, score: QuizScore) => {
      setState((prev) => {
        const previous = prev.quizScores[moduleId];
        if (previous && previous.correct >= score.correct) return prev;
        const next = { ...prev, quizScores: { ...prev.quizScores, [moduleId]: score } };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    },
    [],
  );

  const markLabDone = useCallback((labId: string) => {
    setState((prev) => {
      if (prev.labsDone.includes(labId)) return prev;
      const next = { ...prev, labsDone: [...prev.labsDone, labId] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const totals = useMemo(() => {
    const lessonsTotal = COURSE_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
    const quizTotal = QUIZ_QUESTIONS.length ? new Set(QUIZ_QUESTIONS.map((q) => q.moduleId)).size : 0;
    const quizDone = Object.keys(state.quizScores).length;
    const pctValues = Object.values(state.quizScores).map((s) => (s.total ? s.correct / s.total : 0));
    const quizBestPct = pctValues.length
      ? Math.round((pctValues.reduce((a, b) => a + b, 0) / pctValues.length) * 100)
      : 0;
    const done = state.lessonsDone.length + Object.keys(state.quizScores).length + state.labsDone.length;
    const overall = lessonsTotal + quizTotal + LABS_TOTAL;
    return {
      lessonsTotal,
      lessonsDone: state.lessonsDone.length,
      quizTotal,
      quizDone,
      quizBestPct,
      labsTotal: LABS_TOTAL,
      labsDone: state.labsDone.length,
      overallPct: overall ? Math.round((done / overall) * 100) : 0,
    };
  }, [state]);

  const api: ProgressApi = useMemo(
    () => ({
      state,
      ready,
      markLessonDone,
      isLessonDone: (id: string) => state.lessonsDone.includes(id),
      saveQuizScore,
      isQuizDone: (id: string) => Boolean(state.quizScores[id]),
      markLabDone,
      isLabDone: (id: string) => state.labsDone.includes(id),
      totals,
    }),
    [state, ready, markLessonDone, saveQuizScore, markLabDone, totals],
  );

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

export const TRIAGE_TOTAL = TRIAGE_LOGS.length;
export const ZONAGE_TOTAL = ZONAGE_ITEMS.length;
