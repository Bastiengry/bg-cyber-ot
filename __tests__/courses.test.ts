import { COURSE_MODULES } from '@/data/courses';

const VALID_LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];

describe('COURSE_MODULES — structure', () => {
  it('contient au moins 10 modules', () => {
    expect(COURSE_MODULES.length).toBeGreaterThanOrEqual(10);
  });

  it('chaque module a un identifiant unique', () => {
    const ids = COURSE_MODULES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.trim().length).toBeGreaterThan(0));
  });

  it('chaque module a un titre, sous-titre, emoji et niveau valides', () => {
    for (const mod of COURSE_MODULES) {
      expect(mod.title.trim()).not.toBe('');
      expect(mod.subtitle.trim()).not.toBe('');
      expect(mod.emoji.trim()).not.toBe('');
      expect(VALID_LEVELS).toContain(mod.level);
    }
  });

  it('chaque module a au moins 3 leçons', () => {
    for (const mod of COURSE_MODULES) {
      expect(mod.lessons.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('les identifiants de leçons sont uniques (globalement)', () => {
    const lessonIds = COURSE_MODULES.flatMap((m) => m.lessons.map((l) => l.id));
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
  });

  it('chaque leçon a un contenu complet', () => {
    for (const mod of COURSE_MODULES) {
      for (const lesson of mod.lessons) {
        expect(lesson.title.trim()).not.toBe('');
        expect(lesson.body.length).toBeGreaterThanOrEqual(2);
        lesson.body.forEach((p) => expect(p.trim()).not.toBe(''));
        expect(lesson.keyPoints.length).toBeGreaterThanOrEqual(2);
        expect(lesson.duration).toMatch(/^\d+\s?min$/);
      }
    }
  });

  it('les modules de protocoles / normes demandés existent', () => {
    const ids = COURSE_MODULES.map((m) => m.id);
    expect(ids).toContain('modbus-tcp');
    expect(ids).toContain('opc-ua');
    expect(ids).toContain('iec-62443');
    expect(ids).toContain('protocoles-industriels');
  });

  it('le module Modbus/TCP couvre trames, absence d’authentification et durcissement', () => {
    const mod = COURSE_MODULES.find((m) => m.id === 'modbus-tcp')!;
    const titles = mod.lessons.map((l) => l.title.toLowerCase());
    expect(titles.some((t) => t.includes('mbap'))).toBe(true);
    expect(titles.some((t) => t.includes('authentification'))).toBe(true);
    expect(titles.some((t) => t.includes('durcir'))).toBe(true);
  });

  it('le module OPC UA couvre SecurityPolicy / mode None / durcissement', () => {
    const mod = COURSE_MODULES.find((m) => m.id === 'opc-ua')!;
    const text = mod.lessons.map((l) => l.body.join(' ')).join(' ');
    expect(text).toContain('GetEndpoints');
    expect(text).toContain('SignAndEncrypt');
    expect(text).toContain('SecurityPolicy=None');
  });

  it('le module IEC 62443 couvre zones, conduits et Security Levels', () => {
    const mod = COURSE_MODULES.find((m) => m.id === 'iec-62443')!;
    const text = mod.lessons.map((l) => l.body.join(' ')).join(' ');
    expect(text).toContain('62443-3-2');
    expect(text).toContain('conduit');
    expect(text).toContain('Security Level');
    expect(text).toContain('FR1');
  });
});
