import { createElement as h } from 'react';
import { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import PivotLab from '@/labs/pivot-lab';
import DanfossLab from '@/labs/danfoss-lab';
import StuxnetLab from '@/labs/stuxnet-lab';
import ModbusLab from '@/labs/modbus-lab';
import TriageLab from '@/labs/triage-lab';
import ZonageLab from '@/labs/zonage-lab';
import { TRIAGE_LOGS, ZONAGE_ITEMS } from '@/data/labs-data';
import { buttonLabel, pressablesOf, renderUI } from './helpers/render';
import type { ReactTestRenderer } from 'react-test-renderer';

function press(p: { props: { onPress?: () => void } }) {
  return act(async () => {
    p.props.onPress?.();
  });
}

function labelsKey(tree: ReactTestRenderer): string {
  return pressablesOf(tree)
    .map((b) => buttonLabel(b) ?? '')
    .sort()
    .join('|');
}

function jsonOf(tree: ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

/** Lance le scénario depuis l'écran d'intro. */
async function startScenario(tree: ReactTestRenderer, label = 'Lancer le scénario') {
  const start = pressablesOf(tree).find((p) => buttonLabel(p) === label);
  expect(start).toBeTruthy();
  await press(start!);
}

/**
 * Complète un atelier à choix mélangés : essaie chaque choix visible jusqu'à
 * ce que l'écran de réussite apparaisse (le mélange rend l'ordre aléatoire).
 */
async function completeChoiceLab(tree: ReactTestRenderer, maxPresses = 60): Promise<boolean> {
  let tried = new Set<string>();
  let prevKey = labelsKey(tree);
  for (let i = 0; i < maxPresses; i++) {
    if (jsonOf(tree).includes('Scénario réussi ✅')) return true;
    const key = labelsKey(tree);
    if (key !== prevKey) {
      tried.clear();
      prevKey = key;
    }
    const buttons = pressablesOf(tree);
    const untried = buttons.find((b) => !tried.has(buttonLabel(b) ?? ''));
    if (!untried) break;
    tried.add(buttonLabel(untried) ?? '');
    await press(untried);
  }
  return jsonOf(tree).includes('Scénario réussi ✅');
}

describe('Scénarios Pivot IT→OT, Danfoss et Stuxnet — parcours complets', () => {
  it('Pivot : 5 phases franchies jusqu’à l’écran de réussite, onCompleted appelé', async () => {
    const onCompleted = jest.fn();
    const tree = renderUI(h(PivotLab, { onCompleted }));
    await startScenario(tree);
    expect(jsonOf(tree)).toContain('Reconnaissance du VLAN IT');
    expect(jsonOf(tree)).toContain('PC-DEV-12');
    expect(await completeChoiceLab(tree)).toBe(true);
    expect(jsonOf(tree)).toContain('Scénario réussi ✅');
    expect(onCompleted).toHaveBeenCalledTimes(1);
    tree.unmount();
  });

  it('Danfoss : 5 phases franchies jusqu’à l’écran de réussite, onCompleted appelé', async () => {
    const onCompleted = jest.fn();
    const tree = renderUI(h(DanfossLab, { onCompleted }));
    await startScenario(tree);
    expect(jsonOf(tree)).toContain('StoreView');
    expect(await completeChoiceLab(tree)).toBe(true);
    expect(jsonOf(tree)).toContain('Scénario réussi ✅');
    expect(onCompleted).toHaveBeenCalledTimes(1);
    tree.unmount();
  });

  it('Stuxnet : 5 phases franchies jusqu’à l’écran de réussite, onCompleted appelé', async () => {
    const onCompleted = jest.fn();
    const tree = renderUI(h(StuxnetLab, { onCompleted }));
    await startScenario(tree);
    expect(jsonOf(tree)).toContain('Natanz');
    expect(await completeChoiceLab(tree)).toBe(true);
    expect(jsonOf(tree)).toContain('Scénario réussi ✅');
    expect(onCompleted).toHaveBeenCalledTimes(1);
    tree.unmount();
  });
});

describe('ModbusLab — simulateur PLC interactif', () => {
  it('parcours complet : inventaire, baseline, détection, restauration, blocage', async () => {
    jest.useFakeTimers();
    const onCompleted = jest.fn();
    const tree = renderUI(h(ModbusLab, { onCompleted }));
    expect(jsonOf(tree)).toContain('Console Modbus sous attaque');

    // lancement de la simulation
    await startScenario(tree, 'Lancer la simulation');
    expect(jsonOf(tree)).toContain('PLC_P101 — 10.42.1.101:502');

    const sendButton = () => pressablesOf(tree).find((p) => buttonLabel(p) === 'Envoyer la trame')!;
    const selectFc = async (name: string) => {
      const btn = pressablesOf(tree).find((p) => buttonLabel(p) === name);
      expect(btn).toBeTruthy();
      await press(btn!);
    };

    // FC3 par défaut : baseline (objectif 2)
    await press(sendButton());
    expect(jsonOf(tree)).toContain('FC3 read holding registers 40001-40004');

    // FC1 : inventaire des bobines (objectif 1)
    await selectFc('FC1');
    await press(sendButton());
    expect(jsonOf(tree)).toContain('FC1 read coils 0-2');

    // attaque : la station inconnue dérive 40002 (< 60)
    const attack = pressablesOf(tree).find((p) => (buttonLabel(p) ?? '').includes('Simuler le trafic'));
    expect(attack).toBeTruthy();
    await press(attack!);
    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(jsonOf(tree)).toContain('FC6 write register 40002');

    // FC3 : détection de la dérive (objectif 3)
    await selectFc('FC3');
    await press(sendButton());

    // réponse : restauration FC6 registre 2 = 71 puis blocage pare-feu
    await selectFc('FC6');
    const inputs = tree.root.findAll((n) => n.type === TextInput);
    expect(inputs.length).toBe(2);
    await act(async () => {
      inputs[0].props.onChangeText!('2');
    });
    await act(async () => {
      inputs[1].props.onChangeText!('71');
    });
    await press(sendButton());
    expect(jsonOf(tree)).toContain('40002 = 71');

    const block = pressablesOf(tree).find((p) => (buttonLabel(p) ?? '').includes('Bloquer 10.42.8.66'));
    expect(block).toBeTruthy();
    await press(block!);
    expect(jsonOf(tree)).toContain('DENY 10.42.8.66');

    // FC3 final : retour à la normale confirmé (objectif 4)
    await selectFc('FC3');
    await press(sendButton());

    expect(jsonOf(tree)).toContain('Atelier réussi ✅');
    expect(onCompleted).toHaveBeenCalledTimes(1);
    tree.unmount();
    jest.useRealTimers();
  });

  it('FC5 écrit une bobine et rejette les adresses invalides', async () => {
    const onCompleted = jest.fn();
    const tree = renderUI(h(ModbusLab, { onCompleted }));
    await startScenario(tree, 'Lancer la simulation');

    const sendButton = () => pressablesOf(tree).find((p) => buttonLabel(p) === 'Envoyer la trame')!;
    const fc5 = pressablesOf(tree).find((p) => buttonLabel(p) === 'FC5');
    await press(fc5!);
    const inputs = tree.root.findAll((n) => n.type === TextInput);

    // adresse invalide → message d'erreur dans le journal
    await act(async () => {
      inputs[0].props.onChangeText!('9');
    });
    await act(async () => {
      inputs[1].props.onChangeText!('1');
    });
    await press(sendButton());
    expect(jsonOf(tree)).toContain('saisir une bobine entre 0 et 2');

    // écriture valide : coil 1 = 1
    await act(async () => {
      inputs[0].props.onChangeText!('1');
    });
    await press(sendButton());
    expect(jsonOf(tree)).toContain('FC5 write single coil 1 = 1');
    tree.unmount();
  });
});

describe('TriageLab — classement des journaux', () => {
  it('répond correctement à tous les journaux, valide et obtient le score maximal', async () => {
    const onComplete = jest.fn();
    const tree = renderUI(h(TriageLab, { onComplete }));
    expect(jsonOf(tree)).toContain('Classez chaque journal');

    const verdictButtons = pressablesOf(tree).filter((p) =>
      ['Normal', 'Suspect'].includes(buttonLabel(p) ?? ''),
    );
    expect(verdictButtons.length).toBe(TRIAGE_LOGS.length * 2);
    for (let i = 0; i < TRIAGE_LOGS.length; i++) {
      const log = TRIAGE_LOGS[i];
      const target = log.suspicious ? verdictButtons[2 * i + 1] : verdictButtons[2 * i];
      await press(target);
    }

    const validate = pressablesOf(tree).find((p) => (buttonLabel(p) ?? '').startsWith('Valider le triage'));
    expect(validate!.props.disabled).toBe(false);
    await press(validate!);

    expect(jsonOf(tree)).toContain(' corrects');
    expect(onComplete).toHaveBeenCalledWith({ correct: TRIAGE_LOGS.length, total: TRIAGE_LOGS.length });

    // relecture des explications puis relance
    expect(jsonOf(tree)).toContain('Refaire l’atelier');
    tree.unmount();
  });

  it('un triage partiel est signalé comme à revoir', async () => {
    const onComplete = jest.fn();
    const tree = renderUI(h(TriageLab, { onComplete }));
    // répondre tout « Normal » : au moins un journal suspect existe → score < 80 %
    const normalButtons = pressablesOf(tree).filter((p) => buttonLabel(p) === 'Normal');
    for (const b of normalButtons) {
      await press(b);
    }
    const validate = pressablesOf(tree).find((p) => (buttonLabel(p) ?? '').startsWith('Valider le triage'));
    await press(validate!);
    expect(jsonOf(tree)).toContain('Revoyez les explications');
    expect(onComplete).toHaveBeenCalled();
    expect(onComplete.mock.calls[0][0].correct).toBeLessThan(TRIAGE_LOGS.length);
    tree.unmount();
  });
});

describe('ZonageLab — placement des actifs dans les zones Purdue', () => {
  it('place chaque actif dans la bonne zone jusqu’au score final', async () => {
    const onComplete = jest.fn();
    const tree = renderUI(h(ZonageLab, { onComplete }));
    expect(jsonOf(tree)).toContain('ACTIF ');

    for (let i = 0; i < ZONAGE_ITEMS.length; i++) {
      const item = ZONAGE_ITEMS[i];
      const zoneButton = pressablesOf(tree).find((p) => buttonLabel(p) === item.zone);
      expect(zoneButton).toBeTruthy();
      await press(zoneButton!);
      expect(jsonOf(tree)).toContain('Correct');
      const next = pressablesOf(tree).find((p) => buttonLabel(p) === 'Actif suivant');
      await press(next!);
    }

    expect(onComplete).toHaveBeenCalledWith({ correct: ZONAGE_ITEMS.length, total: ZONAGE_ITEMS.length });
    expect(jsonOf(tree)).toContain('Segmentation maîtrisée');
    tree.unmount();
  });

  it('une mauvaise réponse révèle la bonne zone', async () => {
    const onComplete = jest.fn();
    const tree = renderUI(h(ZonageLab, { onComplete }));
    const item = ZONAGE_ITEMS[0];
    const wrongZone = pressablesOf(tree).find((p) => {
      const label = buttonLabel(p);
      return label && label !== item.zone;
    });
    expect(wrongZone).toBeTruthy();
    await press(wrongZone!);
    expect(jsonOf(tree)).toContain(`Réponse : ${item.zone}`);
    tree.unmount();
  });
});
