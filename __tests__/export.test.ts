jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(async () => ({ uri: '/mock/course.pdf' })),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

const mockFileWrite = jest.fn();
jest.mock('expo-file-system', () => {
  class MockFile {
    uri: string;
    write = mockFileWrite;
    constructor(_parent: unknown, name: string) {
      this.uri = '/mock/cache/' + name;
    }
  }
  return {
    File: MockFile,
    Paths: { cache: '/mock/cache' },
  };
});

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildCourseHtml, exportCourseDoc, exportCoursePdf } from '@/lib/export';

const mockedPrint = Print.printToFileAsync as jest.Mock;
const mockedIsAvailable = Sharing.isAvailableAsync as jest.Mock;
const mockedShare = Sharing.shareAsync as jest.Mock;

beforeEach(() => {
  mockedPrint.mockClear();
  mockedIsAvailable.mockClear();
  mockedShare.mockClear();
  mockFileWrite.mockClear();
});

describe('buildCourseHtml', () => {
  it('le document complet contient un sommaire et une ancre par module', () => {
    const html = buildCourseHtml();
    expect(html).toContain('Sommaire');
    expect(html).toContain('cours complet');
    expect(html.match(/id="mod-/g)!.length).toBeGreaterThanOrEqual(10);
  });

  it('le document complet applique un saut de page par module', () => {
    const html = buildCourseHtml();
    expect(html.match(/class="mod"/g)!.length).toBeGreaterThanOrEqual(10);
  });

  it('l’export d’un seul module n’a ni sommaire ni saut de page', () => {
    const html = buildCourseHtml('fondamentaux-ot');
    expect(html).not.toContain('Sommaire');
    expect(html).not.toContain('class="mod"');
    expect(html).toContain('Fondamentaux des environnements OT');
  });

  it('un identifiant inconnu retombe sur le cours complet', () => {
    expect(buildCourseHtml('module-inexistant')).toContain('Sommaire');
  });

  it('échappe le HTML (aucune injection depuis le contenu)', () => {
    const html = buildCourseHtml();
    expect(html).not.toMatch(/<script/i);
  });

  it('inclut les points clés et la durée des leçons', () => {
    const html = buildCourseHtml();
    expect(html).toContain('À retenir');
    expect(html).toMatch(/min/);
  });
});

describe('exportCoursePdf', () => {
  it('génère un PDF et le partage en application/pdf', async () => {
    await exportCoursePdf();
    expect(mockedPrint).toHaveBeenCalledTimes(1);
    expect(mockedShare).toHaveBeenCalledWith(
      '/mock/course.pdf',
      expect.objectContaining({ mimeType: 'application/pdf' }),
    );
  });

  it('exporte un seul module à la demande', async () => {
    await exportCoursePdf('modbus-tcp');
    const htmlArg = mockedPrint.mock.calls[0][0].html as string;
    expect(htmlArg).toContain('Modbus/TCP');
    expect(htmlArg).not.toContain('Sommaire');
  });

  it('lève une erreur explicite si le partage est indisponible', async () => {
    mockedIsAvailable.mockResolvedValueOnce(false);
    await expect(exportCoursePdf()).rejects.toThrow("partage n'est pas disponible");
  });
});

describe('exportCourseDoc', () => {
  it('écrit un document Word-compatible et le partage en msword', async () => {
    await exportCourseDoc();
    expect(mockFileWrite).toHaveBeenCalledTimes(1);
    expect(mockedShare).toHaveBeenCalledWith(
      expect.stringContaining('/mock/cache/'),
      expect.objectContaining({ mimeType: 'application/msword' }),
    );
  });

  it('nomme le fichier complet bg-cyber-ot-cours.doc', async () => {
    await exportCourseDoc();
    expect(mockedShare).toHaveBeenCalledWith(
      '/mock/cache/bg-cyber-ot-cours.doc',
      expect.anything(),
    );
  });

  it('nomme le fichier module avec l’identifiant du module', async () => {
    await exportCourseDoc('opc-ua');
    expect(mockedShare).toHaveBeenCalledWith(
      '/mock/cache/bg-cyber-ot-opc-ua.doc',
      expect.anything(),
    );
  });
});
