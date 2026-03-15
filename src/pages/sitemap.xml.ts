import { buildAbsoluteUrl, normalizeQuest } from '../lib/quests';

export function GET() {
  const site = new URL('https://drama-birth-quest3.pages.dev');
  const questModules = import.meta.glob('../data/quests/*.json', { eager: true });
  const quests = Object.entries(questModules)
    .map(([filePath, module]) => normalizeQuest(filePath, module))
    .sort((left, right) => left.webPagePath.localeCompare(right.webPagePath));

  const urls = [
    {
      loc: buildAbsoluteUrl('/', site),
      lastmod: new Date().toISOString(),
    },
    ...quests.map((quest) => ({
      loc: buildAbsoluteUrl(quest.webPagePath, site),
      lastmod: quest.updatedAt || quest.createdAt || undefined,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod }) => `  <url>
    <loc>${loc}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
