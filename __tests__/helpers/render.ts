import { act } from 'react';
import { create, type ReactTestRenderer, type ReactTestInstance } from 'react-test-renderer';
import type { ReactElement } from 'react';

/** Arbres encore montés, démontés après chaque test par jest.afterenv.js. */
const mounted = new Set<ReactTestRenderer>();

/**
 * Rend un élément React avec react-test-renderer en flushant le rendu initial
 * dans `act` (obligatoire avec React 19 concurrent : sans cela, `.root` est vide).
 */
export function renderUI(element: ReactElement): ReactTestRenderer {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(element);
  });
  const t = tree!;
  mounted.add(t);
  return t;
}

/** Démonte tous les arbres rendus via renderUI et encore montés. */
export function cleanupAllTrees(): void {
  for (const tree of mounted) {
    try {
      tree.unmount();
    } catch {
      // déjà démonté par le test lui-même
    }
  }
  mounted.clear();
}

function typeName(type: unknown): string | undefined {
  if (typeof type === 'function') {
    return (type as { name?: string }).name;
  }
  if (typeof type === 'object' && type !== null) {
    return (type as { displayName?: string }).displayName;
  }
  return undefined;
}

/**
 * Retrouve les instances Pressable d'un arbre rendu. Sous react-test-renderer,
 * le type réel de l'instance est la fonction interne (memo/forwardRef) de
 * react-native et non la référence importée : on compare donc aussi le nom.
 */
export function pressablesOf(tree: ReactTestRenderer): ReactTestInstance[] {
  return tree.root.findAll((n) => typeName(n.type) === 'Pressable');
}

/**
 * Lit le libellé textuel d'un bouton rendu (le premier enfant Text d'un
 * Pressable). Retourne undefined si le bouton n'a pas de libellé simple.
 */
export function buttonLabel(p: { props: { children?: unknown } }): string | undefined {
  const raw = p.props.children;
  const c = (Array.isArray(raw) ? raw[0] : raw) as { props?: { children?: string } } | undefined;
  return typeof c?.props?.children === 'string' ? c.props.children : undefined;
}
