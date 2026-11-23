export type LabMeta = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  tag: string;
};

export const LABS: readonly LabMeta[] = [
  {
    id: 'modbus',
    emoji: '🛠️',
    title: 'Console Modbus sous attaque',
    subtitle: 'Inventaire, baseline, détection d’une écriture non autorisée, réponse',
    tag: 'Simulation',
  },
  {
    id: 'pivot',
    emoji: '🕸️',
    title: 'Pivot IT → OT',
    subtitle: 'Attaque par rebond d’un poste bureautique vers l’automate, puis défense',
    tag: 'Attaque + défense',
  },
  {
    id: 'danfoss',
    emoji: '🧊',
    title: 'Dégivrage forcé : Danfoss (2026)',
    subtitle: 'L’incident réel des frigos exposés : rejouez la chaîne d’attaque, puis défendez',
    tag: 'Attaque + défense',
  },
  {
    id: 'triage',
    emoji: '📰',
    title: 'Triage de journaux',
    subtitle: '12 journaux d’un site industriel : normal ou suspect ?',
    tag: 'Analyse SOC',
  },
  {
    id: 'zonage',
    emoji: '🏗️',
    title: 'Zonage Purdue',
    subtitle: 'Placez les actifs d’une usine dans les bonnes zones',
    tag: 'Architecture',
  },
] as const;
