import { TRIAGE_LOGS, ZONAGE_ITEMS } from '@/data/labs-data';

describe('TRIAGE_LOGS', () => {
  it('contient au moins 12 journaux', () => {
    expect(TRIAGE_LOGS.length).toBeGreaterThanOrEqual(12);
  });

  it('les identifiants sont uniques', () => {
    const ids = TRIAGE_LOGS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chaque journal a horodatage, source, texte et justification', () => {
    for (const log of TRIAGE_LOGS) {
      expect(log.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(log.source.trim()).not.toBe('');
      expect(log.text.trim()).not.toBe('');
      expect(log.why.trim().length).toBeGreaterThan(10);
    }
  });

  it('il y a au moins 3 journaux suspects et 3 normaux', () => {
    expect(TRIAGE_LOGS.filter((l) => l.suspicious).length).toBeGreaterThanOrEqual(3);
    expect(TRIAGE_LOGS.filter((l) => !l.suspicious).length).toBeGreaterThanOrEqual(3);
  });
});

describe('ZONAGE_ITEMS', () => {
  it('contient au moins 8 actifs à classer', () => {
    expect(ZONAGE_ITEMS.length).toBeGreaterThanOrEqual(8);
  });

  it('les identifiants sont uniques', () => {
    const ids = ZONAGE_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
