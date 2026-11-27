import { COURSE_MODULES } from '@/data/courses';
import { QUIZ_QUESTIONS } from '@/data/quizzes';

describe('QUIZ_QUESTIONS — structure', () => {
  it('contient au moins 50 questions', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(50);
  });

  it('les identifiants de questions sont uniques', () => {
    const ids = QUIZ_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chaque question référence un module de cours existant', () => {
    const moduleIds = new Set(COURSE_MODULES.map((m) => m.id));
    for (const q of QUIZ_QUESTIONS) {
      expect(moduleIds.has(q.moduleId)).toBe(true);
    }
  });

  it('chaque question a au moins 2 options et un index de réponse valide', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.every((o) => o.trim() !== '')).toBe(true);
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(q.options.length);
    }
  });

  it('chaque question a un énoncé et une explication', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.prompt.trim()).not.toBe('');
      expect(q.explanation.trim().length).toBeGreaterThan(10);
    }
  });

  it('chaque module de cours dispose de questions de quiz', () => {
    const withQuestions = new Set(QUIZ_QUESTIONS.map((q) => q.moduleId));
    for (const mod of COURSE_MODULES) {
      expect(withQuestions.has(mod.id)).toBe(true);
    }
  });

  it('les nouveaux modules protocoles/normes ont au moins 5 questions', () => {
    for (const moduleId of ['modbus-tcp', 'opc-ua', 'iec-62443']) {
      const count = QUIZ_QUESTIONS.filter((q) => q.moduleId === moduleId).length;
      expect(count).toBeGreaterThanOrEqual(5);
    }
  });

  it('les questions Modbus couvrent les registres, codes fonction et diode de données', () => {
    const qs = QUIZ_QUESTIONS.filter((q) => q.moduleId === 'modbus-tcp');
    const text = qs.map((q) => q.prompt + ' ' + q.explanation).join(' ');
    expect(text).toContain('40001');
    expect(text).toContain('FC 16');
    expect(text).toContain('diode');
  });

  it('les questions 62443 couvrent 3-2, les SL et les FR', () => {
    const qs = QUIZ_QUESTIONS.filter((q) => q.moduleId === 'iec-62443');
    const text = qs.map((q) => q.prompt + ' ' + q.explanation).join(' ');
    expect(text).toContain('62443-3-2');
    expect(text).toContain('Security Level 3');
    expect(text).toContain('FR1');
  });
});
