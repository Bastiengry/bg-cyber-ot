import { createElement, act } from 'react';
import { create } from 'react-test-renderer';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressProvider, useProgress, type ProgressApi } from '@/lib/progress';

let captured: ProgressApi | null = null;

function Probe() {
  captured = useProgress();
  return createElement(Text, null, 'probe');
}

async function renderProvider() {
  captured = null;
  const tree = create(createElement(ProgressProvider, null, createElement(Probe)));
  await flushMicrotasks();
  return tree;
}

async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  (AsyncStorage.getItem as jest.Mock).mockClear();
  (AsyncStorage.setItem as jest.Mock).mockClear();
});

describe('ProgressProvider', () => {
  it('démarre prêt avec un état vide', async () => {
    const tree = await renderProvider();
    expect(captured).not.toBeNull();
    expect(captured!.ready).toBe(true);
    expect(captured!.state).toEqual({ lessonsDone: [], quizScores: {}, labsDone: [] });
    tree.unmount();
  });

  it('marque une leçon comme faite, sans doublon', async () => {
    const tree = await renderProvider();
    await act(async () => {
      captured!.markLessonDone('lesson-a');
    });
    await act(async () => {
      captured!.markLessonDone('lesson-a');
    });
    expect(captured!.isLessonDone('lesson-a')).toBe(true);
    expect(captured!.isLessonDone('lesson-b')).toBe(false);
    expect(captured!.totals.lessonsDone).toBe(1);
    tree.unmount();
  });

  it('persiste la progression dans AsyncStorage', async () => {
    const tree = await renderProvider();
    await act(async () => {
      captured!.markLessonDone('lesson-b');
      captured!.markLabDone('opcua');
    });
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    const raw = await AsyncStorage.getItem('bg-cyber-ot-progress-v1');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.lessonsDone).toContain('lesson-b');
    expect(parsed.labsDone).toContain('opcua');
    tree.unmount();
  });

  it('restaure la progression au chargement', async () => {
    await AsyncStorage.setItem(
      'bg-cyber-ot-progress-v1',
      JSON.stringify({
        lessonsDone: ['lesson-x'],
        quizScores: { 'modbus-tcp': { correct: 4, total: 5 } },
        labsDone: ['danfoss'],
      }),
    );
    const tree = await renderProvider();
    expect(captured!.isLessonDone('lesson-x')).toBe(true);
    expect(captured!.isLabDone('danfoss')).toBe(true);
    expect(captured!.isQuizDone('modbus-tcp')).toBe(true);
    expect(captured!.totals.lessonsDone).toBe(1);
    expect(captured!.totals.quizDone).toBe(1);
    expect(captured!.totals.labsDone).toBe(1);
    tree.unmount();
  });

  it('marque un atelier comme fait', async () => {
    const tree = await renderProvider();
    await act(async () => {
      captured!.markLabDone('zones62443');
    });
    expect(captured!.isLabDone('zones62443')).toBe(true);
    expect(captured!.totals.labsDone).toBe(1);
    await act(async () => {
      captured!.markLabDone('zones62443');
    });
    expect(captured!.totals.labsDone).toBe(1);
    tree.unmount();
  });

  it('garde le meilleur score de quiz (jamais de régression)', async () => {
    const tree = await renderProvider();
    await act(async () => {
      captured!.saveQuizScore('opc-ua', { correct: 3, total: 5 });
    });
    await act(async () => {
      captured!.saveQuizScore('opc-ua', { correct: 5, total: 5 });
    });
    await act(async () => {
      captured!.saveQuizScore('opc-ua', { correct: 1, total: 5 });
    });
    expect(captured!.state.quizScores['opc-ua']).toEqual({ correct: 5, total: 5 });
    tree.unmount();
  });

  it('calcule les totaux et le pourcentage global', async () => {
    const tree = await renderProvider();
    await act(async () => {
      captured!.saveQuizScore('opc-ua', { correct: 5, total: 5 });
    });
    const t = captured!.totals;
    expect(t.quizBestPct).toBe(100);
    expect(t.lessonsTotal).toBeGreaterThanOrEqual(30);
    expect(t.labsTotal).toBeGreaterThanOrEqual(8);
    expect(t.quizTotal).toBeGreaterThanOrEqual(10);
    expect(t.overallPct).toBeGreaterThan(0);
    expect(t.overallPct).toBeLessThanOrEqual(100);
    tree.unmount();
  });

  it('survit à un stockage corrompu (état vide, app prête)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(async () => '{{pas du json');
    const tree = await renderProvider();
    expect(captured!.ready).toBe(true);
    expect(captured!.state.lessonsDone).toEqual([]);
    tree.unmount();
  });

  it('survit à un échec de lecture AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('storage locked'));
    const tree = await renderProvider();
    expect(captured!.ready).toBe(true);
    tree.unmount();
  });
});
