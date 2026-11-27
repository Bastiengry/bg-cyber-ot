import { existsSync } from 'fs';
import path from 'path';
import { LABS } from '@/data/labs-registry';

const LAB_TO_FILE: Record<string, string> = {
  modbus: 'modbus-lab',
  pivot: 'pivot-lab',
  danfoss: 'danfoss-lab',
  stuxnet: 'stuxnet-lab',
  triage: 'triage-lab',
  zonage: 'zonage-lab',
  opcua: 'opcua-lab',
  zones62443: 'zones62443-lab',
};

describe('LABS — registre des ateliers', () => {
  it('contient au moins 8 ateliers', () => {
    expect(LABS.length).toBeGreaterThanOrEqual(8);
  });

  it('les identifiants sont uniques et non vides', () => {
    const ids = LABS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.trim().length).toBeGreaterThan(0));
  });

  it('chaque atelier a un titre, sous-titre, emoji et tag', () => {
    for (const lab of LABS) {
      expect(lab.title.trim()).not.toBe('');
      expect(lab.subtitle.trim()).not.toBe('');
      expect(lab.emoji.trim()).not.toBe('');
      expect(lab.tag.trim()).not.toBe('');
    }
  });

  it('chaque atelier a un composant de lab implémenté', () => {
    for (const lab of LABS) {
      const file = LAB_TO_FILE[lab.id];
      expect(file).toBeDefined();
      expect(existsSync(path.join(__dirname, '..', 'src', 'labs', `${file}.tsx`))).toBe(true);
    }
  });

  it('les ateliers OPC UA et IEC 62443 sont enregistrés', () => {
    const ids = LABS.map((l) => l.id);
    expect(ids).toContain('opcua');
    expect(ids).toContain('zones62443');
  });
});
