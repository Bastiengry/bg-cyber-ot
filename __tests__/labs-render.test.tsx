import { createElement as h } from 'react';
import { create, act } from 'react-test-renderer';
import ChoiceLab, { type LabPhase } from '@/labs/choice-lab';
import { buttonLabel, pressablesOf, renderUI } from './helpers/render';
import OpcUaLab from '@/labs/opcua-lab';
import Zones62443Lab from '@/labs/zones62443-lab';

const PHASES: LabPhase[] = [
  {
    title: 'Phase une',
    brief: 'Description de la première phase',
    commandLines: ['> show run | section vlan'],
    choices: [
      { label: 'Le bon choix', correct: true, feedback: 'Bien joué.' },
      { label: 'Un leurre', correct: false, feedback: 'Non, recommencez.' },
    ],
  },
  {
    title: 'Phase deux',
    brief: 'Dernière phase',
    choices: [
      { label: 'Correct final', correct: true, feedback: 'Terminé.' },
      { label: 'Leurre final', correct: false, feedback: 'Pas encore.' },
    ],
  },
];

function phaseTitleOf(tree: ReturnType<typeof create>): string {
  if (tree.root.findAllByProps({ children: 'Phase une' }).length > 0) return 'une';
  if (tree.root.findAllByProps({ children: 'Phase deux' }).length > 0) return 'deux';
  return 'done';
}

async function startScenario(tree: ReturnType<typeof create>) {
  const start = pressablesOf(tree).find((p) => buttonLabel(p) === 'Lancer le scénario');
  await act(async () => {
    start!.props.onPress();
  });
}

describe('ChoiceLab — moteur des ateliers à choix', () => {
  it('affiche d’abord l’écran d’intro avec le titre, l’intro et le bouton de lancement', () => {
    const tree = renderUI(
      h(ChoiceLab, {
        emoji: '🧪',
        title: 'Atelier de test',
        intro: 'Intro de l’atelier',
        objectives: ['Objectif A', 'Objectif B'],
        phases: PHASES,
        finalNote: 'Note finale',
        onCompleted: jest.fn(),
      }),
    );
    expect(tree.root.findByProps({ children: 'Atelier de test' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Intro de l’atelier' })).toBeTruthy();
    expect(tree.root.findAllByProps({ children: 'Lancer le scénario' }).length).toBeGreaterThan(0);
    // les phases et les objectifs ne sont pas encore visibles
    expect(tree.root.findAllByProps({ children: 'Phase une' }).length).toBe(0);
    expect(JSON.stringify(tree.toJSON())).not.toContain('Objectif A');
    tree.unmount();
  });

  it('le lancement affiche la phase 1 avec tous les choix', async () => {
    const tree = renderUI(
      h(ChoiceLab, {
        emoji: '🧪',
        title: 'T',
        intro: 'I',
        objectives: ['O1'],
        phases: PHASES,
        finalNote: 'Fini',
        onCompleted: jest.fn(),
      }),
    );
    await startScenario(tree);
    expect(tree.root.findByProps({ children: 'Phase une' })).toBeTruthy();
    const labels = pressablesOf(tree).map(buttonLabel);
    expect(labels).toContain('Le bon choix');
    expect(labels).toContain('Un leurre');
    expect(JSON.stringify(tree.toJSON())).toContain('O1');
    tree.unmount();
  });

  it('un choix erroné affiche un retour négatif sans avancer', async () => {
    const tree = renderUI(
      h(ChoiceLab, {
        emoji: '🧪',
        title: 'T',
        intro: 'I',
        objectives: ['O1'],
        phases: PHASES,
        finalNote: 'Fini',
        onCompleted: jest.fn(),
      }),
    );
    await startScenario(tree);
    const wrong = pressablesOf(tree).find((p) => buttonLabel(p) === 'Un leurre');
    await act(async () => {
      wrong!.props.onPress();
    });
    expect(tree.root.findByProps({ children: 'Non, recommencez.' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Phase une' })).toBeTruthy();
    tree.unmount();
  });

  it('compléter toutes les phases déclenche onCompleted et l’écran de réussite', async () => {
    const onCompleted = jest.fn();
    const tree = renderUI(
      h(ChoiceLab, {
        emoji: '🧪',
        title: 'T',
        intro: 'I',
        objectives: ['O1', 'O2'],
        phases: PHASES,
        finalNote: 'Fini',
        onCompleted,
      }),
    );
    await startScenario(tree);
    // presser les boutons en boucle : le bon choix fait avancer, les leurres affichent
    // un retour ; on essaie chaque choix d'une phase avant de réessayer
    let tried = new Set<string>();
    let prevPhase = phaseTitleOf(tree);
    for (let i = 0; i < 12; i++) {
      const done = tree.root.findAllByProps({ children: 'Scénario réussi ✅' });
      if (done.length > 0) break;
      const cur = phaseTitleOf(tree);
      if (cur !== prevPhase) {
        tried.clear();
        prevPhase = cur;
      }
      const buttons = pressablesOf(tree);
      if (buttons.length === 0) break;
      const untried = buttons.find((b) => !tried.has(buttonLabel(b) ?? ''));
      const target = untried ?? buttons[0];
      tried.add(buttonLabel(target) ?? '');
      await act(async () => {
        target.props.onPress();
      });
    }
    expect(tree.root.findAllByProps({ children: 'Scénario réussi ✅' }).length).toBeGreaterThan(0);
    expect(tree.root.findByProps({ children: 'Fini' })).toBeTruthy();
    expect(onCompleted).toHaveBeenCalled();
    tree.unmount();
  });

  it('les commandLines s’affichent dans le terminal après un choix correct', async () => {
    jest.useFakeTimers();
    const tree = renderUI(
      h(ChoiceLab, {
        emoji: '🧪',
        title: 'T',
        intro: 'I',
        objectives: ['O1'],
        phases: PHASES,
        finalNote: 'Fini',
        onCompleted: jest.fn(),
      }),
    );
    await startScenario(tree);
    const good = pressablesOf(tree).find((p) => buttonLabel(p) === 'Le bon choix');
    await act(async () => {
      good!.props.onPress();
    });
    // la commande est « tapée » caractère par caractère (26 ms) : on vide les timers
    await act(async () => {
      jest.runAllTimers();
    });
    expect(tree.root.findByProps({ children: '> show run | section vlan' })).toBeTruthy();
    tree.unmount();
    jest.useRealTimers();
  });
});

describe('Ateliers OPC UA et IEC 62443 — intégration', () => {
  it('OPC UA : lancement, phase 1 avec GetEndpoints dans le brief et les commandes', async () => {
    jest.useFakeTimers();
    const tree = renderUI(h(OpcUaLab, { onCompleted: jest.fn() }));
    await startScenario(tree);
    const text = JSON.stringify(tree.toJSON());
    expect(text).toContain('GetEndpoints');
    // le bon choix déclenche le terminal qui tape les commandes (nmap…)
    const good = pressablesOf(tree).find((p) => (buttonLabel(p) ?? '').includes('GetEndpoints'));
    await act(async () => {
      good!.props.onPress();
    });
    await act(async () => {
      jest.runAllTimers();
    });
    expect(JSON.stringify(tree.toJSON())).toContain('nmap');
    tree.unmount();
    jest.useRealTimers();
  });

  it('IEC 62443 : lancement, phase 1 avec objectifs de zonage', async () => {
    const tree = renderUI(h(Zones62443Lab, { onCompleted: jest.fn() }));
    await startScenario(tree);
    const text = JSON.stringify(tree.toJSON());
    expect(text).toContain('Découper le site en zones');
    tree.unmount();
  });
});
