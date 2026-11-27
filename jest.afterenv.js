import { cleanupAllTrees } from './__tests__/helpers/render';

// Démonte tous les arbres react-test-renderer encore montés après chaque test,
// même en cas d'échec : sinon les setInterval des visuels gardent l'event loop
// actif et Jest ne se termine jamais.
afterEach(() => {
  cleanupAllTrees();
});
