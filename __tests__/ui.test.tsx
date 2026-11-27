import { createElement as h } from 'react';
import { create } from 'react-test-renderer';
import { Text } from 'react-native';
import { Card, Pill, PrimaryButton, ProgressBar, Screen, Title } from '@/components/ui';
import { pressablesOf, renderUI } from './helpers/render';

describe('Composants UI', () => {
  it('Title affiche le titre et le sous-titre', () => {
    const tree = renderUI(h(Title, { subtitle: 'Le sous-titre', children: 'Le titre' }));
    expect(tree.root.findByProps({ children: 'Le titre' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Le sous-titre' })).toBeTruthy();
  });

  it('Pill affiche son libellé avec le ton demandé', () => {
    const tree = renderUI(h(Pill, { label: 'SL 3', tone: 'red' }));
    expect(tree.root.findByProps({ children: 'SL 3' })).toBeTruthy();
  });

  it('ProgressBar borne le pourcentage à [0, 100]', () => {
    const over = renderUI(h(ProgressBar, { pct: 150 }));
    const negative = renderUI(h(ProgressBar, { pct: -20 }));
    const widths = [over, negative].map((t) =>
      t.root
        .findAll((n) => {
          const s = n.props.style;
          return Array.isArray(s) && s.some((x: Record<string, unknown>) => x && 'width' in x);
        })
        .map((n) => n.props.style.find((x: Record<string, unknown>) => 'width' in x).width),
    );
    expect(widths[0][0]).toBe('100%');
    expect(widths[1][0]).toBe('0%');
  });

  it('PrimaryButton déclenche onPress quand actif', () => {
    const onPress = jest.fn();
    const tree = renderUI(h(PrimaryButton, { label: 'Exporter', onPress }));
    const [button] = pressablesOf(tree);
    expect(button.props.disabled).toBeFalsy();
    button.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('PrimaryButton transmet l’état désactivé au Pressable', () => {
    const onPress = jest.fn();
    const tree = renderUI(h(PrimaryButton, { label: 'Exporter', onPress, disabled: true }));
    const [button] = pressablesOf(tree);
    expect(button.props.disabled).toBe(true);
  });

  it('Card sans onPress ne rend pas de Pressable', () => {
    const tree = renderUI(h(Card, null, h(Text, null, 'contenu')));
    expect(pressablesOf(tree).length).toBe(0);
    expect(tree.root.findByProps({ children: 'contenu' })).toBeTruthy();
  });

  it('Card avec onPress déclenche le geste de pression', () => {
    const onPress = jest.fn();
    const tree = renderUI(h(Card, { onPress, children: h(Text, null, 'carte cliquable') }));
    const [button] = pressablesOf(tree);
    button.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Screen rend ses enfants (mode scroll et mode fixe)', () => {
    const scroll = renderUI(h(Screen, null, h(Text, null, 'dans la page')));
    expect(scroll.root.findByProps({ children: 'dans la page' })).toBeTruthy();
    const fixed = renderUI(h(Screen, { scroll: false, children: h(Text, null, 'page fixe') }));
    expect(fixed.root.findByProps({ children: 'page fixe' })).toBeTruthy();
  });
});
