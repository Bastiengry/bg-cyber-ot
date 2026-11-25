import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COURSE_MODULES } from '@/data/courses';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const DOC_CSS = `
  body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a2230; margin: 32px; line-height: 1.55; }
  h1 { font-size: 26px; margin-bottom: 4px; }
  h2 { font-size: 20px; margin-top: 36px; border-bottom: 2px solid #39d98a; padding-bottom: 6px; }
  h3 { font-size: 16px; margin-top: 24px; margin-bottom: 6px; }
  .subtitle { color: #5b6b7b; font-size: 14px; margin: 0 0 8px 0; }
  .meta { color: #8a97a5; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; }
  .lesson { break-inside: avoid-page; }
  .duration { color: #8a97a5; font-size: 12px; }
  .keys { background: #f0f7f3; border-left: 4px solid #39d98a; padding: 10px 14px; margin: 10px 0 20px 0; }
  .keys-title { font-weight: 700; font-size: 13px; margin: 0 0 6px 0; }
  .keys ul { margin: 0; padding-left: 18px; }
  .keys li { font-size: 13.5px; margin: 3px 0; }
  p { font-size: 14px; margin: 8px 0; }
  footer { margin-top: 48px; border-top: 1px solid #d7dee6; padding-top: 10px; color: #8a97a5; font-size: 11px; }
`;

export function buildCourseHtml(moduleId?: string): string {
  const mods = moduleId ? COURSE_MODULES.filter((m) => m.id === moduleId) : COURSE_MODULES;
  const title = moduleId ? mods[0].title : 'Formation Cybersécurité OT — cours complet';

  const sections = mods
    .map((mod, mi) => {
      const lessons = mod.lessons
        .map(
          (l, li) => `
        <div class="lesson">
          <h3>${mi + 1}.${li + 1} — ${esc(l.title)} <span class="duration">· ${esc(l.duration)}</span></h3>
          ${l.body.map((p) => `<p>${esc(p)}</p>`).join('\n')}
          <div class="keys">
            <p class="keys-title">À retenir</p>
            <ul>${l.keyPoints.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>
          </div>
        </div>`,
        )
        .join('\n');
      return `
      <h2>${mod.emoji} ${mi + 1}. ${esc(mod.title)}</h2>
      <p class="subtitle">${esc(mod.subtitle)} · Niveau : ${esc(mod.level)} · ${mod.lessons.length} leçons</p>
      ${lessons}`;
    })
    .join('\n');

  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>${DOC_CSS}</style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <p class="meta">BG Cyber OT · Entraînement à la cybersécurité industrielle</p>
  ${sections}
  <footer>BG Cyber OT — export du ${esc(date)}. Contenu de formation : à employer dans un cadre légal et pédagogique uniquement.</footer>
</body>
</html>`;
}

async function shareFile(uri: string, mimeType: string, failMessage: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: 'Exporter le cours' });
  } else {
    throw new Error(failMessage);
  }
}

export async function exportCoursePdf(moduleId?: string): Promise<void> {
  const html = buildCourseHtml(moduleId);
  const { uri } = await Print.printToFileAsync({ html });
  await shareFile(uri, 'application/pdf', "Le partage n'est pas disponible sur cet appareil");
}

export async function exportCourseDoc(moduleId?: string): Promise<void> {
  const html = buildCourseHtml(moduleId);
  const name = moduleId ? `bg-cyber-ot-${moduleId}.doc` : 'bg-cyber-ot-cours.doc';
  const file = new FileSystem.File(FileSystem.Paths.cache, name);
  file.write(html);
  await shareFile(file.uri, 'application/msword', "Le partage n'est pas disponible sur cet appareil");
}
